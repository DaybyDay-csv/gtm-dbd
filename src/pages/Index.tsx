import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAnalysisOrchestrator } from "@/hooks/useAnalysisOrchestrator";
import { useProjectLoader } from "@/hooks/useProjectLoader";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/factory/AppHeader";
import { Wrench, Loader2 } from "lucide-react";
import { Hero } from "@/components/factory/Hero";
import { EvidenceDrawer } from "@/components/factory/EvidenceDrawer";
import { PhaseRibbon } from "@/components/factory/PhaseRibbon";
import { PhaseExplainer } from "@/components/factory/PhaseExplainer";
import { ProductMetrics } from "@/components/factory/ProductMetrics";
import { ValidationMap } from "@/components/factory/ValidationMap";
import { ProductUnderstanding } from "@/components/factory/ProductUnderstanding";
import { PositioningMap } from "@/components/factory/PositioningMap";
import { ProductNucleus } from "@/components/factory/ProductNucleus";
import { BuyerPersona } from "@/components/factory/BuyerPersona";
import { OfferFactory } from "@/components/factory/OfferFactory";
import { DISCTranslator } from "@/components/factory/DISCTranslator";
import { DISCTranslatorPreview } from "@/components/factory/DISCTranslatorPreview";
import { ClientReadiness } from "@/components/factory/ClientReadiness";
import { SignupGate } from "@/components/factory/SignupGate";
import { BudgetInput } from "@/components/factory/BudgetInput";
import { ChannelStrategy } from "@/components/factory/ChannelStrategy";
import { FloatingProgress } from "@/components/factory/FloatingProgress";
import { Seo } from "@/components/Seo";

const Index = () => {
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get("project");
  const isDevMode = searchParams.get("dev") === "TRUE";
  const isDemoMode = searchParams.get("demo") === "true";

  const { state, runAnalysis, continueToPhaseSix, loadMockData } = useAnalysisOrchestrator();
  const { projectData, loading: loadingProject } = useProjectLoader(projectIdFromUrl);
  const { user } = useAuth();

  const contentRef = useRef<HTMLDivElement>(null);
  const phaseRibbonRef = useRef<HTMLDivElement>(null);
  const prevPhaseRef = useRef(state.currentPhase);
  const prevRunningRef = useRef(state.isRunning);
  const [showSignupGate, setShowSignupGate] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [isPhaseRibbonVisible, setIsPhaseRibbonVisible] = useState(true);

  const displayState = projectData || state;

  // Intersection observer for phase ribbon visibility
  useEffect(() => {
    if (!phaseRibbonRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPhaseRibbonVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(phaseRibbonRef.current);
    return () => observer.disconnect();
  }, [displayState.currentPhase]);

  // Auto-scroll when analysis starts
  useEffect(() => {
    if (state.isRunning && !prevRunningRef.current && state.currentPhase > 0) {
      // Scroll to processing section when analysis starts
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
    prevRunningRef.current = state.isRunning;
  }, [state.isRunning, state.currentPhase]);

  // Auto-scroll when a phase completes
  useEffect(() => {
    const phaseCompleted = state.currentPhase > prevPhaseRef.current;
    
    if (phaseCompleted && !state.isRunning) {
      // Analysis finished - scroll to last completed section
      const lastPhaseSection = document.querySelector(`[data-phase="phase${state.currentPhase}"]`);
      if (lastPhaseSection) {
        setTimeout(() => {
          lastPhaseSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 500);
      }
    } else if (phaseCompleted && state.isRunning) {
      // A phase just completed, scroll to the newly completed section
      const completedPhaseSection = document.querySelector(`[data-phase="phase${prevPhaseRef.current}"]`);
      if (completedPhaseSection) {
        setTimeout(() => {
          completedPhaseSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 500);
      }
    }
    
    prevPhaseRef.current = state.currentPhase;
  }, [state.currentPhase, state.isRunning]);

  // Load demo data if demo mode
  useEffect(() => {
    if (isDemoMode && displayState.currentPhase === 0) {
      loadMockData();
    }
  }, [isDemoMode, displayState.currentPhase, loadMockData]);

  // Move signup gate to after Phase 5 (show more value first)
  useEffect(() => {
    if (!user && state.currentPhase >= 5) {
      setShowSignupGate(true);
      if (state.projectId) {
        setProjectId(state.projectId);
      }
    }
  }, [user, state.currentPhase, state.projectId]);

  const handleScrollToPhases = useCallback(() => {
    phaseRibbonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSignupComplete = async () => {
    setShowSignupGate(false);
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (projectId && currentUser) {
      await supabase.from("projects").update({ user_id: currentUser.id }).eq("id", projectId);
    }
  };

  const handleRunAnalysis = (
    projectName: string,
    url: string,
    productDescription: string,
    competitors?: string,
    docs?: string,
    context?: string,
    vision?: string,
    mission?: string,
    values?: string,
    industry?: string,
    tone?: string,
    brandVoice?: string
  ) => {
    if (industry) {
      setSelectedIndustry(industry);
    }
    runAnalysis(projectName, url, productDescription, competitors, docs, context, vision, mission, values, tone, brandVoice);
  };

  const handleLoadDemo = () => {
    loadMockData();
  };

  // Show gate after Phase 4 (DISC) instead of Phase 3
  const shouldShowGate = displayState.currentPhase >= 5 && !user && !projectIdFromUrl;
  const avatarReliability = displayState.phases.phase2?.profile?.reliability || 0;
  const topOffers =
    displayState.phases.phase3?.offers?.slice(0, 3).map((o: any) => ({
      offer: o.offer,
      value: o.valueGauge?.value || 0,
    })) || [];

  const handleBudgetSubmit = (budgetLevel: string, budgetAmount: number) => {
    continueToPhaseSix(budgetLevel, budgetAmount);
  };

  const { t } = useLanguage();

  // Show loading spinner while validating project access
  if (loadingProject && projectIdFromUrl) {
    return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Seo
        title="GTM Factory — AI Go-to-Market Intelligence for B2B & B2C"
        description="Turn any product into a complete go-to-market plan: market analysis, buyer personas, value equation, DISC messaging and creative validation."
        path="/"
      />
      <AppHeader
          analysisState={displayState}
          projectName={displayState.phases.phase1?.productNucleus?.name}
          showDownloadButton={false}
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground text-lg">{t('project.loading') || 'Cargando proyecto...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AppHeader
        analysisState={displayState}
        projectName={displayState.phases.phase1?.productNucleus?.name}
        showDownloadButton={state.isRunning || displayState.currentPhase > 0}
      />

      {isDevMode && displayState.currentPhase === 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-3">
          <div className="w-full px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wrench className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="font-semibold text-sm text-amber-700 dark:text-amber-300">Modo Desarrollo</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Carga datos mock para ver el resultado completo sin gastar créditos
                  </p>
                </div>
              </div>
              <button
                onClick={loadMockData}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cargar Datos Mock
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="no-pdf">
        <Hero onRunAnalysis={handleRunAnalysis} isRunning={state.isRunning} onLoadDemo={handleLoadDemo} />
        {!displayState.isRunning && displayState.currentPhase === 0 && <EvidenceDrawer industry={selectedIndustry} />}
      </div>

      {displayState.currentPhase > 0 && (
        <div ref={contentRef} id="analysis-content" className="w-full">
          <div ref={phaseRibbonRef}>
            <PhaseRibbon currentPhase={displayState.currentPhase} isRunning={displayState.isRunning} />
          </div>
          <PhaseExplainer currentPhase={displayState.currentPhase} isRunning={displayState.isRunning} />
          <div className="w-full px-8">
            <div className="max-w-7xl mx-auto">
              {displayState.clientReadiness && <ClientReadiness data={displayState.clientReadiness} />}
            </div>
          </div>

          <div className="w-full px-8">
            <div className="max-w-7xl mx-auto">
              <ProductMetrics
                avatarReliability={avatarReliability}
                hypothesesValidated={0}
                topMessages={[]}
                topOffers={topOffers}
                nextAction={
                  displayState.phases.phase7?.variations?.[0]
                    ? `Test: ${displayState.phases.phase7.variations[0].effect} on ${displayState.phases.phase7.variations[0].channel}`
                    : undefined
                }
              />
            </div>
          </div>

          <section className="w-full max-w-full px-4 sm:px-6 md:px-8 py-8 md:py-12 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
              <div data-phase="phase1" className="pdf-section">
                <div
                  className={`w-full ${displayState.isRunning && !displayState.phases.phase1?.productUnderstanding ? "charging" : ""} ${displayState.phases.phase1?.productUnderstanding ? "magic-reveal" : ""}`}
                >
                  <ProductUnderstanding data={displayState.phases.phase1?.productUnderstanding} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  <div
                    className={`w-full ${displayState.isRunning && !displayState.phases.phase1 ? "charging" : ""} ${displayState.phases.phase1 ? "magic-reveal" : ""}`}
                  >
                    <PositioningMap data={displayState.phases.phase1} />
                  </div>
                  <div
                    className={`w-full ${displayState.isRunning && !displayState.phases.phase1?.productNucleus ? "charging" : ""} ${displayState.phases.phase1?.productNucleus ? "magic-reveal" : ""}`}
                  >
                    <ProductNucleus data={displayState.phases.phase1?.productNucleus} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                  data-phase="phase2"
                  className={`w-full pdf-section ${displayState.isRunning && !displayState.phases.phase2 ? "charging" : ""} ${displayState.phases.phase2 ? "magic-reveal" : ""}`}
                >
                  <BuyerPersona data={displayState.phases.phase2} />
                </div>

                <div
                  data-phase="phase3"
                  className={`w-full pdf-section ${displayState.isRunning && !displayState.phases.phase3 ? "charging" : ""} ${displayState.phases.phase3 ? "magic-reveal" : ""}`}
                >
                  <OfferFactory data={displayState.phases.phase3} />
                </div>
              </div>

              {/* Phase 4 - DISC Translator - Now shown before signup gate */}
              <div
                data-phase="phase4"
                className={`w-full mt-6 pdf-section ${displayState.isRunning && !displayState.phases.phase4 ? "charging" : ""} ${displayState.phases.phase4 ? "magic-reveal" : ""}`}
              >
                <DISCTranslator data={displayState.phases.phase4} />
              </div>

              {/* Signup Gate - Now appears after Phase 4 */}
              {shouldShowGate && (
                <div className="w-full mt-6">
                  <div className="flex items-center justify-center py-8">
                    <SignupGate onComplete={handleSignupComplete} />
                  </div>
                </div>
              )}
            </div>
          </section>

          {shouldShowGate && (
            <div id="locked-content" className="relative min-h-[100vh] w-full">
              <div
                className="sticky top-0 h-screen pointer-events-none z-10"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(var(--background), 0) 0%, rgba(var(--background), 0.95) 50%, rgba(var(--background), 1) 100%)",
                }}
              >
                <div className="absolute inset-0 backdrop-blur-xl" />
              </div>
              <div className="relative -mt-[100vh] z-0 w-full">
                <div className="w-full px-8 py-12">
                  <div className="max-w-7xl mx-auto space-y-12">
                    <div className="opacity-40">
                      {state.awaitingBudgetInput && <BudgetInput onSubmit={handleBudgetSubmit} />}
                      {displayState.phases.phase6 && !state.awaitingBudgetInput && (
                        <ChannelStrategy
                          data={displayState.phases.phase6}
                          isRunning={displayState.isRunning && displayState.currentPhase === 6}
                        />
                      )}
                      <ValidationMap
                        data={displayState.phases.phase7}
                        isRunning={displayState.isRunning && displayState.currentPhase === 7}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!shouldShowGate && (
            <div className="w-full">
              {state.awaitingBudgetInput && (
                <div className="w-full px-8">
                  <div className="max-w-7xl mx-auto">
                    <BudgetInput onSubmit={handleBudgetSubmit} />
                  </div>
                </div>
              )}
              {displayState.phases.phase6 && !state.awaitingBudgetInput && (
                <div data-phase="phase6" className="pdf-section w-full px-8">
                  <div className="max-w-7xl mx-auto">
                    <ChannelStrategy
                      data={displayState.phases.phase6}
                      isRunning={displayState.isRunning && displayState.currentPhase === 6}
                    />
                  </div>
                </div>
              )}
              <div data-phase="phase7" className="pdf-section w-full px-8">
                <div className="max-w-7xl mx-auto">
                  <ValidationMap
                    data={displayState.phases.phase7}
                    isRunning={displayState.isRunning && displayState.currentPhase === 7}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Progress Indicator */}
      <FloatingProgress
        currentPhase={displayState.currentPhase}
        isRunning={displayState.isRunning}
        isVisible={!isPhaseRibbonVisible && displayState.currentPhase > 0}
        onScrollToPhases={handleScrollToPhases}
      />

      <footer className="border-t dotted-border-t py-6 mt-12 no-pdf">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 AI GTM Factory. Built on evidence, not opinions.
        </p>
      </footer>
    </div>
  );
};

export default Index;