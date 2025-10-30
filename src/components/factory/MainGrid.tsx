import { PositioningMap } from "./PositioningMap";
import { BuyerPersona } from "./BuyerPersona";
import { OfferFactory } from "./OfferFactory";
import { DISCTranslator } from "./DISCTranslator";
import { ProductNucleus } from "./ProductNucleus";
import { ProductUnderstanding } from "./ProductUnderstanding";
import { AnalysisState } from "@/hooks/useAnalysisOrchestrator";

interface MainGridProps {
  analysisState: AnalysisState;
  showBlurOnPhase4Plus?: boolean;
}

export const MainGrid = ({ analysisState, showBlurOnPhase4Plus = false }: MainGridProps) => {
  const { phases, isRunning } = analysisState;
  const hasData = (data: any) => data && Object.keys(data).length > 0;

  return (
    <section className="w-full px-8 py-12 space-y-8">
      {/* Product Understanding - Full Width First */}
      <div className={`w-full ${isRunning && !hasData(phases.phase1?.productUnderstanding) ? 'charging' : ''} ${hasData(phases.phase1?.productUnderstanding) ? 'magic-reveal' : ''}`}>
        <ProductUnderstanding data={phases.phase1?.productUnderstanding} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top row */}
        <div className={`lg:col-span-1 ${isRunning && !hasData(phases.phase1) ? 'charging' : ''} ${hasData(phases.phase1) ? 'magic-reveal' : ''}`}>
          <PositioningMap data={phases.phase1} />
        </div>
        <div className={`lg:col-span-1 flex items-center justify-center ${isRunning && !hasData(phases.phase1?.productNucleus) ? 'charging' : ''} ${hasData(phases.phase1?.productNucleus) ? 'magic-reveal' : ''}`}>
          <ProductNucleus data={phases.phase1?.productNucleus} />
        </div>
        <div className={`lg:col-span-1 ${isRunning && !hasData(phases.phase2) ? 'charging' : ''} ${hasData(phases.phase2) ? 'magic-reveal' : ''}`}>
          <BuyerPersona data={phases.phase2} />
        </div>

        {/* Bottom row */}
        <div className={`lg:col-span-1 ${isRunning && !hasData(phases.phase3) ? 'charging' : ''} ${hasData(phases.phase3) ? 'magic-reveal' : ''}`}>
          <OfferFactory data={phases.phase3} />
        </div>
        <div className={`lg:col-span-2 ${isRunning && !hasData(phases.phase4) ? 'charging' : ''} ${hasData(phases.phase4) ? 'magic-reveal' : ''} ${showBlurOnPhase4Plus ? 'relative' : ''}`}>
          {showBlurOnPhase4Plus && (
            <div className="absolute inset-0 backdrop-blur-md z-10 rounded-lg" />
          )}
          <DISCTranslator data={phases.phase4} />
        </div>
      </div>
    </section>
  );
};
