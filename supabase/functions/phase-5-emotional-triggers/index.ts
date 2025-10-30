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
  discData: z.record(z.any()).optional(),
  valueData: z.record(z.any()).optional(),
  outputLanguage: z.enum(['es', 'en']).default('es')
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, persona, discData, valueData, outputLanguage } = inputSchema.parse(body);
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting Phase 5 - Emotional Triggers for project:', projectId);

    const prompt = `You are an emotional trigger specialist. Your mission is to create specific triggers that activate buying decisions.

PROCESS: Combine (buyer characteristic × DISC color × value variable) to create triggers that MOVE people to action.

PERSONA:
${JSON.stringify(persona, null, 2)}

DISC DATA:
${JSON.stringify(discData, null, 2)}

VALUE DATA:
${JSON.stringify(valueData, null, 2)}

TASK: For each (buyer characteristic × DISC color × value variable) combination, create emotional triggers.

Value variables:
- S (Sueño/Dream): Amplify the dream outcome
- P (Probabilidad/Probability): Increase perceived likelihood
- T (Tiempo/Time): Reduce time perception
- E (Esfuerzo/Effort): Minimize effort perception

CRITICAL: Return a JSON object with this EXACT structure:
{
  "triggers": [
    {
      "characteristic": "Poco tiempo disponible",
      "color": "Rojo",
      "variable": "T",
      "trigger": "Velocidad",
      "example": "Hecho en 5 minutos al día",
      "implementation": "Mostrar timer, destacar rapidez"
    },
    {
      "characteristic": "Busca resultados visibles",
      "color": "Amarillo",
      "variable": "P",
      "trigger": "Prueba social",
      "example": "12.000 personas ya lo lograron",
      "implementation": "Testimonios visuales, contador"
    },
    {
      "characteristic": "Necesita seguridad",
      "color": "Verde",
      "variable": "E",
      "trigger": "Acompañamiento",
      "example": "Soporte 24/7 incluido",
      "implementation": "Chat en vivo, email personal"
    }
  ]
}

Create 10-15 diverse triggers covering all DISC colors and value variables. Return ONLY valid JSON, no markdown.

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
          { role: 'system', content: 'You are an emotional trigger expert. Always return valid JSON.' },
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

    console.log('Phase 5 completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-5-emotional-triggers:', error);
    
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
