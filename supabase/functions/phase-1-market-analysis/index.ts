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

    const prompt = `You are an expert Brand Strategist conducting a comprehensive market analysis. This is a COMPLETELY NEW AND INDEPENDENT analysis. Do NOT reference any previous analyses.

INPUT DATA FOR THIS SPECIFIC ANALYSIS:
- Brand URL: ${url || 'Not provided'}
- Competitors to analyze: ${competitors || 'Research and identify market leaders'}
- Additional documentation: ${docs || 'None provided'}

YOUR MISSION - CONDUCT A DEEP, EXHAUSTIVE MARKET ANALYSIS:

STEP 1 - COMPREHENSIVE BRAND ANALYSIS:
Visit and thoroughly analyze the provided URL. Extract and document:
- Company identity: Who are they? What is their core business?
- Value proposition: What specific problem do they solve?
- Product/Service details: Features, benefits, pricing tiers if visible
- Average ticket price (estimate based on pricing page or market position)
- Unique selling points: What differentiates them from competitors?
- Target market indicators: Who are they speaking to in their messaging?
- Brand positioning: Premium, mid-market, budget? B2B or B2C?
- Product strengths (minimum 3 specific pros)
- Product weaknesses or limitations (minimum 3 specific cons)
- How the product connects with the current market reality

STEP 2 - MACRO MARKET VIEW (10,000-ft perspective):
- Current market state: Size, growth trends, maturity level
- Historical gaps: What problems have existed in this market?
- Emerging opportunities: Where is the market heading?
- Market dynamics: Key drivers, barriers, trends

STEP 3 - COMPETITIVE LANDSCAPE:
Research and analyze 5-7 competitors in this space:
- Identify their positioning (price vs quality)
- Document their key differences vs our brand
- Expose their weaknesses and gaps
- Identify pivot opportunities for our brand
- Strategic recommendations based on competitive gaps

STEP 4 - TAM ESTIMATION:
Provide a realistic Total Addressable Market estimate with:
- Concrete market size range
- Data-driven assumptions
- Geographic scope
- Market segment focus

CRITICAL FORMATTING REQUIREMENTS:
Return a JSON object with this EXACT structure:
{
  "summary": [
    "Detailed point about company identity and business",
    "Specific value proposition and problem solved", 
    "Product/service specifics with pricing insights",
    "Market positioning and differentiation",
    "Key strengths and unique advantages"
  ],
  "macroView": {
    "marketState": "Comprehensive description of current market size, maturity, growth rate, and key dynamics in this specific industry",
    "historicalGaps": "Detailed analysis of problems that have historically existed in this market and how they've evolved",
    "opportunities": "Specific emerging opportunities based on market trends, technological changes, and unmet needs"
  },
  "competitors": {
    "analysis": "In-depth competitive analysis covering 5-7 specific competitors, their positioning, strengths, weaknesses, market share, and strategic approaches. Include specific company names and concrete details.",
    "recommendations": [
      "Specific strategic recommendation based on competitive gap #1",
      "Actionable pivot opportunity based on competitor weakness #2",
      "Market positioning suggestion based on identified opportunity #3"
    ]
  },
  "xyChart": {
    "xAxis": {"label": "Precio (bajo → alto)"},
    "yAxis": {"label": "Calidad (baja → alta)"},
    "points": [
      {"id":"our_brand","x":0.55,"y":0.78,"label":"Tu marca","color":"#dc2626","size":8},
      {"id":"comp_A","x":0.18,"y":0.80,"label":"[Real Competitor Name]"},
      {"id":"comp_B","x":0.80,"y":0.22,"label":"[Real Competitor Name]"},
      {"id":"comp_C","x":0.15,"y":0.25,"label":"[Real Competitor Name]"},
      {"id":"comp_D","x":0.74,"y":0.74,"label":"[Real Competitor Name]"},
      {"id":"comp_E","x":0.40,"y":0.45,"label":"[Real Competitor Name]"},
      {"id":"comp_F","x":0.62,"y":0.30,"label":"[Real Competitor Name]"}
    ],
    "notes": "Strategic positioning insights: identify white space opportunities and crowded market segments"
  },
  "tamEstimate": {
    "value": "€X-Y million (or appropriate currency/scale)",
    "assumptions": [
      "Specific assumption with data point",
      "Market segment definition and size",
      "Geographic scope and penetration rate",
      "Growth rate and timeline assumptions"
    ]
  },
  "productAnalysis": {
    "averageTicket": "€XXX or price range with justification",
    "pros": [
      "Specific strength #1 with evidence",
      "Specific strength #2 with evidence", 
      "Specific strength #3 with evidence"
    ],
    "cons": [
      "Specific limitation #1 with context",
      "Specific limitation #2 with context",
      "Specific limitation #3 with context"
    ],
    "differentiation": "Clear explanation of how this product stands out in the market",
    "marketConnection": "Analysis of how the product connects with current market needs and trends"
  }
}

IMPORTANT REMINDERS:
- This is a FRESH analysis - do not reference previous projects
- Be exhaustive and specific - include real data and insights
- Use actual competitor names when possible
- Position competitors realistically across all quadrants
- Base all insights on the actual URL and market research
- Return ONLY valid JSON, no markdown formatting`;

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
