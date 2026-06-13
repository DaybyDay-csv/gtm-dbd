import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callLlm } from "../_shared/llm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const inputSchema = z.object({
  projectId: z.string().uuid(),
  allPhaseData: z.record(z.any()).optional(),
  recommendedChannels: z.array(z.string()).max(20).optional(),
  generateFor: z.string().max(100).optional(),
  outputLanguage: z.enum(['es', 'en']).default('es')
});

const outputSchema = z.object({
  variations: z.array(z.object({
    id: z.string(),
    channel: z.string(),
    discProfile: z.string(),
    effect: z.string(),
    objective: z.string(),
    headline: z.string(),
    subheadline: z.string().optional(),
    cta: z.string(),
    emotionalTrigger: z.string(),
    buyerField: z.string(),
    offer: z.string(),
    visualSuggestion: z.string().optional(),
    kpi: z.string(),
    estimatedCost: z.string(),
    ttv: z.string(),
    state: z.string(),
    owner: z.string(),
    reasoning: z.string(),
  })).min(8).max(12),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, allPhaseData, recommendedChannels, generateFor, outputLanguage } = inputSchema.parse(body);

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
      key: rlKey, endpoint: 'phase-7-creative-variations', max_requests: rlMax, window_minutes: 1440,
    });
    if (rlResult && !rlResult.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please sign up or try again later.',
        retryAfter: rlResult.retry_after, limit: rlResult.limit, currentCount: rlResult.current_count,
      }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Starting Phase 7 - Creative Variations for project:', projectId);
    console.log('Generating for:', generateFor || 'all recommended channels');

    const channels = generateFor && generateFor !== 'all'
      ? [generateFor]
      : recommendedChannels || [];

    const prompt = `Eres un copywriter experto en growth marketing. Genera 10 variaciones creativas de campañas listas para ejecutar.

CONTEXTO COMPLETO:
- Buyer Persona: ${JSON.stringify(allPhaseData?.phase2 || {}).slice(0, 1500)}
- Ofertas: ${JSON.stringify(allPhaseData?.phase3?.offers || []).slice(0, 1500)}
- DISC Profiles: ${JSON.stringify(allPhaseData?.phase4 || {}).slice(0, 1500)}
- Triggers Emocionales: ${JSON.stringify(allPhaseData?.phase5 || {}).slice(0, 1500)}
- Canales Recomendados: ${JSON.stringify(channels)}
- Canal Específico: ${generateFor || 'distribuir entre todos'}

REGLAS DE DISTRIBUCIÓN:
1. Si hay 1 canal recomendado → 10 variaciones para ese canal
2. Si hay 2-3 canales → distribuir 10 variaciones entre ellos (ej: 4-3-3 o 5-3-2)
3. Si se solicita un canal específico → 10 variaciones para ese canal

REGLAS DE VARIACIONES:
Cada variación debe combinar:
- Campo del buyer (deseo/dolor/ambición/objetivo) de Fase 2
- Oferta específica de Fase 3
- Color DISC (Rojo/Amarillo/Verde/Azul) de Fase 4
- Trigger emocional de Fase 5
- Canal específico

FORMATO EFECTO → CAUSA (MUY IMPORTANTE):
- "effect": La hipótesis que queremos validar (QUÉ queremos lograr) - Debe ser claro y accionable
- "objective": Por qué estamos probando esto (POR QUÉ - la causa estratégica) - Debe explicar el razonamiento estratégico

FORMATO DE RESPUESTA (JSON estricto, sin markdown):
{
  "variations": [
    {
      "id": "VAR-001",
      "channel": "Meta Ads",
      "discProfile": "Rojo",
      "effect": "Acelera tu pipeline de ventas en 14 días",
      "objective": "Validar si el deseo de rapidez convierte mejor que mensajes genéricos",
      "headline": "Pipeline lleno en 2 semanas",
      "subheadline": "Automatización que los CEOs aman",
      "cta": "Empieza hoy gratis",
      "emotionalTrigger": "Urgencia + Status",
      "buyerField": "Deseo: Ser líder en su industria",
      "offer": "Trial 14 días + Onboarding 1-on-1",
      "visualSuggestion": "CEO mirando dashboard con métricas ascendentes",
      "kpi": "CPL < 50 EUR",
      "estimatedCost": "1200-1800 EUR (test 7 días)",
      "ttv": "7 días para primeros leads",
      "state": "Discover",
      "owner": "PMM",
      "reasoning": "Rojos priorizan velocidad. Trigger urgencia + status + onboarding reduce fricción."
    }
  ]
}

IMPORTANTE:
- Genera EXACTAMENTE 10 variaciones
- Distribuye entre canales recomendados de forma equilibrada
- Varía los perfiles DISC de forma equilibrada (2-3 por color)
- Mantén los textos CONCISOS (<120 chars por campo de copy)
- Devuelve SOLO JSON válido, sin bloques markdown

Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.`;

    const response = await callLlm(
      [
        { role: 'system', content: `You are an expert growth marketing copywriter. Always return valid JSON without markdown. Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.` },
        { role: 'user', content: prompt }
      ],
      { temperature: 0.7, maxTokens: 8000, responseFormatJson: true },
    );
    console.log('LLM provider:', response.provider, 'model:', response.model);

    let content = response.text || '';
    if (!content || content.trim() === '') {
      throw new Error('LLM returned empty content');
    }
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/g, '');
    }
    content = content.trim();

    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.log('First parse failed, attempting to extract JSON from content...');
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
          console.log('Successfully recovered JSON from match');
        } catch (secondError) {
          const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
          throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
        }
      } else {
        const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
        throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
      }
    }

    // Output schema validation: log warning but don't reject (schema-first renderer is tolerant)
    const validation = outputSchema.safeParse(result);
    if (!validation.success) {
      console.warn('phase-7-creative-variations output schema validation (non-fatal):', JSON.stringify(validation.error.issues).slice(0, 500));
    }
    const validatedResult = validation.success ? validation.data : result;
    console.log('Phase 7 completed successfully with', validatedResult.variations?.length || 0, 'variations');

    return new Response(JSON.stringify(validatedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-7-creative-variations:', error);

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
