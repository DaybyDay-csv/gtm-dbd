import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const inputSchema = z.object({
  projectId: z.string().uuid(),
  brandInfo: z.union([z.array(z.string()), z.record(z.any())]).optional(),
  marketData: z.record(z.any()).optional(),
  outputLanguage: z.enum(['es', 'en']).default('es')
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, brandInfo, marketData, outputLanguage } = inputSchema.parse(body);
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

YOUR MISSION - CREATE PREFECT BUTTERFLY EFFECT BUYER PERSONA:

═══════════════════════════════════════════════
PROCESS TO CREATE THE PERSONA
═══════════════════════════════════════════════

🎯 STEP 1: UNDERSTAND THE MARKET-PRODUCT-GAP FIT
Before creating the persona, you must understand:
- What is the product nucleus? 
- What problem this prodcut solve?
- How does hevolves it?
- Compared to the market competitors,what difference does he bring to the table?
- Doses this problem that the produt solves,has a real demand on the market based on research, tendencies and surveys.
- If so, What market gaps or opportunities exist?
- What value and does it offer that others don't?
- Where is the product positioned vs competitors?

👤 STEP 2: IDENTIFY THE IDEAL BUYER
Based on the above, identify:
- Who is the PERFECT customer for THIS product to solve THIS problem and eventually fill the differentiative/value gap that exists between the business and the competitors?
- Should this persona be MALE or FEMALE? (decide based on market research and product)
- What is their socioeconomic reality in the business main market country? (must match the product's price point)
- What is their professional and personal context?
- Why would they care about THIS specific product?

💭 STEP 3: DEEP PSYCHOLOGICAL PROFILE
Remember: A buyer persona is a MIX of qualities. Many people can coincide in this mix.

Create a comprehensive profile:
- Demographics: Name (Main Market), Age, City (Main Market), SES (must match product price!)
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
- What bothers / unsettles / he/she would like to change.
- What would make he or her life happier and easier.
- What kind of peace of mind he is  looking for.
- What end-effect you want.
- What final result you expect from the product.
¡¡¡Use common sense, cultural consumer insights for the target country and sector-specific data.!!!

🚫 STEP 3.5: IDENTIFY BUYER OBJECTIONS
Based on market research, competitor analysis, and product positioning, identify:
- What concerns or objections would this persona have about THIS product?
- What competitive alternatives might they be considering?
- What doubts arise from gaps in the product vs competitors?
- What hesitations come from market positioning or pricing?

For each objection:
- Provide a clear, specific objection statement
- Assign a likelihood percentage (0-100%) based on:
  * Market research data
  * Competitor strengths vs product weaknesses
  * Common category objections
  * Price point sensitivity

Generate 3-5 objections, ordered by likelihood (highest first).

✅ STEP 4: VALIDATE ALIGNMENT (Make sure):
- Does the persona PERFECTLY fit the product's solution? If not: Weakness & opportunity to help with recommendations and hipothesis founded, analyze and propose one.
- Does the persona exist in the GAP/OPPORTUNITY identified? If not: Weakness & opportunity to help with recommendations and hipothesis founded, analyze and propose one.
- Will this persona VALUE the unique positioning? If not: Weakness & opportunity to help with recommendations and hipothesis founded, analyze and propose one.
- Does the SES match the product price? If not: Weakness & opportunity to help with recommendations and hipothesis founded, analyze and propose one.
- Do pains align with what the product solves? If not: Weakness & opportunity to help with recommendations and hipothesis founded, analyze and propose one.
- Is this realistic for the Spanish market? If not: Weakness & opportunity to help with recommendations and hipothesis founded, analyze and propose one.

═══════════════════════════════════════════════
OUTPUT STRUCTURE
═══════════════════════════════════════════════

CRITICAL: Return a JSON object with this EXACT structure:
{
  "avatar": {
    "name": "Name (male or female, appropriate for Spain)",
    "age": "proper age for a person with the characteristics with the problems the product/service solve"
    "city": "City matching the target market",
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
  },
  "objections": [
    {
      "objection": "Specific concern or doubt the persona has about this product",
      "likelihood": 85,
      "source": "competitor_advantage|market_gap|price_concern|trust_barrier"
    },
    {
      "objection": "Another specific objection based on market/competitor analysis",
      "likelihood": 70,
      "source": "competitor_advantage"
    }
  ]
}

IMPORTANT REMINDERS:
- This is a FRESH persona - do not reference previous projects
- Gender should be determined by the actual target market, not assumed
- All elements must be coherent with the product's positioning on the market, gap and price
- Use realistic market scope names, cities, and cultural context
- Return ONLY valid JSON, no markdown formatting
- Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
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

    console.log('Phase 2 completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-2-buyer-persona:', error);
    
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
