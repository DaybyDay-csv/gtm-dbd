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
    const { projectId, brandInfo, marketData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting Phase 2 - Buyer Persona for project:', projectId);

    const prompt = `You are a Buyer Persona Architect creating a detailed ideal buyer profile.

CONTEXT:
${JSON.stringify(brandInfo, null, 2)}

TASK: Create ONE ideal buyer persona with Spain-specific insights including:
- Demographics (name, age, city, socioeconomic status)
- Deep desires and aspirations
- Pain points and frustrations
- Top 3 ambitions
- Objectives and goals
- "What would make life easier"
- "Peace of mind" needs
- Final expected result

CRITICAL: Return a JSON object with this EXACT structure:
{
  "avatar": {
    "name": "María",
    "age": 32,
    "city": "Madrid",
    "ses": "Clase media-alta",
    "description": "Mujer profesional, valora su tiempo y busca eficiencia"
  },
  "intro": "Hola, soy María. Trabajo en el sector financiero y busco soluciones que me ahorren tiempo sin sacrificar calidad...",
  "clouds": [
    "Le preocupa el tiempo limitado",
    "Desea resultados visibles rápido",
    "Quiere sentirse segura con su elección",
    "Le da pereza lo complicado"
  ],
  "profile": {
    "desires": ["desire 1", "desire 2", "desire 3"],
    "pains": ["pain 1", "pain 2", "pain 3"],
    "ambitionsTop3": ["ambition 1", "ambition 2", "ambition 3"],
    "objectives": ["objective 1", "objective 2"],
    "makeLifeEasier": "what would help",
    "peaceOfMind": "what provides security",
    "expectedResult": "final transformation"
  }
}

Use Spanish context and consumption patterns. Return ONLY valid JSON, no markdown.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a buyer persona expert. Always return valid JSON in Spanish.' },
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

    console.log('Phase 2 completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-2-buyer-persona:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
