import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const inputSchema = z.object({
  projectId: z.string().uuid(),
  persona: z.record(z.any()).optional(),
  brandInfo: z.record(z.any()).optional(),
  outputLanguage: z.enum(['es', 'en']).default('es')
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, persona, brandInfo, outputLanguage } = inputSchema.parse(body);
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting Phase 3 - Value Equation for project:', projectId);

    const prompt = `You are an expert in Alex Hormozi's Value Equation: Value = (Dream outcome × Perceived likelihood of achievement) / (Time delayed × Effort & Sacrifice)

Your mission is to create high-value offers that fill market gaps and serve the buyer persona.

BUYER PERSONA:
${JSON.stringify(persona, null, 2)}

BRAND & PRODUCT INFO:
${JSON.stringify(brandInfo, null, 2)}

Create 4-6 compelling offers that:
1. MAXIMIZE the numerator (Dream Outcome × Perceived Probability)
2. MINIMIZE the denominator (Time Delay × Effort & Sacrifice)
3. Leverage market gaps and positioning opportunities
4. Are SPECIFIC, ACTIONABLE, and irresistible

CRITICAL: Return ONLY a JSON object with this EXACT structure (no markdown, no extra text):
{
  "offers": [
    {
      "field": "Desires",
      "targetNeed": "specific desire being addressed",
      "offer": "Compelling offer name that speaks to dream outcome",
      "valueGauge": {
        "value": 78,
        "numerator": {"dream": 0.9, "probability": 0.85},
        "denominator": {"time": 0.4, "effort": 0.35}
      },
      "raiseNumerator": [
        "Guarantee or proof that increases perceived likelihood",
        "Another tactic that makes success seem certain"
      ],
      "lowerDenominator": [
        "Quick win or time saver",
        "Effort reducer or done-for-you element"
      ]
    }
  ],
  "overallValue": 75
}

Each offer must target a different buyer need (desires, pains, ambitions, objectives).
Value scores should be 0-100.
Return ONLY valid JSON.

Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
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
    let content = data.choices[0].message.content;
    
    // Clean up the content - remove markdown code blocks if present
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/g, '');
    }
    content = content.trim();
    
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

    console.log('Phase 3 completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-3-value-equation:', error);
    
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
