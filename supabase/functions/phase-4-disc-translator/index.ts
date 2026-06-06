import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const inputSchema = z.object({
  projectId: z.string().uuid(),
  offers: z.union([z.array(z.any()), z.record(z.any())]).optional(),
  persona: z.record(z.any()).optional(),
  outputLanguage: z.enum(['es', 'en']).default('es')
});

const outputSchema = z.object({
  discTable: z.array(z.object({
    offer: z.string(),
    red: z.object({ copy: z.string(), tone: z.string(), channel: z.string(), purpose: z.string(), buyingBehavior: z.string() }),
    yellow: z.object({ copy: z.string(), tone: z.string(), channel: z.string(), purpose: z.string(), buyingBehavior: z.string() }),
    green: z.object({ copy: z.string(), tone: z.string(), channel: z.string(), purpose: z.string(), buyingBehavior: z.string() }),
    blue: z.object({ copy: z.string(), tone: z.string(), channel: z.string(), purpose: z.string(), buyingBehavior: z.string() }),
  })).min(1),
  discMap: z.object({
    red: z.number().min(0).max(1),
    yellow: z.number().min(0).max(1),
    green: z.number().min(0).max(1),
    blue: z.number().min(0).max(1),
  }),
});


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, offers, persona, outputLanguage } = inputSchema.parse(body);

    // Rate limiting (Phase 0 stabilization)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const rlAuthHeader = req.headers.get('authorization');
    const rlIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    let rlKey = rlIp;
    let rlMax = 10;
    if (rlAuthHeader) {
      try {
        const { data: { user: rlUser } } = await supabaseAdmin.auth.getUser(rlAuthHeader.replace('Bearer ', ''));
        if (rlUser) { rlKey = rlUser.id; rlMax = 50; }
      } catch { /* anon */ }
    }
    const { data: rlResult } = await supabaseAdmin.rpc('check_rate_limit', {
      key: rlKey, endpoint: 'phase-4-disc-translator', max_requests: rlMax, window_minutes: 1440,
    });
    if (rlResult && !rlResult.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please sign up or try again later.',
        retryAfter: rlResult.retry_after, limit: rlResult.limit, currentCount: rlResult.current_count,
      }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting Phase 4 - DISC Translator for project:', projectId);

    const prompt = `You are a DISC communication expert who understands that a buyer persona is a MIX of qualities, and many people can share similar mixes.

═══════════════════════════════════════════════
IMPORTANT CONTEXT - WHY WE USE DISC
═══════════════════════════════════════════════

A buyer persona is NOT just one color. It's a combination of traits. Many different people can match the same persona profile because they share similar desires, pains, and ambitions. 

However, these people may respond to DIFFERENT communication styles based on their dominant DISC personality color.

🎯 Our job is to translate the SAME value proposition into 4 different emotional languages:
- 🔴 RED personalities understand through ACTION and RESULTS
- 🟡 YELLOW personalities understand through EXCITEMENT and SOCIAL PROOF
- 🟢 GREEN personalities understand through TRUST and SECURITY
- 🔵 BLUE personalities understand through LOGIC and DATA

This way, we can communicate effectively with everyone who fits the buyer persona, regardless of their communication preference.

═══════════════════════════════════════════════
INPUT DATA
═══════════════════════════════════════════════

OFFERS TO TRANSLATE:
${JSON.stringify(offers, null, 2)}

PERSONA CONTEXT:
${JSON.stringify(persona, null, 2)}

═══════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════

Translate each offer into 4 DISC color variants:
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

discMap shows estimated distribution in target audience (must sum to 1.0). Return ONLY valid JSON, no markdown.

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
          { role: 'system', content: `You are a DISC personality expert. Always return valid JSON. You MUST respond with ONLY a valid JSON object. Write all content in ${outputLanguage === 'es' ? 'Spanish (España)' : 'English'}.` },
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

    
    // Validate parsed result against output schema
    const validation = outputSchema.safeParse(result);
    if (!validation.success) {
      console.error('Output schema validation failed:', JSON.stringify(validation.error.issues).slice(0, 500));
      return new Response(
        JSON.stringify({
          error: 'Output schema validation failed',
          issues: validation.error.issues,
          raw_preview: JSON.stringify(result).slice(0, 500),
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const validatedResult = validation.data;
console.log('Phase 4 completed successfully');

    return new Response(JSON.stringify(validatedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-4-disc-translator:', error);
    
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
