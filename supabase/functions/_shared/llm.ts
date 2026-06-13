// Shared LLM helper for all GTM-DaybyDay edge functions.
// Calls MiniMax directly via its Anthropic-compatible API.
// (Cloudflare AI Gateway is set up as a future option but the provider
//  config has to be done in the Cloudflare dashboard before it can route.)
//
// Env vars (set via `supabase secrets set`):
//   MINIMAX_API_KEY        the sk-cp-... Anthropic-format key
//   MINIMAX_BASE_URL       (optional) override; default https://api.minimax.io/anthropic
//   MINIMAX_MODEL          (optional) override; default MiniMax-M3
//   GEMINI_API_KEY         direct Gemini fallback when MiniMax fails
//   GEMINI_DIRECT_URL      (optional) override; default https://generativelanguage.googleapis.com/v1beta

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type LlmOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormatJson?: boolean;
  noFallback?: boolean;
};

const DEFAULT_BASE_URL = "https://api.minimax.io/anthropic";
const DEFAULT_MODEL = "MiniMax-M3";
const FALLBACK_MODEL = "gemini-2.5-flash";

function getApiKey(): string | null {
  return Deno.env.get("MINIMAX_API_KEY") || null;
}
function getBaseUrl(): string {
  return Deno.env.get("MINIMAX_BASE_URL") || DEFAULT_BASE_URL;
}
function getModel(): string {
  return Deno.env.get("MINIMAX_MODEL") || DEFAULT_MODEL;
}
function getGeminiKey(): string | null {
  return Deno.env.get("GEMINI_API_KEY") || null;
}
function getGeminiUrl(): string {
  return Deno.env.get("GEMINI_DIRECT_URL") || "https://generativelanguage.googleapis.com/v1beta";
}

type AnthropicBlock = { type: "text"; text: string };
type AnthropicMessage = { role: "user" | "assistant"; content: string | AnthropicBlock[] };
type AnthropicRequest = {
  model: string;
  max_tokens: number;
  system?: string;
  messages: AnthropicMessage[];
  temperature?: number;
  thinking?: { type: "disabled" } | { type: "adaptive" };
};
type AnthropicResponse = {
  content: Array<{ type: "text" | "thinking"; text?: string; thinking?: string }>;
};

function toAnthropic(messages: ChatMessage[]): { system?: string; messages: AnthropicMessage[] } {
  let system: string | undefined;
  const out: AnthropicMessage[] = [];
  for (const m of messages) {
    if (m.role === "system") {
      system = (system ? system + "\n\n" : "") + m.content;
    } else {
      out.push({ role: m.role as "user" | "assistant", content: [{ type: "text", text: m.content }] });
    }
  }
  return { system, messages: out };
}

function extractText(resp: AnthropicResponse): string {
  const parts: string[] = [];
  for (const b of resp.content) {
    if (b.type === "text" && b.text) parts.push(b.text);
    // Skip thinking blocks; they are not user-facing content
  }
  return parts.join("");
}

export async function callLlm(
  messages: ChatMessage[],
  opts: LlmOptions = {},
): Promise<{ text: string; provider: "minimax" | "gemini"; model: string }> {
  const model = opts.model || getModel();
  const maxTokens = opts.maxTokens ?? 2500;
  const temperature = opts.temperature ?? 0.7;
  const maxRetries = opts.responseFormatJson ? 1 : 1;

  // 1) Try MiniMax (Anthropic-compatible), with retry on transport errors AND parse failures
  const apiKey = getApiKey();
  if (apiKey) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { system, messages: aMsgs } = toAnthropic(messages);
        const body: AnthropicRequest = {
          model,
          max_tokens: maxTokens,
          messages: aMsgs,
          temperature,
          thinking: { type: "disabled" },
        };
        if (system) body.system = system;
        const url = `${getBaseUrl().replace(/\/$/, "")}/v1/messages`;
        const r = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify(body),
        });
        if (r.ok) {
          const data = (await r.json()) as AnthropicResponse;
          const text = extractText(data);
          if (opts.responseFormatJson && !looksLikeJson(text)) {
            console.warn(`[llm] MiniMax response not parseable JSON (attempt ${attempt}/${maxRetries}), retrying. First 200: ${text.slice(0, 200)}`);
            if (attempt < maxRetries) {
              await new Promise((res) => setTimeout(res, 1000 * attempt));
              continue;
            }
            // Last attempt — return as-is and let caller decide.
          }
          return { text, provider: "minimax", model };
        }
        const errTxt = await r.text().catch(() => "");
        console.warn(`[llm] MiniMax ${model} HTTP ${r.status} (attempt ${attempt}/${maxRetries}): ${errTxt.slice(0, 200)}`);
      } catch (e) {
        console.warn(`[llm] MiniMax threw (attempt ${attempt}/${maxRetries}):`, e instanceof Error ? e.message : e);
      }
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }
  } else {
    console.warn("[llm] MINIMAX_API_KEY not set; skipping MiniMax");
  }

  if (opts.noFallback) {
    throw new Error("MiniMax unavailable and noFallback=true");
  }

  // 2) Fallback: Gemini direct
  const geminiKey = getGeminiKey();
  if (!geminiKey) {
    throw new Error("MiniMax unavailable and GEMINI_API_KEY not set");
  }
  const url = `${getGeminiUrl().replace(/\/$/, "")}/openai/chat/completions`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${geminiKey}`,
    },
    body: JSON.stringify({
      model: FALLBACK_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(opts.responseFormatJson ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Gemini fallback failed: HTTP ${r.status} ${t.slice(0, 200)}`);
  }
  const data = await r.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  return { text, provider: "gemini", model: FALLBACK_MODEL };
}

function looksLikeJson(s: string): boolean {
  if (!s) return false;
  const t = s.trim();
  if (!t.startsWith("{") && !t.startsWith("[")) return false;
  // Try parsing; if it works, it's JSON
  try { JSON.parse(t); return true; } catch { return false; }
}

export async function callLlmText(messages: ChatMessage[], opts: LlmOptions = {}): Promise<string> {
  const { text } = await callLlm(messages, opts);
  return text;
}
