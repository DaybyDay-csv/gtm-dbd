// Mock data for development purposes
export const mockAnalysisState = {
  projectId: "mock-project-id",
  currentPhase: 6,
  isRunning: false,
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
        triggers: [
          "Low email engagement rates",
          "Difficulty tracking campaign ROI",
          "Manual segmentation processes"
        ],
        reliability: 87,
        goals: [
          "Increase campaign conversion by 40%",
          "Reduce time spent on reporting by 50%",
          "Improve lead quality scores"
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
      experiments: [
        {
          hypothesis: "DISC-I headline increases sign-ups by 25%",
          channel: "LinkedIn Ads",
          metric: "Sign-up rate",
          duration: "2 weeks"
        },
        {
          hypothesis: "Free trial offer converts 40% better than demo",
          channel: "Landing page",
          metric: "Conversion rate",
          duration: "2 weeks"
        },
        {
          hypothesis: "ROI calculator as lead magnet doubles MQL quality",
          channel: "Email nurture",
          metric: "MQL to SQL rate",
          duration: "3 weeks"
        }
      ]
    }
  }
};
