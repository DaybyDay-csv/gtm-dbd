import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAnalysisOrchestrator } from "@/hooks/useAnalysisOrchestrator";
import { useProjectLoader } from "@/hooks/useProjectLoader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/factory/AppHeader";
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
  
  // Use loaded project data if available, otherwise use current analysis state
  const displayState = projectData || state;

  // Auto-scroll when analysis starts
  useEffect(() => {
    if (state.isRunning && !prevRunningState.current && state.currentPhase > 0) {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevRunningState.current = state.isRunning;
  }, [state.isRunning, state.currentPhase]);

  // Show signup gate after phase 3 if user is not authenticated
  useEffect(() => {
    if (!user && state.currentPhase >= 4) {
      setShowSignupGate(true);
      // Store project ID for later association
      if (state.projectId) {
        setProjectId(state.projectId);
      }
    }
  }, [user, state.currentPhase, state.projectId]);

  // Associate project with user after signup
  const handleSignupComplete = async () => {
    setShowSignupGate(false);
    
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (projectId && currentUser) {
      await supabase
        .from("projects")
        .update({ user_id: currentUser.id })
        .eq("id", projectId);
    }
  };

  // Determine if signup gate should be shown
  const shouldShowGate = displayState.currentPhase >= 3 && !user && !projectIdFromUrl;

  // Extract metrics from analysis state
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
      <AppHeader />
      
      {/* Dev Mode Banner */}
      {isDevMode && displayState.currentPhase === 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛠️</span>
                <div>
                  <p className="font-semibold text-sm text-amber-700 dark:text-amber-300">Modo Desarrollo</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Carga datos mock para ver el resultado completo sin gastar créditos</p>
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
      
      <Hero onRunAnalysis={runAnalysis} isRunning={state.isRunning} />
      
      {!displayState.isRunning && displayState.currentPhase === 0 && <EvidenceDrawer />}
      
      {displayState.currentPhase > 0 && (
        <div ref={contentRef}>
          {/* UNLOCKED CONTENT - Phases 1-3 */}
          <div id="unlocked-content">
            <PhaseRibbon currentPhase={displayState.currentPhase} isRunning={displayState.isRunning} />
            <PhaseExplainer currentPhase={displayState.currentPhase} isRunning={displayState.isRunning} />
            {displayState.clientReadiness && <ClientReadiness data={displayState.clientReadiness} />}
            
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

            {/* Product Understanding + Main Grid with SignupGate */}
            <section className="container mx-auto px-4 py-12 space-y-8">
              {/* Product Understanding - Full Width */}
              <div className={`w-full ${displayState.isRunning && !displayState.phases.phase1?.productUnderstanding ? 'charging' : ''} ${displayState.phases.phase1?.productUnderstanding ? 'magic-reveal' : ''}`}>
                <ProductUnderstanding data={displayState.phases.phase1?.productUnderstanding} />
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top row */}
                <div className={`lg:col-span-1 ${displayState.isRunning && !displayState.phases.phase1 ? 'charging' : ''} ${displayState.phases.phase1 ? 'magic-reveal' : ''}`}>
                  <PositioningMap data={displayState.phases.phase1} />
                </div>
                <div className={`lg:col-span-1 flex items-center justify-center ${displayState.isRunning && !displayState.phases.phase1?.productNucleus ? 'charging' : ''} ${displayState.phases.phase1?.productNucleus ? 'magic-reveal' : ''}`}>
                  <ProductNucleus data={displayState.phases.phase1?.productNucleus} />
                </div>
                <div className={`lg:col-span-1 ${displayState.isRunning && !displayState.phases.phase2 ? 'charging' : ''} ${displayState.phases.phase2 ? 'magic-reveal' : ''}`}>
                  <BuyerPersona data={displayState.phases.phase2} />
                </div>

                {/* Bottom row - OfferFactory + SignupGate / DISC */}
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

            {/* Preview de DISC sin blur cuando hay SignupGate */}
            {shouldShowGate && displayState.phases.phase4 && (
              <div className="container mx-auto px-4 pb-0 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-3">
                    <DISCTranslatorPreview />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LOCKED CONTENT - Phases 4-7 with progressive blur */}
          {shouldShowGate && (
            <div id="locked-content" className="relative">
              <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className={`lg:col-span-3 ${displayState.isRunning && !displayState.phases.phase4 ? 'charging' : ''} ${displayState.phases.phase4 ? 'magic-reveal' : ''}`}>
                    <DISCTranslator data={displayState.phases.phase4} />
                  </div>
                </div>
              </div>

              {state.awaitingBudgetInput && (
                <BudgetInput onSubmit={handleBudgetSubmit} />
              )}

              {displayState.phases.phase6 && !state.awaitingBudgetInput && (
                <ChannelStrategy data={displayState.phases.phase6} isRunning={displayState.isRunning && displayState.currentPhase === 6} />
              )}
              
              <ValidationMap data={displayState.phases.phase7} isRunning={displayState.isRunning && displayState.currentPhase === 7} />
            </div>
          )}

          {/* UNLOCKED - Show phases 4-7 without blur when user is authenticated */}
          {!shouldShowGate && (
            <>
              {state.awaitingBudgetInput && (
                <BudgetInput onSubmit={handleBudgetSubmit} />
              )}

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
