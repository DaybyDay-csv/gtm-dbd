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
  outputLanguage: z.enum(['es', 'en']).default('es')
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, allPhaseData, outputLanguage } = inputSchema.parse(body);
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting Phase 6 - Validation Map for project:', projectId);

    const prompt = `You are a growth experiment designer. Your mission is to turn all the strategic work into TESTABLE HYPOTHESES.

CONTEXT: We've done deep research on market, buyer, offers, DISC translations, and emotional triggers. Now we need to VALIDATE these hypotheses in real channels with real people.

ALL PREVIOUS PHASE DATA:
${JSON.stringify(allPhaseData, null, 2)}

TASK: Create experiment hypotheses combining:
- Buyer field (desire/pain/ambition/objective)
- Specific offer
- DISC color variant
- Marketing channel (Meta, Google, Email, Landing, TikTok, LinkedIn)

For each experiment specify:
- Hypothesis ID
- Channel
- Headline copy
- CTA
- KPI to measure
- Estimated cost
- Time To Value (TTV)
- State (Discover/Test/Scale)
- Owner (role)

CRITICAL: Return a JSON object with this EXACT structure:
{
  "experiments": [
    {
      "hypothesis": "Deseo→Glow 14d→Rojo",
      "channel": "Meta",
      "headline": "Resultados visibles en 14 días",
      "cta": "Empieza hoy",
      "kpi": "CPL",
      "cost": "€50-100/día",
      "ttv": "7 días",
      "state": "Discover",
      "owner": "PMM",
      "reasoning": "Target red personas on Meta with speed promise"
    },
    {
      "hypothesis": "Tiempo→5min→Verde",
      "channel": "Email",
      "headline": "Solo 5 minutos de tu día",
      "cta": "Prueba gratis",
      "kpi": "Open rate",
      "cost": "€20/día",
      "ttv": "3 días",
      "state": "Test",
      "owner": "CRM",
      "reasoning": "Nurture green personas with ease message"
    }
  ]
}

Create 8-12 diverse experiments covering different channels, DISC colors, and buyer fields. Return ONLY valid JSON, no markdown.

Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a growth experiment expert. Always return valid JSON.' },
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
    console.error('Error in phase-6-validation-map:', error);
    
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
