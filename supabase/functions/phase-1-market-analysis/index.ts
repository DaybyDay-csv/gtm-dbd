import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const inputSchema = z.object({
  projectId: z.string().uuid(),
  url: z.string().url().max(2048),
  productDescription: z.string().trim().min(10).max(5000),
  context: z.string().max(2000).optional(),
  competitors: z.string().max(1000).optional(),
  vision: z.string().max(1000).optional(),
  mission: z.string().max(1000).optional(),
  values: z.string().max(1000).optional(),
  docs: z.string().max(5000).optional(),
  outputLanguage: z.enum(['es', 'en']).default('es')
});

// SSRF protection: validate URL is not private/internal
function isUrlSafe(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // Block private IP ranges and localhost
    const hostname = parsed.hostname;
    const privatePatterns = [
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./,
      /^localhost$/i,
      /^0\.0\.0\.0$/,
      /^\[?::1\]?$/,
      /^\[?fe80:/i
    ];
    
    if (privatePatterns.some(pattern => pattern.test(hostname))) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const body = await req.json();
    const validated = inputSchema.parse(body);
    
    // SSRF protection
    if (!isUrlSafe(validated.url)) {
      return new Response(
        JSON.stringify({ error: 'Invalid or unsafe URL provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { projectId, url, productDescription, context, competitors, vision, mission, values, docs, outputLanguage } = validated;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting Phase 1 - Market Analysis for project:', projectId);
    
    // Step 1: Actually scrape the website
    console.log('Fetching website content from:', url);
    let websiteContent = '';
    try {
      // Fetch with timeout and size limits
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const websiteResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GTM-Factory-Bot/1.0)'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!websiteResponse.ok) {
        throw new Error(`Failed to fetch website: ${websiteResponse.status}`);
      }
      
      const html = await websiteResponse.text();
      
      // Extract meaningful text content (remove scripts, styles, etc.)
      const textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      websiteContent = textContent.substring(0, 50000); // Limit to ~50k chars
      console.log('Website content scraped successfully, length:', websiteContent.length);
    } catch (scrapeError) {
      console.error('Error scraping website:', scrapeError);
      websiteContent = `[Could not scrape website: ${scrapeError instanceof Error ? scrapeError.message : 'Unknown error'}]`;
    }

    const prompt = `You are a Market Research Expert + Brand Strategist + Product Analyst conducting a REAL, EXHAUSTIVE deep-dive analysis from scratch.

⚠️ CRITICAL: This is a COMPLETELY NEW AND INDEPENDENT analysis. You start with a BLANK SLATE. Do NOT reference, blend, or carry over ANY information from previous analyses or projects.

⚠️ CRITICAL: You are analyzing the ACTUAL SCRAPED CONTENT from the website below. DO NOT use any prior knowledge about this brand or URL. ONLY analyze what you see in the actual content provided.

═══════════════════════════════════════════════
🎯 CORE PRODUCT/SERVICE DESCRIPTION (PROVIDED BY CLIENT - USE THIS AS PRIMARY CONTEXT):
═══════════════════════════════════════════════

${productDescription}

⚠️ This is the CLIENT'S OWN DESCRIPTION of what they sell/provide. Use this as the north star source of truth about their offering. Cross-reference with the website content to get additional details, but this description should anchor your entire analysis.

═══════════════════════════════════════════════
🔍 STEP 0: CLIENT READINESS ASSESSMENT (CRITICAL FIRST)
═══════════════════════════════════════════════

Before doing the full analysis, assess if this client has sufficient resources to benefit from paid media strategies and full GTM implementation:

**Evaluate these indicators from the website and content:**
1. Business Maturity: Startup, early growth, established, or mature?
2. Budget Signals: Website sophistication, pricing visible, enterprise features, team size indicators
3. Marketing Capability: Existing marketing content, SEO efforts, paid ads mentions, content quality
4. Scale Indicators: Customer testimonials, case studies, team size, office locations, funding mentions

**Client Readiness Score (1-5):**
- 1-2: Limited resources - Need simplified, cost-effective approach
- 3: Moderate resources - Can test paid media with guidance
- 4-5: Strong resources - Ready for full paid media and validation system

**Recommendation:**
- If score 1-2: Focus on organic positioning, messaging framework, and low-cost validation
- If score 3+: Full analysis with paid media strategies and experimentation framework

═══════════════════════════════════════════════
📄 ACTUAL WEBSITE CONTENT (SCRAPED):
═══════════════════════════════════════════════

${websiteContent}

═══════════════════════════════════════════════
📋 ADDITIONAL INPUT DATA:
═══════════════════════════════════════════════

- Brand URL: ${url || 'Not provided'}
- Product/Service Description (from client): ${productDescription}
- Additional Context: ${context || 'None provided'}
- Competitors to analyze: ${competitors || 'To be researched based on the product'}
- Vision: ${vision || 'Extract from website content'}
- Mission: ${mission || 'Extract from website content'}
- Values: ${values || 'Extract from website content'}
- Additional documentation: ${docs || 'None provided'}

═══════════════════════════════════════════════
🛒 MARKETPLACE DETECTION (IMPORTANT)
═══════════════════════════════════════════════

Analyze if this product is sold on marketplaces. Check URL and content for:
- Amazon (ASIN, /dp/, "fulfilled by Amazon")
- TikTok Shop (#TikTokMadeMeBuyIt, tiktok.com/@shop)
- Shopify (myshopify.com, cdn.shopify.com)
- Etsy (etsy.com/shop/)
- eBay (ebay.com/itm/)

For EACH detected marketplace, include:
- name, confidence (high/medium/low), evidence
- 2-3 native ad options (brief)
- 2-3 organic strategies (brief)
- Simple budget estimate
- 2-3 pros, 2-3 cons (concise)

Keep this section CONCISE - max 3-4 sentences per field.

IMPORTANT - ANALYSIS PRIORITY ORDER:
1. START with the client's product description above - this is your north star
2. Cross-reference and expand with the scraped website content
3. With the scraped website content identify, Brand Name, Main product and Main Market (country, industry and niche).
4. DO NOT use prior knowledge about this brand - only what's provided, but you can develop a historic-investigation on what this brand ahas done trough the years to add context for the analisys. 
5. After understanding the product deeply, research real competitors in this space,


═══════════════════════════════════════════════
 STEP 1: DEEP PRODUCT UNDERSTANDING (CRITICAL)
═══════════════════════════════════════════════

Before anything else, you MUST deeply understand the PRODUCT/SERVICE in order to provide a legitimate, real help by exploding the benefits from it, and giving solutions or upgrades as recomendations to the weak points in form of messagign and hypothesis to check if the market willl lik those changes or upgrades or not of the bad things:
In-depth Research, Brand & Market Study
- Analyze brand information: website + internal brand docs, Vision, Mission, and Values if provided.
- Create a **positioning map**
- Study the products/services and what solutions they cover (this will be very useful later on)
- A 10,000-foot macro of the market status of the problems they solve. 
- Is the problem real and demanded? (research studies and tendencies) If not, "Weakness & opportunity to help with recommendations and hipothesis founded"
- How the brand currently stands in the market (- What the market is like - What gaps/opportunities there are to fill in the market historically, depending on the market it operates in, what types of brands have existed, and which ones are missing).
- Competitor research
- How the brand differentiates itself (if it does),If not "Weakness & opportunity to help with recommendations and hipothesis  founded"
- Weaknesses vs. competitors
- Opportunities (if any, directly related to its differentiation; if not, & opportunity to help with recommendations and hipothesis, they will be pivot opportunities)
- Identify the perceptions the market in the main market (previous country, industry and niche focus) of focus  has about brands in its niche market and average ticket price.
- Describe it in bullet points + executive summary.

- If so, what gap does it represent in the market in terms of target TAM? 
This point must be thoroughly calculated and validated with numbers and research. Dees researchit.

---
1. **What is the product/service?**
   - What is it called? (specific name or category)
   - What category does it belong to?
   - Is it B2B, B2C, SaaS, physical product, service, etc.?
   - What large niche does it belong to?

2. **What PROBLEMS does it solve?** (Be VERY specific)
   - What pain points does it address?
   - What needs does it fulfill?
   - What frustrations does it eliminate?
   - List 3-5 specific problems with examples

3. **What UTILITY does it provide?**
   - What can users DO with this product/service?
   - What outcomes/results does it enable?
   - What transformation does it create?
   - What is the END BENEFIT for the user?

4. **What VALUE does it bring?**
   - Why would someone choose THIS over alternatives?
   - What makes it valuable in the market?
   - What is the economic/emotional/practical value?
   - What is the pricing model and how does it relate to value?

5. **How is it POSITIONED?**
   - How do THEY describe themselves?
   - What is their unique angle/approach?
   - What promises do they make?
   - What is their tone and brand personality?
   - Is it the description they relate themseles real? 
   - check with the market feedback about the product/service they provide with the demand the market givs and is this positioning usefull?
   

6. **What GAPS can it cover?**
   Based on the product features, capabilities, and positioning:
   - What market opportunities is it suited for?
   - What underserved needs could it address?
   - What pivots or expansions make sense?
   - What adjacent problems could it solve?

═══════════════════════════════════════════════
YOUR MISSION - 360° DEEP RESEARCH
═══════════════════════════════════════════════

═══════════════════════════════════════════════
PHASE 1: WEBSITE & PRODUCT DEEP DIVE (30 min)
═══════════════════════════════════════════════

🔍 STEP 1 - UNDERSTAND THE CLIENT, extract this information from the actual website or from the imputs:
Visit the URL and conduct a comprehensive analysis:
- Who is this company? Name, industry, years in market
- What is their vision, mission, and core values?
- What is their brand personality and tone of voice?
- What stage are they in? (startup, growth, mature)

🎯 STEP 2 - UNDERSTAND THE OFFERING (Main Product Focus):
Identify the MAIN product or service they offer:
- What is it called?
- What EXACT problem does it solve? (Be specific)
- HOW does it solve it? (mechanism, process, approach)
- What is the average ticket/price point? (Estimate if not visible)
- What is the business model? (B2B, B2C, SaaS, e-commerce, subscription, one-time, etc.)

💎 STEP 3 - UNDERSTAND THE POSITIONING:
- How does this brand position itself vs competitors?
- Premium, mid-market, or budget?
- What are the PROS of this product? (3-5 specific strengths)
- What are the CONS? (3-5 limitations or weaknesses)
- What makes it different? (differentiation factors)
- How does it connect with current market needs?

═══════════════════════════════════════════════
PHASE 2: PRODUCT NUCLEUS (Core Understanding)
═══════════════════════════════════════════════

📦 STEP 4 - DEFINE THE PRODUCT NUCLEUS:
This is the HEART of everything. You must define:
- Main product or general service name (what is it called?)
- 3-5 specific problems it solves
- 2-3 market gaps it could potentially cover (based on your research from the competitors and rememer acting as a brand strategist)
- Unique value proposition (what makes it special)
- How it connects to the market opportunity you identify

═══════════════════════════════════════════════
PHASE 3: MARKET RESEARCH (10,000 feet view)
═══════════════════════════════════════════════

🌍 STEP 5 - MACRO MARKET VIEW:
Analyze the market from a high-level perspective:
- What is the current state of this market? (size, growth, maturity)
- What historical gaps have existed in this space?
- What emerging opportunities are there?
- What are the key market dynamics, drivers, and barriers?

🏆 STEP 6 - COMPETITIVE LANDSCAPE (REAL competitors from web research):
Research and analyze 5-7 REAL competitors:
- Use actual company names
- Document their positioning (price vs quality)
- Identify their key differences vs our brand
- Expose their weaknesses and gaps
- Identify pivot opportunities for our brand

💡 STEP 7 - MARKET GAPS & PIVOT OPPORTUNITIES:
Identify specific opportunities:
- What are the top 3 gaps in the market?
- What opportunities exist that competitors are missing?
- What pivots could this company make to capture more value?
- What underserved segments exist?

💰 STEP 8 - TAM (TOTAL ADDRESSABLE MARKET):
Estimate the Total Addressable Market:
- Market size range (be realistic)
- Data-driven assumptions
- Geographic scope
- Market segment focus
- Confidence level (low/medium/high)

═══════════════════════════════════════════════
OUTPUT STRUCTURE
═══════════════════════════════════════════════

CRITICAL: Return a JSON object with this EXACT structure (this is what the UI will render):
{
  "clientReadiness": {
    "score": 3,
    "maturity": "Early growth stage",
    "budgetSignals": ["Website quality", "Pricing model", "Team indicators"],
    "recommendation": "Specific recommendation based on score - full or simplified approach",
    "reasoning": "Why you gave this score - 2-3 sentences explaining the assessment"
  },
  "summary": [
    "Company identity and what they do",
    "SPECIFIC product/service name and category",
    "DETAILED problems it solves (be specific with examples)",
    "CLEAR utility and transformation it provides",
    "VALUE proposition and why it matters",
    "Current positioning and unique angle",
    "Market positioning and differentiation",
    "Key strengths"
  ],
  "productUnderstanding": {
    "mainProduct": "Exact product/service name",
    "category": "Product category (SaaS, physical, service, etc.)",
    "problemsSolved": [
      "Specific problem 1 with context",
      "Specific problem 2 with context",
      "Specific problem 3 with context"
    ],
    "utility": "What users can DO with this - specific outcomes and transformations",
    "value": "Why this matters - economic/emotional/practical value explained",
    "positioning": "How they position themselves in the market - their unique angle",
    "gapsCovered": [
      "Market opportunity/gap 1 they can address",
      "Market opportunity/gap 2 they can address",
      "Market opportunity/gap 3 they can address"
    ]
  },
  "productAnalysis": {
    "averageTicket": "€XXX or price range",
    "pros": ["Strength 1", "Strength 2", "Strength 3"],
    "cons": ["Limitation 1", "Limitation 2", "Limitation 3"],
    "differentiation": "How this product stands out",
    "marketConnection": "How the product connects with market needs"
  },
  "productNucleus": {
    "product": "Main product name",
    "problemsSolved": ["Problem 1 it solves", "Problem 2 it solves", "Problem 3 it solves"],
    "gaps": ["Market gap 1 it could cover", "Market gap 2 it could cover"],
    "value": "Unique value proposition that makes it different"
  },
  "macroView": {
    "marketState": "Current market description (size, maturity, growth)",
    "historicalGaps": "Historical problems in this market",
    "opportunities": "Emerging opportunities"
  },
  "marketGaps": [
    "Gap 1: Description",
    "Gap 2: Description", 
    "Gap 3: Description"
  ],
  "competitors": {
    "analysis": "In-depth competitive analysis (5-7 competitors with names and details)",
    "recommendations": [
      "Strategic recommendation 1",
      "Pivot opportunity 2",
      "Market positioning suggestion 3"
    ]
  },
  "xyChart": {
    "xAxis": {"label": "Price (low → high)"},
    "yAxis": {"label": "Quality (low → high)"},
    "points": [
      {"id":"our_brand","x":0.55,"y":0.78,"label":"Your brand","color":"#dc2626","size":8},
      {"id":"comp_A","x":0.18,"y":0.80,"label":"[Real Competitor Name]"},
      {"id":"comp_B","x":0.80,"y":0.22,"label":"[Real Competitor Name]"},
      {"id":"comp_C","x":0.15,"y":0.25,"label":"[Real Competitor Name]"},
      {"id":"comp_D","x":0.74,"y":0.74,"label":"[Real Competitor Name]"},
      {"id":"comp_E","x":0.40,"y":0.45,"label":"[Real Competitor Name]"},
      {"id":"comp_F","x":0.62,"y":0.30,"label":"[Real Competitor Name]"}
    ],
    "notes": "Strategic positioning insights: identify white space opportunities and crowded market segments"
  },
  "tamEstimate": {
    "value": "€X-Y million (or appropriate currency/scale)",
    "assumptions": [
      "Specific assumption with data point",
      "Market segment definition and size",
      "Geographic scope and penetration rate",
      "Growth rate and timeline assumptions"
    ],
    "confidence": "low/medium/high"
  },
  "marketplacePresence": {
    "detected": true/false,
    "platforms": [
      {
        "name": "Amazon",
        "confidence": "high",
        "evidence": "Brief evidence found",
        "nativeAdOptions": ["Option 1", "Option 2"],
        "organicStrategies": ["Strategy 1", "Strategy 2"],
        "estimatedBudget": "€X-Y/month",
        "pros": ["Pro 1", "Pro 2"],
        "cons": ["Con 1", "Con 2"]
      }
    ],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  }
}

IMPORTANT REMINDERS:
- START with deep product understanding - really understand what it does, solves, and provides
- This is a FRESH analysis starting from ZERO - do not reference previous projects
- Do NOT blend or carry over information from other analyses
- Be SPECIFIC and DETAILED - no generic descriptions
- Use actual competitor names when possible
- Position competitors realistically based on real product price and market feedback on theyr quality across all quadrants (not all in one area)
- Base all insights on the actual URL and market research
- Show you TRULY understand the product by being detailed and specific, no generic assumptions ad no specilations, real market feedback
- Return ONLY valid JSON, no markdown formatting

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
          { role: 'system', content: 'You are a market analysis expert. You MUST respond with ONLY a valid JSON object. Do NOT include any explanatory text, markdown formatting, or code blocks. Return ONLY the raw JSON object starting with { and ending with }. Keep all text fields concise.' },
          { role: 'user', content: prompt }
        ],
        response_mime_type: "application/json"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    console.log('AI Gateway response status:', response.status);
    console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    // Get response text first to handle empty responses
    const responseText = await response.text();
    console.log('Response text length:', responseText.length);
    console.log('Response text preview (first 200 chars):', responseText.substring(0, 200));
    
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

    console.log('Parsed data structure:', JSON.stringify({
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message,
      messageKeys: data.choices?.[0]?.message ? Object.keys(data.choices[0].message) : []
    }));

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected AI Gateway response structure:', JSON.stringify(data));
      throw new Error('AI Gateway response missing expected fields');
    }

    const message = data.choices[0].message;
    
    // Handle both content and reasoning fields (some models use reasoning instead of content)
    // For Gemini 2.5 Pro, check reasoning first, then content
    let content = message.reasoning || message.content || '';
    
    // If content is still empty, check reasoning_details array
    if (!content && message.reasoning_details && Array.isArray(message.reasoning_details)) {
      const reasoningText = message.reasoning_details
        .filter((detail: any) => detail.type === 'reasoning.text')
        .map((detail: any) => detail.text)
        .join('\n');
      if (reasoningText) {
        content = reasoningText;
      }
    }
    
    console.log('Content source:', message.reasoning ? 'reasoning' : message.content ? 'content' : 'reasoning_details');
    console.log('Content length:', content.length);
    
    if (!content || content.trim() === '') {
      console.error('All content fields are empty in AI response');
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
    
    // Try to extract JSON object from content (handles markdown and reasoning text)
    // Look for the first { and last } to extract just the JSON
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      console.error('No valid JSON object found in content');
      console.error('Content preview:', content.substring(0, 500));
      throw new Error('AI response does not contain a valid JSON object');
    }
    
    // Extract the JSON portion
    content = content.substring(firstBrace, lastBrace + 1);
    
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
      console.log('Successfully parsed JSON response');
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      console.error('JSON Parse Error:', parseError);
      console.error('Content that failed to parse (first 500 chars):', content.substring(0, 500));
      console.error('Content that failed to parse (last 500 chars):', content.substring(Math.max(0, content.length - 500)));
      throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
    }

    console.log('Phase 1 completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phase-1-market-analysis:', error);
    
    // Handle validation errors specifically
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
