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
    const { projectId, allPhaseData } = await req.json();
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

Create 8-12 diverse experiments covering different channels, DISC colors, and buyer fields. Return ONLY valid JSON, no markdown.`;

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
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    console.log('Phase 6 completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-6-validation-map:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
