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
  budgetLevel: z.string().max(100).optional(),
  budgetAmount: z.number().min(0).max(10000000).optional(),
  channelPreference: z.string().max(500).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, allPhaseData, budgetLevel, budgetAmount, channelPreference } = inputSchema.parse(body);
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting Phase 6 - Channel Strategy Analysis for project:', projectId);
    console.log('Budget:', budgetLevel, budgetAmount);
    console.log('Channel preference:', channelPreference || 'None');

    // Prepare marketplace context from Phase 1
    const marketplaceContext = allPhaseData?.phase1?.marketplacePresence?.detected
      ? `
═══════════════════════════════════════════════
🛒 INFORMACIÓN CRÍTICA - MARKETPLACES DETECTADOS
═══════════════════════════════════════════════

⚠️ ESTE PRODUCTO YA SE VENDE EN LAS SIGUIENTES PLATAFORMAS:

${JSON.stringify(allPhaseData?.phase1?.marketplacePresence || {}, null, 2)}

🎯 IMPLICACIONES ESTRATÉGICAS CRÍTICAS:

1. **AUDIENCIA CALIENTE vs AUDIENCIA FRÍA:**
   - Marketplace nativo = Usuarios con ALTA INTENCIÓN (ya buscan productos similares)
   - Canales externos (Meta/Google) = Usuarios en descubrimiento (requieren educación)
   
2. **ROI COMPARATIVO:**
   - CPL nativo en marketplace: €15-€40 (conversión rápida)
   - CPL externo Meta/Google: €40-€100 (conversión más lenta)
   - Tiempo hasta resultados: 3-5 días (nativo) vs 14-30 días (externo)

3. **ESTRATEGIA DE ANÁLISIS OBLIGATORIA:**
   - Debes analizar PRIMERO las opciones de publicidad NATIVA listadas arriba
   - Comparar score nativo vs canales externos tradicionales
   - Considerar ventaja de capitalizar audiencia EXISTENTE en la plataforma
   - Evaluar embudo: plataforma nativa = menor fricción de compra
   - Bonus de +15 puntos en score para canales nativos de marketplace (audiencia caliente)

4. **CONSIDERACIONES DE PRESUPUESTO:**
   - Marketplace nativo suele requerir MENOR presupuesto inicial
   - Pero tiene comisiones de plataforma (15-20% Amazon, 5-8% TikTok Shop)
   - Canales externos requieren mayor inversión pero construyen brand equity propio

5. **RECOMENDACIÓN DE ANÁLISIS:**
   - Si producto está en Amazon → Amazon Sponsored Products DEBE estar en top 3
   - Si está en TikTok Shop → TikTok Shop Ads + estrategia orgánica debe evaluarse
   - Si tiene Shopify → Necesita presupuesto robusto para Meta/Google (validar si lo tiene)
    - Estrategia ideal: Nativo para validación rápida + externo para diversificación
    NO RECOMENDAR EL CANAL DE MARKETPLACE ANTIVO SOLO PORQUE ESTÉ DISPOBILE, ANALIZA CRÍTICAMENTE TRAS HABER HECHO EL ANALISIS COMPLETO DE TODOS LOS CANALES
`
      : `
ℹ️ NO SE DETECTARON MARKETPLACES ESPECÍFICOS

El producto/servicio NO se vende en marketplaces tradicionales (Amazon, TikTok Shop, etc.).

Debes analizar canales tradicionales:
- Meta Ads (Facebook/Instagram)
- Google Search Ads
- Google Display Network
- LinkedIn Ads (si B2B)
- Email Marketing
- SEO / Content Marketing
- YouTube Ads
- Twitter/X Ads
- Programmatic Display
- Influencer Marketing

Enfoque: Atraer tráfico frío y construir audiencia desde cero.
`;

    // Channel preference context
    const channelPreferenceContext = channelPreference
      ? `
═══════════════════════════════════════════════
🎯 PREFERENCIA DE CANAL DEL USUARIO
═══════════════════════════════════════════════

El usuario ha expresado la siguiente preferencia:
"${channelPreference}"

⚠️ IMPORTANTE: 
- Esta preferencia DEBE ser considerada en tu análisis
- Si el canal preferido es viable, dale peso adicional en tu scoring (+10 puntos)
- Si el canal preferido NO es óptimo para el presupuesto/contexto, explícalo claramente en el disclosure
- Balancea la preferencia del usuario con datos objetivos
- Si el usuario menciona querer EVITAR un canal, asegúrate de NO recomendarlo como primario
`
      : '';

    const prompt = `Eres un estratega de canales de marketing B2B/B2C. Tu misión es recomendar EL MEJOR CANAL para validar el producto.

${marketplaceContext}

${channelPreferenceContext}

CONTEXTO DEL NEGOCIO:
- Tamaño empresa: ${allPhaseData?.phase1?.businessSize || 'No especificado'}
- Sector: ${allPhaseData?.phase1?.industry || 'No especificado'}
- Gap de mercado: ${allPhaseData?.phase1?.marketGap || 'No especificado'}
- Buyer Persona: ${JSON.stringify(allPhaseData?.phase2?.profile || {})}
- Ofertas disponibles: ${JSON.stringify(allPhaseData?.phase3?.offers || [])}
- Presupuesto declarado: ${budgetLevel} (~€${budgetAmount})

ANÁLISIS REQUERIDO:
1. **SI SE DETECTARON MARKETPLACES (revisar sección arriba):**
   a) PRIMERO analiza las opciones de publicidad NATIVA listadas (Amazon Ads, TikTok Shop Ads, etc.)
   b) Compara CPL nativo vs CPL externo (Meta/Google) usando los datos del mercado para ese nicho en ese producto
   c) Evalúa ventaja de audiencia con intención vs audiencia fría
   d) Calcula tiempo de setup: nativo (2-5 días) vs externo (14-30 días) (Si es un perfil que tiene un nivel de mas de 3 en perfil, se asume queya tiene cuenta de meta ads y googole ads con lo que el tiempo de setup baja a 5-7 días, ten en cuneta esto)
   e) Considera trade-off: dependencia plataforma vs diversificación
   f) Aplica BONUS +15 puntos en score para canales nativos de marketplace
   
2. **SI NO HAY MARKETPLACES:**
   Analiza canales externos tradicionales (Meta, Google, LinkedIn, etc.)

3. Estimar nivel de recursos real considerando:
   - Madurez del negocio
   - Complejidad del producto
   - Canales donde consume el buyer
   - Barreras de entrada por canal
   - ROI esperado vs presupuesto
   - **NUEVO:** Presencia existente en marketplaces (ventaja competitiva crítica)
   NO RECOMENDAR EL CANAL DE MARKETPLACE NATIVO SOLO PORQUE ESTÉ DISPOBILE, ANALIZA CRÍTICAMENTE TRAS HABER HECHO EL ANALISIS COMPLETO DE TODOS LOS CANALES


4. Calcular score por canal (0-100) basado en:
   - Fit con buyer persona (40%)
   - Viabilidad con presupuesto (30%)
   - Cobertura del gap de mercado (20%)
   - Tiempo hasta primeros resultados (10%)
   - **BONUS +15 puntos:** Si es canal nativo de marketplace detectado (audiencia caliente) pero    NO RECOMENDAR EL CANAL DE MARKETPLACE ANTIVO SOLO PORQUE ESTÉ DISPOBILE, ANALIZA CRÍTICAMENTE TRAS HABER HECHO EL ANALISIS COMPLETO DE TODOS LOS CANALES


5. Recomendar canal principal + 2 alternativas

6. **CANALES A ANALIZAR (mínimo 6-8):**
   
   **SI HAY MARKETPLACES DETECTADOS, PRIORIZA ESTOS:**
   - Amazon Sponsored Products (si producto en Amazon)
   - Amazon Sponsored Brands (si producto en Amazon)
   - TikTok Shop Ads (si producto en TikTok Shop)
   - Etsy Promoted Listings (si producto en Etsy)
   - Shopify Email Marketing (si tienda Shopify)
   - eBay Promoted Listings (si producto en eBay)
   
   **CANALES EXTERNOS TRADICIONALES (analizar siempre):**
   - Meta Ads (Facebook/Instagram)
   - Google Search Ads
   - Google Display Network / GDN
   - LinkedIn Ads (si B2B)
   - Email Marketing tradicional (Klaviyo etc)
   - SEO / Content Marketing
   - YouTube Ads
   - TikTok Ads (diferente de TikTok Shop - es para traer tráfico externo)
   - Twitter/X Ads
   - Programmatic Display (DSPs)
   - Influencer Marketing
   - Pinterest Ads (si producto visual/lifestyle)

FORMATO DE RESPUESTA (JSON estricto, sin markdown):
{
  "budgetAnalysis": {
    "estimatedMonthly": 5000,
    "confidence": "high",
    "factors": ["Tamaño de empresa mediana", "Mercado B2B SaaS requiere mayor inversión", "Presupuesto declarado alineado con sector"]
  },
  "channels": [
    {
      "name": "Amazon Sponsored Products",
      "score": 92,
      "reasoning": "Audiencia caliente ya buscando productos similares. Mayor ROI por menor CPL y conversión rápida",
      "pros": ["Audiencia con alta intención de compra", "CPL competitivo €15-30 (50% menor que Meta)", "Resultados en 3-5 días", "Amazon maneja trust y fulfillment", "Setup rápido en 48h"],
      "cons": ["Comisiones Amazon 15-20%", "Dependencia de plataforma", "Difícil construir brand equity"],
      "estimatedCPL": "€15-30",
      "timeToResults": "3-5 días",
      "rank": 1,
      "isNativePlatform": true,
      "platformDetails": {
        "adTypes": ["Sponsored Products (CPC)", "Sponsored Brands (Display)", "Sponsored Display (Retargeting)"],
        "organicBoost": "Optimizar título keywords, A+ Content, backend search terms, gestión reviews",
        "budgetSplit": "70% Sponsored Products / 20% Organic SEO / 10% Sponsored Brands"
      }
    },
    {
      "name": "Meta Ads",
      "score": 78,
      "reasoning": "Opción para diversificar y construir audiencias propias fuera de marketplace",
      "pros": ["Alcance masivo", "Retargeting potente", "Lookalike audiences", "Construcción de brand equity"],
      "cons": ["CPL €40-80 (audiencia fría)", "Setup más lento 14-21 días", "Requiere landing page optimizada"],
      "estimatedCPL": "€40-80",
      "timeToResults": "14-21 días",
      "rank": 2,
      "isNativePlatform": false
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
    content = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, (char: string) => {
      if (char === '\n' || char === '\r' || char === '\t') {
        return ' ';
      }
      return '';
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

    console.log('Phase 6 completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-6-channel-strategy:', error);
    
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