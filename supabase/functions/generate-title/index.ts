import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const LOVABLE_AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const { companyName, projectName, productContext, positioning } = await req.json();
    
    console.log('Generating title for:', { companyName, projectName });

    const prompt = `Genera un título ejecutivo y descriptivo para un análisis Go-to-Market. 

Información disponible:
- Empresa: ${companyName}
- Producto/Servicio: ${projectName}
- Contexto del producto: ${productContext || 'No disponible'}
- Posicionamiento: ${positioning || 'No disponible'}

El título debe:
1. Ser conciso (máximo 10-12 palabras)
2. Incluir: empresa, producto/servicio, nicho de mercado y oportunidad clave
3. Ser impactante y transmitir valor inmediato
4. Usar lenguaje ejecutivo y profesional

Ejemplo: "Universidad Francisco de Vitoria: Máster en RRHH - Transformación Digital del Talento"

Genera SOLO el título, sin comillas ni explicaciones adicionales.`;

    const requestBody = {
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${LOVABLE_AI_GATEWAY}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error response:', errorText);
      throw new Error(`AI API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));
    
    const title = data?.choices?.[0]?.message?.content?.trim() || 
                 `${companyName}: ${projectName} - Estrategia Go-to-Market`;

    return new Response(
      JSON.stringify({ title }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        title: 'Análisis Go-to-Market Completo'
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  }
});
