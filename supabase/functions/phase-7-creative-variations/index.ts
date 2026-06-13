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
- Buyer Persona: ${JSON.stringify(allPhaseData?.phase2 || {})}
- Ofertas: ${JSON.stringify(allPhaseData?.phase3?.offers || [])}
- DISC Profiles: ${JSON.stringify(allPhaseData?.phase4 || {})}
- Triggers Emocionales: ${JSON.stringify(allPhaseData?.phase5 || {})}
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
      "objective": "Validar si el deseo de rapidez en perfiles Rojos convierte mejor que mensajes de eficiencia para otros perfiles DISC",
      "headline": "Pipeline lleno en 2 semanas. Garantizado.",
      "subheadline": "Automatización que los CEOs aman",
      "cta": "Empieza hoy gratis",
      "emotionalTrigger": "Urgencia + Status",
      "buyerField": "Deseo: Ser líder en su industria",
      "offer": "Trial 14 días + Onboarding 1-on-1",
      "visualSuggestion": "CEO mirando dashboard con métricas ascendentes en pantalla grande, expresión confiada",
      "kpi": "CPL < €50",
      "estimatedCost": "€1,200-1,800 (test 7 días)",
      "ttv": "7 días para primeros leads",
      "state": "Discover",
      "owner": "PMM",
      "reasoning": "Los perfiles Rojos priorizan velocidad y resultados inmediatos. El trigger de urgencia + status aprovecha su deseo de liderazgo. El offer de onboarding 1-on-1 reduce fricción y acelera adopción. Hipótesis: Si validamos que Rojos convierten con mensajes de rapidez, podemos segmentar audiencias y reducir CAC un 30%."
    },
    {
      "id": "VAR-002",
      "channel": "Google Search",
      "discProfile": "Azul",
      "effect": "Incrementa precisión de forecasting en 40%",
      "objective": "Validar si perfiles Azules responden mejor a datos concretos vs promesas genéricas al buscar activamente soluciones",
      "headline": "Forecasting con 98% de precisión",
      "subheadline": "Datos en tiempo real. Zero guesswork.",
      "cta": "Ver demo técnica",
      "emotionalTrigger": "Seguridad + Control",
      "buyerField": "Dolor: Falta de datos confiables para decisiones",
      "offer": "Demo personalizada 30min + Report de precisión",
      "visualSuggestion": "Gráficos técnicos detallados con métricas de precisión, interfaz profesional",
      "kpi": "CTR > 8%",
      "estimatedCost": "€800-1,200 (test 7 días)",
      "ttv": "10 días para primeros leads",
      "state": "Discover",
      "owner": "Growth",
      "reasoning": "Azules buscan información detallada antes de decidir. Google Search captura alta intención con keywords específicas. El trigger de seguridad + métricas concretas (98%, 40%) genera confianza. Hipótesis: Si Azules convierten mejor con datos técnicos en Search, podemos crear landing pages específicas por perfil y aumentar conversión un 25%."
    }
  ]
}

IMPORTANTE:
- Genera EXACTAMENTE 10 variaciones
- Distribuye entre canales recomendados de forma equilibrada (a menos que se pida un canal específico)
- Varía los perfiles DISC de forma equilibrada (2-3 por color)
- El "reasoning" debe explicar la lógica estratégica completa y la hipótesis de validación
- Los "effect" deben ser específicos y medibles
- Los "objective" deben explicar el por qué estratégico
- Devuelve SOLO JSON válido, sin bloques markdown
- Sé creativo pero mantén coherencia con el contexto del negocio

Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.`;

    const response = await callLlm(
      [
        { role: 'system', content: `You are an expert growth marketing copywriter. Always return valid JSON without markdown. Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.` },
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
      console.warn('phase-7-creative-variations output schema validation (non-fatal):', JSON.stringify(validation.error.issues).slice(0, 500));
    }
    const validatedResult = validation.success ? validation.data : result;

    // Validate parsed result against output schema
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