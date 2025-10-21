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
    const { projectId, persona, brandInfo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting Phase 3 - Value Equation for project:', projectId);

    const prompt = `You are an expert in Alex Hormozi's Value Equation: Value = (Dream × Probability) / (Time × Effort)

BUYER PERSONA:
${JSON.stringify(persona, null, 2)}

TASK: For each buyer field (desires, pains, ambitions, objectives) create offers that:
1. Increase numerator (Dream Outcome × Perceived Probability)
2. Reduce denominator (Time Delay × Effort & Sacrifice)

CRITICAL: Return a JSON object with this EXACT structure:
{
  "offers": [
    {
      "field": "Desires",
      "targetNeed": "specific desire being addressed",
      "offer": "Programa Glow de 14 días",
      "valueGauge": {
        "value": 78,
        "numerator": {"dream": 0.9, "probability": 0.85},
        "denominator": {"time": 0.4, "effort": 0.35}
      },
      "raiseNumerator": [
        "Garantía visible",
        "Testimonios verificados antes/después"
      ],
      "lowerDenominator": [
        "Guía de 5 minutos diarios",
        "Kit de inicio incluido"
      ]
    },
    {
      "field": "Pains",
      "targetNeed": "specific pain being solved",
      "offer": "Another compelling offer",
      "valueGauge": {
        "value": 72,
        "numerator": {"dream": 0.85, "probability": 0.8},
        "denominator": {"time": 0.45, "effort": 0.4}
      },
      "raiseNumerator": ["tactic 1", "tactic 2"],
      "lowerDenominator": ["tactic 1", "tactic 2"]
    }
  ],
  "overallValue": 75
}

Create 3-4 compelling offers. Value scores 0-100. Return ONLY valid JSON, no markdown.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a value equation expert using Hormozi framework. Always return valid JSON.' },
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

    console.log('Phase 3 completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-3-value-equation:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
