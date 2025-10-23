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

    const prompt = `You are a Buyer Persona Architect with deep psychology, market intelligence, and human behavior expertise.

⚠️ CRITICAL: This is a COMPLETELY NEW AND INDEPENDENT persona creation. Do NOT reference any previous personas or projects.

INPUT DATA FOR THIS SPECIFIC ANALYSIS:
BRAND INFORMATION: ${JSON.stringify(brandInfo, null, 2)}
MARKET DATA (including product nucleus, gaps, and opportunities): ${JSON.stringify(marketData, null, 2)}

YOUR MISSION - CREATE THE PERFECT BUYER PERSONA:

═══════════════════════════════════════════════
PROCESS TO CREATE THE PERSONA
═══════════════════════════════════════════════

🎯 STEP 1: UNDERSTAND THE MARKET-PRODUCT-GAP FIT
Before creating the persona, you must understand:
- What is the product nucleus? (main product, problems it solves, how it solves them)
- What market gaps or opportunities exist?
- Where is the product positioned vs competitors?
- What value does it offer that others don't?

👤 STEP 2: IDENTIFY THE IDEAL BUYER
Based on the above, identify:
- Who is the PERFECT customer for THIS product to solve THIS problem and fill THIS gap?
- Should this persona be MALE or FEMALE? (decide based on market research and product)
- What is their socioeconomic reality in Spain? (must match the product's price point)
- What is their professional and personal context?
- Why would they care about THIS specific product?

💭 STEP 3: DEEP PSYCHOLOGICAL PROFILE
Remember: A buyer persona is a MIX of qualities. Many people can coincide in this mix.

Create a comprehensive profile:
- Demographics: Name (Spanish), Age, City (Spain), SES (must match product price!)
- Professional context: Job, income level, work situation
- Desires: What they want to achieve (3-5 specific desires)
- Pains: What frustrates or worries them (3-5 specific pains)
- Top-3 ambitions: Long-term life/professional goals
- Objectives: Short-term goals (next 6-12 months)
- What makes life easier: Daily conveniences they value
- Peace of mind: What helps them feel secure and calm
- Final effect: The ultimate transformation they seek
- Expected result: Tangible outcome they want from solutions
- Consumption patterns: How they make buying decisions (Spain-specific cultural context)

✅ STEP 4: VALIDATE ALIGNMENT (Make sure):
- Does the persona PERFECTLY fit the product's solution? ✓
- Does the persona exist in the GAP/OPPORTUNITY identified? ✓
- Will this persona VALUE the unique positioning? ✓
- Does the SES match the product price? ✓
- Do pains align with what the product solves? ✓
- Is this realistic for the Spanish market? ✓

═══════════════════════════════════════════════
OUTPUT STRUCTURE
═══════════════════════════════════════════════

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
