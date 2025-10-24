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
    const { projectId, persona, brandInfo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting Phase 3 - Value Equation for project:', projectId);

    const prompt = `You are an expert in Alex Hormozi's Value Equation: Value = (Dream outcome × Percieved likelyhood of achievement) / (Time delayed × Effort & Sacrifice )

Your mission is to EXPLODE the potential of the product by creating high-value offers that fill market gaps and serve the buyer persona. That help the buyers 
Sees themselves in dream outcome
Sees higher chances of success
Sees shorter time to results
Sees less effort and sacrifice
Without false promisses, based on showcasing correctly the product real value, what he brings to the table and exploding the differentiators and gaps on the market if existed.
The ressult comes from a clear value communication, not flase promisses. 

BUYER PERSONA (with all desires, pains, ambitions, real peace givers and objectives):
${JSON.stringify(persona, null, 2)}

BRAND & PRODUCT INFO (including gaps if existed and positioning):
${JSON.stringify(brandInfo, null, 2)}

YOUR PROCESS:

## STEP 1: MAP BUYER NEEDS TO MARKET OPPORTUNITIES
   - Review ALL buyer fields: desires, pains, ambitions, objectives
   - Identify which needs align with market gaps/opportunities
   - Prioritize the needs with highest urgency + market fit
## STEP 2: CRAFT VALUE-EQUATION OFFERS
   For EACH key buyer need, create an offer that:
   1. MAXIMIZES the numerator (Dream Outcome × Perceived Probability)
      - Make the dream MORE desirable
      - Make success feel MORE certain (guarantees, proof, testimonials)
         
   2. MINIMIZES the denominator (Time Delay × Effort & Sacrifice)
      - Reduce time to get results (speed)
      - Reduce effort required (ease, done-for-you elements)
      ## STEP 3: ENSURE OFFERS EXPLOIT THE GAPS
   - Each offer should leverage a market gap or pivot opportunity
   - Each offer should be IRRESISTIBLE based on the value equation
   - Each offer should be positioned to beat competitors
Increase Dream Outcome and Perceived Likelihood.
Decrease Time Delay and Effort/Sacrifice.

- Present the offer so the buyer feels the value gap (value ≫ price).
- You must output a complete offer that includes: core promise, bonuses, real scarcity, real urgency, risk-reversal guarantees with teeth, a memorable name, pricing with anchors, and message-to-channel fit.
- Inputs (already provided by the system before you run)
- Possible Channels: {e.g., Website, Email, Meta/IG, LinkedIn, Partners, Tiktok, Youtube}
- Available Proof/Assets: {testimonials, case studies, metrics, community, partners, if not found, research studies on market and surveys REAL}

Required Outputs (structure)
- Core Offer (one-sentence promise + deliverables)
- Bonus Stack (each bonus named, benefit-driven, with reference value)
- Scarcity (type + rule, real & verifiable)
- Urgency (deadline/temporal condition, real & verifiable)
- Guarantee (type, exact copy, conditions; risk-reversal with teeth)
- Offer Name (memorable, outcome-oriented)
- Price & Anchors (price, value comparison, cost-of-inaction)
- Message–Channel Fit (who, what, why now, which channel; headline + CTA)


Value Equation Summary (what you raised/lowered and how)
Return everything in valid JSON (schema below) plus a short copy block ready to paste on a website hero.
Method (follow step-by-step)

1) Define the Dream Outcome precisely
State the transformation in concrete, measurable, desirable terms—using the buyer’s language.
Output: DreamOutcome: "<clear, measurable transformation>"

2) Raise Perceived Likelihood of Achievement
Select the most credible proofs (cases, numbers, demonstrations, mechanism).
Explain simply why this works and why it’s likely to work for this buyer.
Output: KeyProofs: [ ... ], Mechanism: "<why this works consistently>"

3) Shorten the Time Delay to first value
Design a Quick Win (real value delivered fast). Offer an accelerated/fast-track if possible.
Output: FirstValueIn: "<timeframe>", QuickWin: "<what they get quickly>"

4) Reduce Effort & Sacrifice
Remove steps, provide “done-for-you” elements, checklists, templates, automations.
Output: FrictionRemoved: [ ... ], Enablers: [ "Checklist …", "Template …", "Automation …" ]
5) Build a Bonus Stack that makes price feel tiny
Break your service into visible components and stack them as bonuses.
Prefer tools/checklists/templates over “more training” (lower effort, higher perceived value).
You may add scarcity/urgency to specific bonuses.
Output:
Bonuses: [{ "name": "...", "benefit": "...", "refValue": "...", "scarcity": "yes/no", "urgency": "yes/no" }, ...]
6) Set Real Scarcity (choose 1–2 forms)
Options: total capacity cap, growth-rate cap (X new clients/week), cohort cap (X per class/launch), limited bonuses, never-again variants.
Must be honest, enforced, and communicated (e.g., show “sold out” when it happens).
Output: Scarcity: { "type": "...", "rule": "...", "howToProve": "..." }
7) Add Real Urgency (time-bound)
Options: rolling cohorts (“starts Monday”), seasonal promos (true start/end dates), pricing/bonus windows, or exploding opportunities (value decays with time).
Must be honest, enforced, and consistent.
Output: Urgency: { "deadline": "YYYY-MM-DD hh:mm", "condition": "...", "whatExpires": "..." }
8) Craft a Guarantee that reverses risk (with “teeth”)
Choose according to ticket and fulfillment cost:
Unconditional (best in low-ticket, simple refunds).
Conditional with outsized payout (double/triple money-back; tied to buyer’s key actions).
Implied/performance-based (rev-share, triggers).
Stacked guarantees (e.g., 30-day unconditional + 90-day conditional).
Write exact copy and list conditions transparently.
Output:
Guarantee: { "type": "unconditional/conditional/implied/stack", "copy": "...", "conditions": "...", "whyCredible": "..." }
9) Name the Offer
Memorable, outcome-oriented (you can also rename promos seasonally without changing the core).
Output: OfferName: "<unique, outcome-oriented name>"
10) Set Price & Anchors
Present the stacked value (core + bonuses) then the price (a fraction of total value).
Include anchors (pricier alternatives, cost-of-inaction, equivalent monthly cost, etc.).
If you plan to raise prices, announce it (clears pipeline before the hike).
Output:
PerceivedTotalValue: "<sum reference>", Price: "<amount>",
Anchors: ["alternative costs", "ROI logic", "cost of inaction"]
11) Message–Channel Fit
Write headline + CTA that combine Dream Outcome, Quick Win, and Guarantee.
Map core message to each channel (Web/Email/Ads/LinkedIn etc.), with a minimal creative brief.
Output:
MessagesByChannel: [{ "channel": "Web", "headline": "...", "bullets": ["..."], "CTA": "...", "creative": "..." }, ...]
12) Summarize the Value Equation (one line per lever)
Output:
ValueEquation: { "Up_DreamOutcome": "...", "Up_Likelihood": "...", "Down_Time": "...", "Down_Effort": "..." }
JSON Schema (return exactly this structure)
{
  "DreamOutcome": "",
  "KeyProofs": [],
  "Mechanism": "",
  "FirstValueIn": "",
  "QuickWin": "",
  "FrictionRemoved": [],
  "Enablers": [],
  "Bonuses": [
    { "name": "", "benefit": "", "refValue": "", "scarcity": "yes/no", "urgency": "yes/no" }
  ],
  "Scarcity": { "type": "", "rule": "", "howToProve": "" },
  "Urgency": { "deadline": "", "condition": "", "whatExpires": "" },
  "Guarantee": { "type": "", "copy": "", "conditions": "", "whyCredible": "" },
  "OfferName": "",
  "PerceivedTotalValue": "",
  "Price": "",
  "Anchors": [],
  "MessagesByChannel": [
    { "channel": "Web", "headline": "", "bullets": [], "CTA": "", "creative": "" },
    { "channel": "Email", "headline": "", "bullets": [], "CTA": "", "creative": "" },
    { "channel": "Ads", "headline": "", "bullets": [], "CTA": "", "creative": "" }
  ],
  "ValueEquation": {
    "Up_DreamOutcome": "",
    "Up_Likelihood": "",
    "Down_Time": "",
    "Down_Effort": ""
  }


CRITICAL: Return a JSON object with this EXACT structure:
{
  "offers": [
    {
      "field": "Desires",
      "targetNeed": "specific desire being addressed",
      "offer": "Programa Glow de 14 días",
      "valueGauge": {
        "value": 78,
        "numerator": {"dream": 0.9, "probability": 0.85},
        "denominator": {"time": 0.4, "effort": 0.35}
      },
      "raiseNumerator": [
        "Garantía visible",
        "Testimonios verificados antes/después"
      ],
      "lowerDenominator": [
        "Guía de 5 minutos diarios",
        "Kit de inicio incluido"
      ]
    },
    {
      "field": "Pains",
      "targetNeed": "specific pain being solved",
      "offer": "Another compelling offer",
      "valueGauge": {
        "value": 72,
        "numerator": {"dream": 0.85, "probability": 0.8},
        "denominator": {"time": 0.45, "effort": 0.4}
      },
      "raiseNumerator": ["tactic 1", "tactic 2"],
      "lowerDenominator": ["tactic 1", "tactic 2"]
    }
  ],
  "overallValue": 75}
Ready-to-Use Copy Block (Website Hero)
H1: {DreamOutcome} without {Top Effort you removed} in {FirstValueIn}.
Subhead: Proven method + {Short Guarantee}.
CTA: Start now → get {QuickWin} today.
Bonuses Section: “But wait, there’s more” (list your Bonus Stack with reference values).
Implementation Notes (for the model)
Do not drop price until you’ve maximized perceived value and set anchors.
Scarcity and urgency must be real; communicate “sold out” when capacity is reached.
Guarantees need teeth: specific outcomes or clear conditions tied to buyer actions.
Prefer tools/checklists/templates over extra “training” as bonuses (less effort, higher perceived value).
Always explain explicitly how you increased numerator (Outcome × Likelihood) and decreased denominator (Time × Effort) of the Value Equation.

Create 4-6 compelling offers covering desires, pains, ambitions, and objectives. Value scores 0-100. 
Each offer should be SPECIFIC, ACTIONABLE, and aligned with a market gap.
Return ONLY valid JSON, no markdown.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    console.log('Phase 3 completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-3-value-equation:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
