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
    const { projectId, url, competitors, docs } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting Phase 1 - Market Analysis for project:', projectId);

    const prompt = `You are a Brand Strategist analyzing a brand for market positioning.

INPUT:
- Brand URL: ${url || 'Not provided'}
- Competitors: ${competitors || 'Will analyze market leaders'}
- Additional docs: ${docs || 'None'}

TASK: Analyze the market and provide:
1. Brand summary (vision, mission, values, products, problems solved)
2. Macro 10,000-ft market view (state, gaps, opportunities)
3. Competitor analysis (differences, weaknesses, pivot opportunities)
4. TAM estimate with assumptions

CRITICAL: Return a JSON object with this EXACT structure:
{
  "summary": ["bullet 1", "bullet 2", "bullet 3"],
  "macroView": {
    "marketState": "description",
    "historicalGaps": "description",
    "opportunities": "description"
  },
  "competitors": {
    "analysis": "detailed analysis",
    "recommendations": ["rec 1", "rec 2"]
  },
  "xyChart": {
    "xAxis": {"label": "Precio (bajo → alto)"},
    "yAxis": {"label": "Calidad (baja → alta)"},
    "points": [
      {"id":"our_brand","x":0.55,"y":0.78,"label":"Tu marca","color":"#dc2626","size":8},
      {"id":"comp_A","x":0.18,"y":0.80,"label":"Comp A"},
      {"id":"comp_B","x":0.80,"y":0.22,"label":"Comp B"},
      {"id":"comp_C","x":0.15,"y":0.25,"label":"Comp C"},
      {"id":"comp_D","x":0.74,"y":0.74,"label":"Comp D"},
      {"id":"comp_E","x":0.40,"y":0.45,"label":"Comp E"},
      {"id":"comp_F","x":0.62,"y":0.30,"label":"Comp F"}
    ],
    "notes": "Gaps identified at high-quality/medium-price quadrant"
  },
  "tamEstimate": {
    "value": "€X-Y million",
    "assumptions": ["assumption 1", "assumption 2"]
  }
}

Place competitors strategically: one in each quadrant plus two anywhere relevant. Use x,y values from 0 to 1.
Return ONLY valid JSON, no markdown.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: 'You are a market analysis expert. Always return valid JSON.' },
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

    console.log('Phase 1 completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-1-market-analysis:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
