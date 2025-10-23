import { Hero } from "@/components/factory/Hero";
import { EvidenceDrawer } from "@/components/factory/EvidenceDrawer";
import { PhaseRibbon } from "@/components/factory/PhaseRibbon";
import { PhaseExplainer } from "@/components/factory/PhaseExplainer";
import { ProductMetrics } from "@/components/factory/ProductMetrics";
import { MainGrid } from "@/components/factory/MainGrid";
import { ValidationMap } from "@/components/factory/ValidationMap";
import { useAnalysisOrchestrator } from "@/hooks/useAnalysisOrchestrator";

const Index = () => {
  const { state, runAnalysis } = useAnalysisOrchestrator();

  // Extract metrics from analysis state
  const avatarReliability = state.phases.phase2?.profile?.reliability || 0;
  const topOffers = state.phases.phase3?.offers?.slice(0, 3).map((o: any) => ({
    offer: o.offer,
    value: o.valueGauge?.value || 0,
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <Hero onRunAnalysis={runAnalysis} isRunning={state.isRunning} />
      
      {!state.isRunning && state.currentPhase === 0 && <EvidenceDrawer />}
      
      {state.currentPhase > 0 && (
        <>
          <PhaseRibbon currentPhase={state.currentPhase} isRunning={state.isRunning} />
          <PhaseExplainer currentPhase={state.currentPhase} isRunning={state.isRunning} />
          
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

          <MainGrid analysisState={state} />
          <ValidationMap data={state.phases.phase6} />
        </>
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
