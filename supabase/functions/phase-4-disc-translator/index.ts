import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callLlm } from "../_shared/llm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const inputSchema = z.object({
  projectId: z.string().uuid(),
  offers: z.union([z.array(z.any()), z.record(z.any())]).optional(),
  persona: z.record(z.any()).optional(),
  outputLanguage: z.enum(['es', 'en']).default('es')
});

const outputSchema = z.object({
  discTable: z.array(z.object({
    offer: z.string(),
    red: z.object({ copy: z.string(), tone: z.string(), channel: z.string(), purpose: z.string(), buyingBehavior: z.string() }),
    yellow: z.object({ copy: z.string(), tone: z.string(), channel: z.string(), purpose: z.string(), buyingBehavior: z.string() }),
    green: z.object({ copy: z.string(), tone: z.string(), channel: z.string(), purpose: z.string(), buyingBehavior: z.string() }),
    blue: z.object({ copy: z.string(), tone: z.string(), channel: z.string(), purpose: z.string(), buyingBehavior: z.string() }),
  })).min(1),
  discMap: z.object({
    red: z.number().min(0).max(1),
    yellow: z.number().min(0).max(1),
    green: z.number().min(0).max(1),
    blue: z.number().min(0).max(1),
  }),
});


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, offers, persona, outputLanguage } = inputSchema.parse(body);

    // Rate limiting (Phase 0 stabilization)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const rlAuthHeader = req.headers.get('authorization');
    const rlIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    let rlKey = rlIp;
    let rlMax = 10;
    if (rlAuthHeader) {
      try {
        const { data: { user: rlUser } } = await supabaseAdmin.auth.getUser(rlAuthHeader.replace('Bearer ', ''));
        if (rlUser) { rlKey = rlUser.id; rlMax = 50; }
      } catch { /* anon */ }
    }
    const { data: rlResult } = await supabaseAdmin.rpc('check_rate_limit', {
      key: rlKey, endpoint: 'phase-4-disc-translator', max_requests: rlMax, window_minutes: 1440,
    });
    if (rlResult && !rlResult.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please sign up or try again later.',
        retryAfter: rlResult.retry_after, limit: rlResult.limit, currentCount: rlResult.current_count,
      }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Starting Phase 4 - DISC Translator for project:', projectId);

    const prompt = `You are a DISC communication expert who understands that a buyer persona is a MIX of qualities, and many people can share similar mixes.

═══════════════════════════════════════════════
IMPORTANT CONTEXT - WHY WE USE DISC
═══════════════════════════════════════════════

A buyer persona is NOT just one color. It's a combination of traits. Many different people can match the same persona profile because they share similar desires, pains, and ambitions. 

However, these people may respond to DIFFERENT communication styles based on their dominant DISC personality color.

🎯 Our job is to translate the SAME value proposition into 4 different emotional languages:
- 🔴 RED personalities understand through ACTION and RESULTS
- 🟡 YELLOW personalities understand through EXCITEMENT and SOCIAL PROOF
- 🟢 GREEN personalities understand through TRUST and SECURITY
- 🔵 BLUE personalities understand through LOGIC and DATA

This way, we can communicate effectively with everyone who fits the buyer persona, regardless of their communication preference.

═══════════════════════════════════════════════
INPUT DATA
═══════════════════════════════════════════════

OFFERS TO TRANSLATE:
${JSON.stringify(offers, null, 2)}

PERSONA CONTEXT:
${JSON.stringify(persona, null, 2)}

═══════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════

Translate each offer into 4 DISC color variants:
- RED (Dominance): Direct, results-focused, wants speed and power
- YELLOW (Influence): Enthusiastic, social, wants fun and recognition
- GREEN (Steadiness): Supportive, patient, wants harmony and security
- BLUE (Conscientiousness): Analytical, precise, wants data and quality

CRITICAL: Return a JSON object with this EXACT structure:
{
  "discTable": [
    {
      "offer": "Programa Glow 14 días",
      "red": {
        "copy": "Resultados en 2 semanas garantizado",
        "tone": "Directo y contundente",
        "channel": "Meta",
        "purpose": "Venta",
        "buyingBehavior": "Decisión rápida, quiere eficiencia"
      },
      "yellow": {
        "copy": "¡Únete a miles que ya brillan!",
        "tone": "Entusiasta y social",
        "channel": "Instagram",
        "purpose": "Engagement",
        "buyingBehavior": "Se deja influir por comunidad"
      },
      "green": {
        "copy": "Te acompañamos paso a paso",
        "tone": "Cercano y tranquilizador",
        "channel": "Email",
        "purpose": "Fidelizar",
        "buyingBehavior": "Necesita seguridad y confianza"
      },
      "blue": {
        "copy": "Ingredientes certificados y testados",
        "tone": "Preciso y técnico",
        "channel": "Blog",
        "purpose": "Educar",
        "buyingBehavior": "Investiga antes de comprar"
      }
    }
  ],
  "discMap": {
    "red": 0.25,
    "yellow": 0.30,
    "green": 0.25,
    "blue": 0.20
  }
}

discMap shows estimated distribution in target audience (must sum to 1.0). Return ONLY valid JSON, no markdown.

Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.`;

    const response = await callLlm(
      [
        { role: 'system', content: `You are a DISC personality expert. Always return valid JSON. You MUST respond with ONLY a valid JSON object. Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.` },
        { role: 'user', content: prompt }
      ],
      { temperature: 0.7, responseFormatJson: true, maxTokens: 8000 },
    );
    console.log('LLM provider:', response.provider, 'model:', response.model);

    let result;
    try {
      let content = response.text || '';
      content = content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
      } else if (content.startsWith('```')) {
        content = content.replace(/```\n?/g, '').trim();
      }
      try {
        result = JSON.parse(content);
      } catch {
        const first = content.indexOf('{');
        const last = content.lastIndexOf('}');
        if (first >= 0 && last > first) {
          const jsonText = content.substring(first, last + 1);
          const cleaned = jsonText
            .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
            .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) => c === '\n' || c === '\r' || c === '\t' ? ' ' : '')
            .replace(/,(\s*[}\]])/g, '$1');
          result = JSON.parse(cleaned);
        } else {
          throw new Error('No JSON object found in response');
        }
      }
      console.log('Successfully parsed JSON response');
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      console.error('JSON parse failed. First 500 chars:', (response.text || '').substring(0, 500));
      throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
    }


    
    // Validate parsed result against output schema
    const validation = outputSchema.safeParse(result);
    if (!validation.success) {
      console.warn('phase-4-disc-translator output schema validation (non-fatal):', JSON.stringify(validation.error.issues).slice(0, 500));
    }
    const validatedResult = validation.success ? validation.data : result;
console.log('Phase 4 completed successfully');

    return new Response(JSON.stringify(validatedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-4-disc-translator:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input data', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
