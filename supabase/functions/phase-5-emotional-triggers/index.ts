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
  discData: z.record(z.any()).optional(),
  valueData: z.record(z.any()).optional(),
  outputLanguage: z.enum(['es', 'en']).default('es')
});

const outputSchema = z.object({
  triggers: z.array(z.object({
    characteristic: z.string(), color: z.string(), variable: z.string(),
    trigger: z.string(), example: z.string(), implementation: z.string(),
  })).min(5),
});


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, persona, discData, valueData, outputLanguage } = inputSchema.parse(body);

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
      key: rlKey, endpoint: 'phase-5-emotional-triggers', max_requests: rlMax, window_minutes: 1440,
    });
    if (rlResult && !rlResult.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please sign up or try again later.',
        retryAfter: rlResult.retry_after, limit: rlResult.limit, currentCount: rlResult.current_count,
      }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Starting Phase 5 - Emotional Triggers for project:', projectId);

    const prompt = `You are an emotional trigger specialist. Your mission is to create specific triggers that activate buying decisions.

PROCESS: Combine (buyer characteristic × DISC color × value variable) to create triggers that MOVE people to action.

PERSONA:
${JSON.stringify(persona, null, 2)}

DISC DATA:
${JSON.stringify(discData, null, 2)}

VALUE DATA:
${JSON.stringify(valueData, null, 2)}

TASK: For each (buyer characteristic × DISC color × value variable) combination, create emotional triggers.

Value variables:
- S (Sueño/Dream): Amplify the dream outcome
- P (Probabilidad/Probability): Increase perceived likelihood
- T (Tiempo/Time): Reduce time perception
- E (Esfuerzo/Effort): Minimize effort perception

CRITICAL: Return a JSON object with this EXACT structure:
{
  "triggers": [
    {
      "characteristic": "Poco tiempo disponible",
      "color": "Rojo",
      "variable": "T",
      "trigger": "Velocidad",
      "example": "Hecho en 5 minutos al día",
      "implementation": "Mostrar timer, destacar rapidez"
    },
    {
      "characteristic": "Busca resultados visibles",
      "color": "Amarillo",
      "variable": "P",
      "trigger": "Prueba social",
      "example": "12.000 personas ya lo lograron",
      "implementation": "Testimonios visuales, contador"
    },
    {
      "characteristic": "Necesita seguridad",
      "color": "Verde",
      "variable": "E",
      "trigger": "Acompañamiento",
      "example": "Soporte 24/7 incluido",
      "implementation": "Chat en vivo, email personal"
    }
  ]
}

Create 10-15 diverse triggers covering all DISC colors and value variables. Return ONLY valid JSON, no markdown.

Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.`;

    const response = await callLlm(
      [
        { role: 'system', content: `You are an emotional trigger expert. Always return valid JSON. You MUST respond with ONLY a valid JSON object. Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.` },
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
      console.warn('phase-5-emotional-triggers output schema validation (non-fatal):', JSON.stringify(validation.error.issues).slice(0, 500));
    }
    const validatedResult = validation.success ? validation.data : result;
console.log('Phase 5 completed successfully');

    return new Response(JSON.stringify(validatedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-5-emotional-triggers:', error);
    
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
