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
import { useAnalysisOrchestrator } from "@/hooks/useAnalysisOrchestrator";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mockAnalysisState } from "@/utils/mockData";

const Index = () => {
  const { state, runAnalysis } = useAnalysisOrchestrator();
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const prevRunningState = useRef(state.isRunning);
  const [showSignupGate, setShowSignupGate] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  // Developer mode: Check for ?dev=true in URL
  const isDevMode = new URLSearchParams(window.location.search).get('dev') === 'true';
  const displayState = isDevMode ? mockAnalysisState : state;

  // Auto-scroll when analysis starts
  useEffect(() => {
    if (state.isRunning && !prevRunningState.current && state.currentPhase > 0) {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevRunningState.current = state.isRunning;
  }, [state.isRunning, state.currentPhase]);

  // Show signup gate after phase 3 if user is not authenticated
  useEffect(() => {
    if (!user && state.currentPhase >= 4 && !state.isRunning) {
      setShowSignupGate(true);
      // Store project ID for later association
      if (state.projectId) {
        setProjectId(state.projectId);
      }
    }
  }, [user, state.currentPhase, state.isRunning, state.projectId]);

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

  // Extract metrics from analysis state
  const avatarReliability = displayState.phases.phase2?.profile?.reliability || 0;
  const topOffers = displayState.phases.phase3?.offers?.slice(0, 3).map((o: any) => ({
    offer: o.offer,
    value: o.valueGauge?.value || 0,
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Hero onRunAnalysis={runAnalysis} isRunning={state.isRunning} />
      
      {!displayState.isRunning && displayState.currentPhase === 0 && <EvidenceDrawer />}
      
      {displayState.currentPhase > 0 && (
        <div ref={contentRef}>
          <PhaseRibbon currentPhase={displayState.currentPhase} isRunning={displayState.isRunning} />
          <PhaseExplainer currentPhase={displayState.currentPhase} isRunning={displayState.isRunning} />
          {displayState.clientReadiness && <ClientReadiness data={displayState.clientReadiness} />}
          
          <ProductMetrics
            avatarReliability={avatarReliability}
            hypothesesValidated={0}
            topMessages={[]}
            topOffers={topOffers}
            nextAction={
              displayState.phases.phase6?.experiments?.[0]
                ? `Test: ${displayState.phases.phase6.experiments[0].hypothesis} on ${displayState.phases.phase6.experiments[0].channel}`
                : undefined
            }
          />

          <MainGrid analysisState={displayState} showBlurOnPhase4Plus={isDevMode ? false : showSignupGate} />
          
          <div className={isDevMode ? "" : (showSignupGate ? "relative" : "")}>
            {!isDevMode && showSignupGate && (
              <div className="absolute inset-0 backdrop-blur-md z-10 rounded-lg" />
            )}
            <ValidationMap data={displayState.phases.phase6} isRunning={displayState.isRunning} />
          </div>
        </div>
      )}

      {!isDevMode && showSignupGate && <SignupGate onComplete={handleSignupComplete} />}
      
      <footer className="border-t dotted-border-t py-6 mt-12">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 AI GTM Factory. Built on evidence, not opinions.
        </p>
      </footer>
    </div>
  );
};

export default Index;
