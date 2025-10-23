import { PositioningMap } from "./PositioningMap";
import { BuyerPersona } from "./BuyerPersona";
import { OfferFactory } from "./OfferFactory";
import { DISCTranslator } from "./DISCTranslator";
import { ProductNucleus } from "./ProductNucleus";
import { AnalysisState } from "@/hooks/useAnalysisOrchestrator";

interface MainGridProps {
  analysisState: AnalysisState;
}

export const MainGrid = ({ analysisState }: MainGridProps) => {
  const { phases } = analysisState;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top row */}
        <div className="lg:col-span-1">
          <PositioningMap data={phases.phase1} />
        </div>
        <div className="lg:col-span-1 flex items-center justify-center">
          <ProductNucleus />
        </div>
        <div className="lg:col-span-1">
          <BuyerPersona data={phases.phase2} />
        </div>

        {/* Bottom row */}
        <div className="lg:col-span-1">
          <OfferFactory data={phases.phase3} />
        </div>
        <div className="lg:col-span-2">
          <DISCTranslator data={phases.phase4} />
        </div>
      </div>
    </section>
  );
};
