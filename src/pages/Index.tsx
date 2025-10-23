import { Header } from "@/components/factory/Header";
import { ProgressBar } from "@/components/factory/ProgressBar";
import { MainGrid } from "@/components/factory/MainGrid";
import { ValidationMap } from "@/components/factory/ValidationMap";
import { useAnalysisOrchestrator } from "@/hooks/useAnalysisOrchestrator";

const Index = () => {
  const { state, runAnalysis } = useAnalysisOrchestrator();

  return (
    <div className="min-h-screen bg-background">
      <Header onRunAnalysis={runAnalysis} isRunning={state.isRunning} />
      <ProgressBar currentPhase={state.currentPhase} isRunning={state.isRunning} />
      <MainGrid analysisState={state} />
      <ValidationMap data={state.phases.phase6} />
      
      <footer className="border-t dotted-border-t py-6 mt-12">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 AI Marketing Factory. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Index;
