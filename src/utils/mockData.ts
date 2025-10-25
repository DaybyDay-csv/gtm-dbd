// Mock data for development purposes
export const mockAnalysisState = {
  projectId: "mock-project-id",
  currentPhase: 7,
  isRunning: false,
  awaitingBudgetInput: false,
  budgetLevel: "Medio",
  budgetAmount: 5000,
  clientReadiness: {
    score: 8.5,
    maturity: "Growth Stage",
    budgetSignals: [
      "Active marketing spend",
      "Sales team in place",
      "Revenue generating"
    ],
    reasoning: "Strong signals indicate readiness for strategic GTM optimization. Company shows evidence of product-market fit and resources to execute.",
    recommendation: "Focus on conversion optimization and scaling winning channels. Consider A/B testing framework for rapid iteration."
  },
  phases: {
    phase1: {
      summary: {
        brandName: "MarketFlow AI",
        category: "Marketing Automation Platform",
        tagline: "Turn marketing data into predictable revenue"
      },
      productUnderstanding: "MarketFlow AI is a next-generation marketing automation platform that uses artificial intelligence to analyze campaign data and recommend optimal strategies. The platform integrates with major ad networks and provides real-time insights for B2B SaaS companies looking to scale their marketing operations efficiently.",
      productNucleus: {
        coreValue: "Turn marketing data into predictable revenue",
        emotionalHook: "Stop guessing, start knowing what works",
        mechanism: "AI analyzes 100+ data points to recommend optimal campaigns"
      },
      positioning: {
        category: "Marketing Automation Platform",
        competitors: ["HubSpot", "Marketo", "ActiveCampaign"],
        differentiators: ["AI-powered segmentation", "Real-time personalization", "Unified customer view"]
      },
      market: {
        size: "$12.3B",
        growth: "23% YoY",
        trends: ["AI adoption", "Privacy-first marketing", "Omnichannel integration"]
      }
    },
    phase2: {
      profile: {
        role: "Marketing Director",
        company: "Mid-market B2B SaaS",
        industry: "Software & Technology",
        teamSize: "5-15 people",
        triggers: [
          "Low email engagement rates",
          "Difficulty tracking campaign ROI",
          "Manual segmentation processes"
        ],
        painPoints: [
          "Spending 20+ hours/week on manual reporting",
          "Unable to attribute revenue to specific campaigns",
          "Missing opportunities due to slow data analysis"
        ],
        reliability: 87,
        goals: [
          "Increase campaign conversion by 40%",
          "Reduce time spent on reporting by 50%",
          "Improve lead quality scores"
        ],
        buyingCriteria: [
          "Easy integration with existing tools",
          "Clear ROI within 90 days",
          "Strong customer support"
        ]
      }
    },
    phase3: {
      offers: [
        {
          offer: "Free 30-Day Trial + Onboarding",
          valueGauge: { value: 92 },
          positioning: "Risk-free way to see 3x ROI within first month"
        },
        {
          offer: "ROI Calculator + Strategy Session",
          valueGauge: { value: 85 },
          positioning: "Quantify your potential gains before committing"
        },
        {
          offer: "Migration Support + First Campaign Free",
          valueGauge: { value: 78 },
          positioning: "Zero-friction switch from your current platform"
        }
      ],
      nucleus: {
        coreValue: "Turn marketing data into predictable revenue",
        emotionalHook: "Stop guessing, start knowing what works",
        mechanism: "AI analyzes 100+ data points to recommend optimal campaigns"
      }
    },
    phase4: {
      discTable: [
        {
          red: { copy: "Get results NOW", channel: "LinkedIn", purpose: "Drive immediate action" },
          yellow: { copy: "Join the AI revolution", channel: "Twitter", purpose: "Build social proof" },
          green: { copy: "We'll support you", channel: "Email", purpose: "Build trust" },
          blue: { copy: "Technical excellence", channel: "Documentation", purpose: "Provide detail" }
        }
      ],
      messages: {
        D: {
          headline: "Drive Results with Data-Backed Decisions",
          hook: "Cut through the noise. Our platform shows you exactly which campaigns deliver ROI.",
          cta: "See Your Revenue Potential"
        },
        I: {
          headline: "Join 500+ Marketing Leaders Winning with AI",
          hook: "Be part of the marketing revolution. Your peers are already seeing 3x better engagement.",
          cta: "Join the Movement"
        },
        S: {
          headline: "We'll Guide You Every Step of the Way",
          hook: "No steep learning curve. Our team ensures smooth onboarding and ongoing support.",
          cta: "Start with Support"
        },
        C: {
          headline: "The Most Advanced Marketing Intelligence Platform",
          hook: "100+ integrations. Military-grade security. SOC 2 compliant. Built for enterprise.",
          cta: "Explore Features"
        }
      }
    },
    phase5: {
      triggers: [
        {
          emotion: "Frustration",
          situation: "Spending hours on reports that don't drive decisions",
          response: "Automated dashboards that highlight what matters"
        },
        {
          emotion: "Fear",
          situation: "Missing quota due to poor campaign performance",
          response: "AI predictions that optimize before launch"
        },
        {
          emotion: "Aspiration",
          situation: "Wanting to be seen as a strategic leader",
          response: "Executive-ready insights that prove marketing's impact"
        }
      ]
    },
    phase6: {
      recommendation: {
        primary: "LinkedIn Ads",
        secondary: "Google Search",
        tertiary: "Content Marketing"
      },
      channels: [
        {
          name: "LinkedIn Ads",
          score: 92,
          cost: "$3000/month",
          reasoning: "Perfect match for B2B SaaS targeting. High intent audience of marketing decision-makers.",
          expectedROI: "3.5x",
          timeToResults: "2-4 weeks"
        },
        {
          name: "Google Search",
          score: 85,
          cost: "$2500/month",
          reasoning: "Captures high-intent searches. Ideal for bottom-funnel conversions.",
          expectedROI: "3.2x",
          timeToResults: "4-6 weeks"
        },
        {
          name: "Content Marketing",
          score: 78,
          cost: "$1500/month",
          reasoning: "Builds authority and SEO. Longer-term play with compounding returns.",
          expectedROI: "2.8x",
          timeToResults: "8-12 weeks"
        }
      ]
    },
    phase7: {
      variations: [
        {
          id: "var-1",
          effect: "Test DISC-I headline",
          objective: "Increase sign-up rate by 25%",
          channel: "LinkedIn Ads",
          headline: "Join 500+ Marketing Leaders Winning with AI",
          subheadline: "Your peers are seeing 3x better engagement. Be part of the revolution.",
          cta: "Join the Movement",
          kpi: "Sign-up rate",
          estimatedCost: "$500",
          ttv: "2 weeks",
          state: "Discover",
          owner: null,
          discProfile: "Influential (Yellow)",
          emotionalTrigger: "Social proof & FOMO",
          buyerField: "Marketing Director at B2B SaaS",
          offer: "Free 30-Day Trial + Onboarding",
          visualSuggestion: "Group photo of diverse marketing professionals collaborating. Bright, energetic colors.",
          reasoning: "Influential personalities respond to social proof and community. This headline taps into FOMO and the desire to be part of a winning group."
        },
        {
          id: "var-2",
          effect: "Test free trial vs demo",
          objective: "Improve conversion rate by 40%",
          channel: "Landing Page",
          headline: "Try MarketFlow AI Free for 30 Days",
          subheadline: "No credit card required. Full platform access. Cancel anytime.",
          cta: "Start Free Trial",
          kpi: "Landing page conversion",
          estimatedCost: "$200",
          ttv: "1 week",
          state: "Discover",
          owner: null,
          discProfile: "Stable (Green)",
          emotionalTrigger: "Risk reduction",
          buyerField: "Marketing Manager",
          offer: "Free 30-Day Trial (no CC)",
          visualSuggestion: "Clean dashboard mockup showing clear data visualizations. Calm, trustworthy colors.",
          reasoning: "Stable personalities need reassurance. Removing friction (no CC) and emphasizing safety (cancel anytime) addresses their concerns."
        },
        {
          id: "var-3",
          effect: "Test ROI calculator lead magnet",
          objective: "Double MQL to SQL rate",
          channel: "Email Nurture",
          headline: "Calculate Your Marketing ROI Potential",
          subheadline: "See exactly how much revenue you could generate with MarketFlow AI.",
          cta: "Get My ROI Report",
          kpi: "MQL to SQL conversion",
          estimatedCost: "$300",
          ttv: "3 weeks",
          state: "Discover",
          owner: null,
          discProfile: "Analytical (Blue)",
          emotionalTrigger: "Data & proof",
          buyerField: "VP Marketing",
          offer: "ROI Calculator + Strategy Session",
          visualSuggestion: "Professional calculator interface with charts and numbers. Blues and grays for credibility.",
          reasoning: "Analytical buyers need data before committing. An ROI calculator provides concrete numbers and justification for their decision."
        },
        {
          id: "var-4",
          effect: "Test urgent messaging",
          objective: "Increase immediate conversions",
          channel: "LinkedIn Ads",
          headline: "Stop Wasting Budget on Guesswork",
          subheadline: "Every day without data-driven marketing costs you thousands in lost revenue.",
          cta: "See Your Revenue Potential Now",
          kpi: "Click-through rate",
          estimatedCost: "$600",
          ttv: "2 weeks",
          state: "Discover",
          owner: null,
          discProfile: "Dominant (Red)",
          emotionalTrigger: "Pain & urgency",
          buyerField: "CMO",
          offer: "Free Audit + Quick Wins Report",
          visualSuggestion: "Bold contrast. Red/orange accents. Graph showing declining vs. ascending line.",
          reasoning: "Dominant personalities are motivated by pain and urgency. This headline creates immediate pressure to act."
        }
      ]
    }
  }
};
