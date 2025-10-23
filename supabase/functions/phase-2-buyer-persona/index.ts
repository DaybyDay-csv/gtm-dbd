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

    const prompt = `You are a Buyer Persona Architect creating a detailed ideal buyer profile. This is a COMPLETELY NEW AND INDEPENDENT persona creation. Do NOT reference any previous personas.

INPUT DATA FOR THIS SPECIFIC ANALYSIS:
Brand Information: ${JSON.stringify(brandInfo, null, 2)}
Market Context: ${JSON.stringify(marketData, null, 2)}

YOUR MISSION - CREATE A DEEPLY ALIGNED BUYER PERSONA:

CRITICAL ALIGNMENT REQUIREMENTS:
1. The persona MUST match the product/service being offered
2. The persona MUST reflect the problem that the product solves
3. The persona MUST align with the current market positioning identified in the analysis
4. The persona can be EITHER male or female - choose based on the actual target market
5. Demographics should reflect the realistic buyer for THIS specific product/service

COMPREHENSIVE PERSONA ELEMENTS TO DEFINE:
- Accurate demographics (name, age, city, socioeconomic level matching the product's price point)
- Professional context (job, income level consistent with average ticket price)
- Deep psychological profile (desires, fears, aspirations)
- Specific pain points that THIS product addresses
- Top 3 life/professional ambitions
- Clear objectives and goals
- What would genuinely make their life easier
- What provides them peace of mind
- The transformation they expect from this product

PERSONA AUTHENTICITY CHECKLIST:
✓ Does the socioeconomic status match the product's price point?
✓ Do the pain points align with what the product solves?
✓ Are the desires connected to the product benefits?
✓ Does the persona's context fit the market positioning?
✓ Is the persona realistic for the Spanish market?

CRITICAL: Return a JSON object with this EXACT structure:
{
  "avatar": {
    "name": "Name (male or female, appropriate for Spain)",
    "age": 28-45,
    "city": "Spanish city matching target market",
    "ses": "Socioeconomic level matching product price point",
    "description": "One-sentence professional profile that explains why they need this product"
  },
  "intro": "First-person introduction (150-200 words) where the persona explains their situation, challenges, and what they're looking for. Must connect directly to the product offering.",
  "clouds": [
    "Specific concern #1 directly related to product",
    "Specific concern #2 directly related to product",
    "Specific concern #3 directly related to product",
    "Specific concern #4 directly related to product"
  ],
  "profile": {
    "desires": [
      "Deep desire #1 that the product fulfills",
      "Deep desire #2 that the product fulfills",
      "Deep desire #3 that the product fulfills"
    ],
    "pains": [
      "Specific pain point #1 the product solves",
      "Specific pain point #2 the product solves", 
      "Specific pain point #3 the product solves"
    ],
    "ambitionsTop3": [
      "Life/professional ambition #1",
      "Life/professional ambition #2",
      "Life/professional ambition #3"
    ],
    "objectives": [
      "Concrete objective #1",
      "Concrete objective #2",
      "Concrete objective #3"
    ],
    "makeLifeEasier": "Specific description of what would genuinely improve their daily life",
    "peaceOfMind": "What would make them feel secure and confident in their decision",
    "expectedResult": "The concrete transformation or outcome they expect after using this product"
  }
}

IMPORTANT REMINDERS:
- This is a FRESH persona - do not reference previous projects
- Gender should be determined by the actual target market, not assumed
- All elements must be coherent with the product's positioning and price
- Use realistic Spanish names, cities, and cultural context
- Return ONLY valid JSON, no markdown formatting
- Write all content in Spanish`;

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
