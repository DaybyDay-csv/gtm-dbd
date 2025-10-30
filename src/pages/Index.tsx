import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAnalysisOrchestrator } from "@/hooks/useAnalysisOrchestrator";
import { useProjectLoader } from "@/hooks/useProjectLoader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/factory/AppHeader";
import { Wrench } from "lucide-react";
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

const Index = () => {
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get("project");
  const isDevMode = searchParams.get("dev") === "TRUE";
  
  const { state, runAnalysis, continueToPhaseSix, loadMockData } = useAnalysisOrchestrator();
  const { projectData, loading: loadingProject } = useProjectLoader(projectIdFromUrl);
  const { user } = useAuth();
  
  const contentRef = useRef<HTMLDivElement>(null);
  const prevRunningState = useRef(state.isRunning);
  const [showSignupGate, setShowSignupGate] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const displayState = projectData || state;

  useEffect(() => {
    if (state.isRunning && !prevRunningState.current && state.currentPhase > 0) {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevRunningState.current = state.isRunning;
  }, [state.isRunning, state.currentPhase]);

  useEffect(() => {
    if (!user && state.currentPhase >= 4) {
      setShowSignupGate(true);
      if (state.projectId) {
        setProjectId(state.projectId);
      }
    }
  }, [user, state.currentPhase, state.projectId]);

  const handleSignupComplete = async () => {
    setShowSignupGate(false);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (projectId && currentUser) {
      await supabase.from("projects").update({ user_id: currentUser.id }).eq("id", projectId);
    }
  };

  const shouldShowGate = displayState.currentPhase >= 3 && !user && !projectIdFromUrl;
  const avatarReliability = displayState.phases.phase2?.profile?.reliability || 0;
  const topOffers = displayState.phases.phase3?.offers?.slice(0, 3).map((o: any) => ({
    offer: o.offer,
    value: o.valueGauge?.value || 0,
  })) || [];

  const handleBudgetSubmit = (budgetLevel: string, budgetAmount: number) => {
    continueToPhaseSix(budgetLevel, budgetAmount);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        analysisState={displayState}
        projectName={displayState.phases.phase1?.productNucleus?.name}
      />
      
      {isDevMode && displayState.currentPhase === 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wrench className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="font-semibold text-sm text-amber-700 dark:text-amber-300">Modo Desarrollo</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Carga datos mock para ver el resultado completo sin gastar créditos</p>
                </div>
              </div>
              <button onClick={loadMockData} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors">
                Cargar Datos Mock
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Hero onRunAnalysis={runAnalysis} isRunning={state.isRunning} />
      {!displayState.isRunning && displayState.currentPhase === 0 && <EvidenceDrawer />}
      
      {displayState.currentPhase > 0 && (
        <div ref={contentRef} id="analysis-content">
          <PhaseRibbon currentPhase={displayState.currentPhase} isRunning={displayState.isRunning} />
          <PhaseExplainer currentPhase={displayState.currentPhase} isRunning={displayState.isRunning} />
          {displayState.clientReadiness && <ClientReadiness data={displayState.clientReadiness} />}
          
          <ProductMetrics
            avatarReliability={avatarReliability}
            hypothesesValidated={0}
            topMessages={[]}
            topOffers={topOffers}
            nextAction={displayState.phases.phase7?.variations?.[0] ? `Test: ${displayState.phases.phase7.variations[0].effect} on ${displayState.phases.phase7.variations[0].channel}` : undefined}
          />

          <section className="container mx-auto px-4 py-12 space-y-8">
            <div className={`w-full ${displayState.isRunning && !displayState.phases.phase1?.productUnderstanding ? 'charging' : ''} ${displayState.phases.phase1?.productUnderstanding ? 'magic-reveal' : ''}`}>
              <ProductUnderstanding data={displayState.phases.phase1?.productUnderstanding} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-1 ${displayState.isRunning && !displayState.phases.phase1 ? 'charging' : ''} ${displayState.phases.phase1 ? 'magic-reveal' : ''}`}>
                <PositioningMap data={displayState.phases.phase1} />
              </div>
              <div className={`lg:col-span-1 flex items-center justify-center ${displayState.isRunning && !displayState.phases.phase1?.productNucleus ? 'charging' : ''} ${displayState.phases.phase1?.productNucleus ? 'magic-reveal' : ''}`}>
                <ProductNucleus data={displayState.phases.phase1?.productNucleus} />
              </div>
              <div className={`lg:col-span-1 ${displayState.isRunning && !displayState.phases.phase2 ? 'charging' : ''} ${displayState.phases.phase2 ? 'magic-reveal' : ''}`}>
                <BuyerPersona data={displayState.phases.phase2} />
              </div>

              <div className={`lg:col-span-1 ${displayState.isRunning && !displayState.phases.phase3 ? 'charging' : ''} ${displayState.phases.phase3 ? 'magic-reveal' : ''}`}>
                <OfferFactory data={displayState.phases.phase3} />
              </div>
              
              {shouldShowGate ? (
                <div className="lg:col-span-2 flex items-center justify-center min-h-[400px]">
                  <SignupGate onComplete={handleSignupComplete} />
                </div>
              ) : (
                <div className={`lg:col-span-2 ${displayState.isRunning && !displayState.phases.phase4 ? 'charging' : ''} ${displayState.phases.phase4 ? 'magic-reveal' : ''}`}>
                  <DISCTranslator data={displayState.phases.phase4} />
                </div>
              )}
            </div>
          </section>

          {shouldShowGate && displayState.phases.phase4 && (
            <div className="container mx-auto px-4 pb-0 pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                  <DISCTranslatorPreview />
                </div>
              </div>
            </div>
          )}


          {shouldShowGate && (
            <div id="locked-content" className="relative min-h-[200vh]">
              <div className="sticky top-0 h-screen pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, rgba(var(--background), 0) 0%, rgba(var(--background), 0.95) 50%, rgba(var(--background), 1) 100%)' }}>
                <div className="absolute inset-0 backdrop-blur-xl" />
              </div>
              <div className="relative -mt-[100vh] z-0">
                <div className="container mx-auto px-4 py-12 space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-40">
                    <div className={`lg:col-span-3 ${displayState.isRunning && !displayState.phases.phase4 ? 'charging' : ''} ${displayState.phases.phase4 ? 'magic-reveal' : ''}`}>
                      <DISCTranslator data={displayState.phases.phase4} />
                    </div>
                  </div>
                  <div className="opacity-40">
                    {state.awaitingBudgetInput && <BudgetInput onSubmit={handleBudgetSubmit} />}
                    {displayState.phases.phase6 && !state.awaitingBudgetInput && (
                      <ChannelStrategy data={displayState.phases.phase6} isRunning={displayState.isRunning && displayState.currentPhase === 6} />
                    )}
                    <ValidationMap data={displayState.phases.phase7} isRunning={displayState.isRunning && displayState.currentPhase === 7} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!shouldShowGate && (
            <>
              {state.awaitingBudgetInput && <BudgetInput onSubmit={handleBudgetSubmit} />}
              {displayState.phases.phase6 && !state.awaitingBudgetInput && (
                <ChannelStrategy data={displayState.phases.phase6} isRunning={displayState.isRunning && displayState.currentPhase === 6} />
              )}
              <ValidationMap data={displayState.phases.phase7} isRunning={displayState.isRunning && displayState.currentPhase === 7} />
            </>
          )}
        </div>
      )}
      
      <footer className="border-t dotted-border-t py-6 mt-12">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 AI GTM Factory. Built on evidence, not opinions.
        </p>
      </footer>
    </div>
  );
};

export default Index;
