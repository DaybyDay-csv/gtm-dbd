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
    const { projectId, offers, persona } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting Phase 4 - DISC Translator for project:', projectId);

    const prompt = `You are an expert in Tomas Erikson's DISC personality framework (Red/Yellow/Green/Blue).

OFFERS TO TRANSLATE:
${JSON.stringify(offers, null, 2)}

PERSONA:
${JSON.stringify(persona, null, 2)}

TASK: Translate each offer into 4 DISC color variants:
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

discMap shows estimated distribution in target audience (must sum to 1.0). Return ONLY valid JSON, no markdown.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a DISC personality expert. Always return valid JSON.' },
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

    console.log('Phase 4 completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-4-disc-translator:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
