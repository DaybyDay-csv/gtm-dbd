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
import { MainGrid } from "@/components/factory/MainGrid";
import { ValidationMap } from "@/components/factory/ValidationMap";
import { ClientReadiness } from "@/components/factory/ClientReadiness";
import { SignupGate } from "@/components/factory/SignupGate";
import { BudgetInput } from "@/components/factory/BudgetInput";
import { ChannelStrategy } from "@/components/factory/ChannelStrategy";

const Index = () => {
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get("project");
  
  const { state, runAnalysis, continueToPhaseSix } = useAnalysisOrchestrator();
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
      <Hero onRunAnalysis={runAnalysis} isRunning={state.isRunning} />
      
      {!displayState.isRunning && displayState.currentPhase === 0 && <EvidenceDrawer />}
      
      {displayState.currentPhase > 0 && (
        <div ref={contentRef}>
          {/* UNLOCKED CONTENT - Phases 1-3 without blur */}
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

            <MainGrid analysisState={displayState} showBlurOnPhase4Plus={false} />
          </div>

          {/* SIGNUP GATE - Sticky between unlocked and locked content */}
          {shouldShowGate && <SignupGate onComplete={handleSignupComplete} />}

          {/* LOCKED CONTENT - Phases 4-7 with progressive blur */}
          {shouldShowGate ? (
            <div id="locked-content" className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/80 backdrop-blur-[8px] z-40 pointer-events-none" />
              
              <div className="relative z-30 opacity-60">
                {state.awaitingBudgetInput && (
                  <BudgetInput onSubmit={handleBudgetSubmit} />
                )}

                {displayState.phases.phase6 && !state.awaitingBudgetInput && (
                  <ChannelStrategy data={displayState.phases.phase6} isRunning={displayState.isRunning && displayState.currentPhase === 6} />
                )}
                
                <ValidationMap data={displayState.phases.phase7} isRunning={displayState.isRunning && displayState.currentPhase === 7} />
              </div>
            </div>
          ) : (
            <>
              {/* UNLOCKED - Show phases 4-7 without blur when user is authenticated */}
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
