import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, allPhaseData, recommendedChannels, generateFor, outputLanguage } = inputSchema.parse(body);
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Eres un copywriter experto en growth marketing. Siempre devuelves JSON válido sin markdown.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    // Get response text first to handle empty responses
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      console.error('Empty response from AI Gateway');
      throw new Error('AI Gateway returned an empty response');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI Gateway response:', responseText.substring(0, 500));
      throw new Error('Invalid JSON response from AI Gateway');
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected AI Gateway response structure:', JSON.stringify(data));
      throw new Error('AI Gateway response missing expected fields');
    }

    const message = data.choices[0].message;
    
    // Handle both content and reasoning fields (some models use reasoning instead of content)
    let content = message.content || message.reasoning || '';
    
    if (!content || content.trim() === '') {
      console.error('Both content and reasoning fields are empty in AI response');
      console.error('Full message object:', JSON.stringify(message));
      throw new Error('AI Gateway returned empty content');
    }
    
    // Clean up the content - remove markdown code blocks if present
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/g, '');
    }
    content = content.trim();
    
    // Remove control characters that can break JSON parsing
    // This includes newlines, tabs, and other control characters within strings
    content = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, (char: string) => {
      // Keep valid JSON whitespace characters
      if (char === '\n' || char === '\r' || char === '\t') {
        return ' '; // Replace with space
      }
      return ''; // Remove other control characters
    });
    
    // Try to parse JSON with better error handling
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      console.error('JSON Parse Error:', parseError);
      console.error('Content that failed to parse (first 500 chars):', content.substring(0, 500));
      console.error('Content that failed to parse (last 500 chars):', content.substring(Math.max(0, content.length - 500)));
      
      // Try to extract valid JSON if there's extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
          console.log('Successfully recovered JSON from match');
        } catch (secondError) {
          throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
        }
      } else {
        throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
      }
    }

    console.log('Phase 7 completed successfully with', result.variations?.length || 0, 'variations');

    return new Response(JSON.stringify(result), {
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