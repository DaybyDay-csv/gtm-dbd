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
  persona: z.record(z.any()).optional(),
  brandInfo: z.record(z.any()).optional(),
  outputLanguage: z.enum(['es', 'en']).default('es')
});

const outputSchema = z.object({
  offers: z.array(z.object({
    field: z.string(),
    targetNeed: z.string(),
    offer: z.string(),
    valueGauge: z.object({
      value: z.number().min(0).max(100),
      numerator: z.object({ dream: z.number(), probability: z.number() }),
      denominator: z.object({ time: z.number(), effort: z.number() }),
    }),
    raiseNumerator: z.array(z.string()).min(1),
    lowerDenominator: z.array(z.string()).min(1),
  })).min(2),
  overallValue: z.number().min(0).max(100),
});


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, persona, brandInfo, outputLanguage } = inputSchema.parse(body);

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
      key: rlKey, endpoint: 'phase-3-value-equation', max_requests: rlMax, window_minutes: 1440,
    });
    if (rlResult && !rlResult.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please sign up or try again later.',
        retryAfter: rlResult.retry_after, limit: rlResult.limit, currentCount: rlResult.current_count,
      }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Starting Phase 3 - Value Equation for project:', projectId);

    const prompt = `You are an expert in Alex Hormozi's Value Equation: Value = (Dream outcome × Perceived likelihood of achievement) / (Time delayed × Effort & Sacrifice)

Your mission is to create high-value offers that fill market gaps and serve the buyer persona.

BUYER PERSONA:
${JSON.stringify(persona, null, 2)}

BRAND & PRODUCT INFO:
${JSON.stringify(brandInfo, null, 2)}

Create 4-6 compelling offers that:
1. MAXIMIZE the numerator (Dream Outcome × Perceived Probability)
2. MINIMIZE the denominator (Time Delay × Effort & Sacrifice)
3. Leverage market gaps and positioning opportunities
4. Are SPECIFIC, ACTIONABLE, and irresistible

CRITICAL: Return ONLY a JSON object with this EXACT structure (no markdown, no extra text):
{
  "offers": [
    {
      "field": "Desires",
      "targetNeed": "specific desire being addressed",
      "offer": "Compelling offer name that speaks to dream outcome",
      "valueGauge": {
        "value": 78,
        "numerator": {"dream": 0.9, "probability": 0.85},
        "denominator": {"time": 0.4, "effort": 0.35}
      },
      "raiseNumerator": [
        "Guarantee or proof that increases perceived likelihood",
        "Another tactic that makes success seem certain"
      ],
      "lowerDenominator": [
        "Quick win or time saver",
        "Effort reducer or done-for-you element"
      ]
    }
  ],
  "overallValue": 75
}

Each offer must target a different buyer need (desires, pains, ambitions, objectives).
Value scores should be 0-100.
Return ONLY valid JSON.

Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.`;

    const response = await callLlm(
      [
        { role: 'system', content: `You are a value equation expert using the Hormozi framework. Always return valid JSON. You MUST respond with ONLY a valid JSON object. Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.` },
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
      console.warn('phase-3-value-equation output schema validation (non-fatal):', JSON.stringify(validation.error.issues).slice(0, 500));
    }
    const validatedResult = validation.success ? validation.data : result;
console.log('Phase 3 completed successfully');

    return new Response(JSON.stringify(validatedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-3-value-equation:', error);
    
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
