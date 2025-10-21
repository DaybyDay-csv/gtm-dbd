import { PositioningMap } from "./PositioningMap";
import { BuyerPersona } from "./BuyerPersona";
import { OfferFactory } from "./OfferFactory";
import { DISCTranslator } from "./DISCTranslator";
import { ProductNucleus } from "./ProductNucleus";

export const MainGrid = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top row */}
        <div className="lg:col-span-1">
          <PositioningMap />
        </div>
        <div className="lg:col-span-1 flex items-center justify-center">
          <ProductNucleus />
        </div>
        <div className="lg:col-span-1">
          <BuyerPersona />
        </div>

        {/* Bottom row */}
        <div className="lg:col-span-1">
          <OfferFactory />
        </div>
        <div className="lg:col-span-2">
          <DISCTranslator />
        </div>
      </div>
    </section>
  );
};
