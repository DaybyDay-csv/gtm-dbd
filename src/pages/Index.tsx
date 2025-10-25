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

const Index = () => {
  const { state, runAnalysis } = useAnalysisOrchestrator();
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const prevRunningState = useRef(state.isRunning);
  const [showSignupGate, setShowSignupGate] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Auto-scroll when analysis starts
  useEffect(() => {
    if (state.isRunning && !prevRunningState.current && state.currentPhase > 0) {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevRunningState.current = state.isRunning;
  }, [state.isRunning, state.currentPhase]);

  // Show signup gate after phase 2 if user is not authenticated
  useEffect(() => {
    if (!user && state.currentPhase >= 2 && !state.isRunning) {
      setShowSignupGate(true);
    }
  }, [user, state.currentPhase, state.isRunning]);

  // Associate project with user after signup
  const handleSignupComplete = async () => {
    setShowSignupGate(false);
    
    if (projectId && user) {
      await supabase
        .from("projects")
        .update({ user_id: user.id })
        .eq("id", projectId);
    }
  };

  // Extract metrics from analysis state
  const avatarReliability = state.phases.phase2?.profile?.reliability || 0;
  const topOffers = state.phases.phase3?.offers?.slice(0, 3).map((o: any) => ({
    offer: o.offer,
    value: o.valueGauge?.value || 0,
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Hero onRunAnalysis={runAnalysis} isRunning={state.isRunning} />
      
      {!state.isRunning && state.currentPhase === 0 && <EvidenceDrawer />}
      
      {state.currentPhase > 0 && (
        <div ref={contentRef}>
          <PhaseRibbon currentPhase={state.currentPhase} isRunning={state.isRunning} />
          <PhaseExplainer currentPhase={state.currentPhase} isRunning={state.isRunning} />
          {state.clientReadiness && <ClientReadiness data={state.clientReadiness} />}
          
          <ProductMetrics
            avatarReliability={avatarReliability}
            hypothesesValidated={0}
            topMessages={[]}
            topOffers={topOffers}
            nextAction={
              state.phases.phase6?.experiments?.[0]
                ? `Test: ${state.phases.phase6.experiments[0].hypothesis} on ${state.phases.phase6.experiments[0].channel}`
                : undefined
            }
          />

          <div className={showSignupGate ? "relative" : ""}>
            {showSignupGate && (
              <div className="absolute inset-0 backdrop-blur-md z-10 rounded-lg" />
            )}
            <MainGrid analysisState={state} />
            <ValidationMap data={state.phases.phase6} isRunning={state.isRunning} />
          </div>
        </div>
      )}

      {showSignupGate && <SignupGate onComplete={handleSignupComplete} />}
      
      <footer className="border-t dotted-border-t py-6 mt-12">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 AI GTM Factory. Built on evidence, not opinions.
        </p>
      </footer>
    </div>
  );
};

export default Index;
