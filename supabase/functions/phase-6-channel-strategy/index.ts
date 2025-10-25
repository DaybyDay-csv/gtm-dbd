import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, allPhaseData, budgetLevel, budgetAmount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting Phase 6 - Channel Strategy Analysis for project:', projectId);
    console.log('Budget:', budgetLevel, budgetAmount);

    const prompt = `Eres un estratega de canales de marketing B2B/B2C. Tu misión es recomendar EL MEJOR CANAL para validar el producto.

CONTEXTO DEL NEGOCIO:
- Tamaño empresa: ${allPhaseData.phase1?.businessSize || 'No especificado'}
- Sector: ${allPhaseData.phase1?.industry || 'No especificado'}
- Gap de mercado: ${allPhaseData.phase1?.marketGap || 'No especificado'}
- Buyer Persona: ${JSON.stringify(allPhaseData.phase2?.profile || {})}
- Ofertas disponibles: ${JSON.stringify(allPhaseData.phase3?.offers || [])}
- Presupuesto declarado: ${budgetLevel} (~€${budgetAmount})

ANÁLISIS REQUERIDO:
1. Estimar nivel de recursos real considerando:
   - Madurez del negocio
   - Complejidad del producto
   - Canales donde consume el buyer
   - Barreras de entrada por canal
   - ROI esperado vs presupuesto

2. Calcular score por canal (0-100) basado en:
   - Fit con buyer persona (40%)
   - Viabilidad con presupuesto (30%)
   - Cobertura del gap de mercado (20%)
   - Tiempo hasta primeros resultados (10%)

3. Recomendar canal principal + 2 alternativas

4. Analizar al menos 6-8 canales diferentes: Meta Ads, Google Search, Google Display, Email Marketing, LinkedIn Ads, TikTok, YouTube, Marketplaces (Amazon, etc), SEO/Content, etc.

FORMATO DE RESPUESTA (JSON estricto, sin markdown):
{
  "budgetAnalysis": {
    "estimatedMonthly": 5000,
    "confidence": "high",
    "factors": ["Tamaño de empresa mediana", "Mercado B2B SaaS requiere mayor inversión", "Presupuesto declarado alineado con sector"]
  },
  "channels": [
    {
      "name": "Meta Ads",
      "score": 85,
      "reasoning": "Mejor alcance para tu buyer persona con presupuesto óptimo",
      "pros": ["Mayor alcance demográfico", "CPL competitivo €20-40", "Resultados rápidos en 14 días", "Audiencias lookalike disponibles"],
      "cons": ["Requiere presupuesto mínimo €1,500/mes", "Curva de aprendizaje inicial"],
      "estimatedCPL": "€20-40",
      "timeToResults": "14 días",
      "rank": 1
    },
    {
      "name": "Google Search",
      "score": 72,
      "reasoning": "Alta intención de compra pero más costoso",
      "pros": ["Usuarios con alta intención", "Fácil de medir ROI", "Escalable rápidamente"],
      "cons": ["CPL más alto €40-80", "Competencia intensa en keywords"],
      "estimatedCPL": "€40-80",
      "timeToResults": "21 días",
      "rank": 2
    },
    {
      "name": "Email Marketing",
      "score": 68,
      "reasoning": "Bajo coste pero requiere base de datos existente",
      "pros": ["Muy bajo coste por lead", "Alto control del mensaje", "Automatizable"],
      "cons": ["Necesitas base de datos previa", "Tasas de apertura variables"],
      "estimatedCPL": "€5-15",
      "timeToResults": "7 días",
      "rank": 3
    }
  ],
  "recommendation": {
    "primary": "Meta Ads",
    "secondary": "Google Search",
    "tertiary": "Email Marketing",
    "disclosure": "Tu buyer persona (CMOs en SaaS B2B) consume contenido principalmente en LinkedIn y Meta. Dado tu presupuesto medio-alto (€${budgetAmount}), Meta Ads permite escalar rápido con CPLs competitivos (€20-40) mientras construyes audiencias lookalike. El gap de mercado que cubres requiere educación visual, lo cual es el punto fuerte de Meta. Google Search sería segunda opción para captar demanda existente, y Email para nurturing de leads una vez tengas base de datos."
  }
}

IMPORTANTE: 
- Devuelve SOLO JSON válido, sin bloques de código markdown
- Analiza AL MENOS 6-8 canales diferentes
- Sé específico con las cifras de CPL y tiempos
- El disclosure debe ser un párrafo coherente de 3-4 líneas explicando la lógica estratégica`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Eres un estratega de canales de marketing experto. Siempre devuelves JSON válido sin markdown.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    console.log('Phase 6 completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-6-channel-strategy:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});