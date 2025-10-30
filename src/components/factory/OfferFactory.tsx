import { StatusBadge } from "./StatusBadge";
import { SystemLiveIndicator } from "./SystemLiveIndicator";
import { ContextualNotice } from "./ContextualNotice";
import { SectionDownloadButton } from "./SectionDownloadButton";
import { Sparkles, Lightbulb, Target, TrendingUp, ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface OfferFactoryProps {
  data?: {
    offers?: Array<{
      offer: string;
      valueGauge?: { value: number };
    }>;
    overallValue?: number;
  };
}

export const OfferFactory = ({ data }: OfferFactoryProps) => {
  const offers = data?.offers || [
    { offer: "Obtén piel radiante en 14 días", valueGauge: { value: 85 } },
    { offer: "Rutina de 5 minutos garantizada", valueGauge: { value: 72 } },
    { offer: "Entrega en 48 horas o gratis", valueGauge: { value: 68 } },
    { offer: "Primera caja con 20% descuento", valueGauge: { value: 65 } }
  ];

  const hasOffers = offers.length > 0;
  const valueScore = data?.overallValue || offers[0]?.valueGauge?.value || 78;

  return (
    <div className="p-6 border dotted-border rounded-lg bg-card h-full relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <SectionDownloadButton sectionName="Offer Factory" data={data} />
        <SystemLiveIndicator status="theoretical" />
        <StatusBadge status="theoretical" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Fábrica de ofertas</h3>
      <div className="mb-4 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-xs text-muted-foreground inline-flex items-center gap-1 w-fit">
        <Sparkles className="h-3 w-3 text-primary" />
        Buyer Persona + Gaps + Características del Producto
      </div>
      
      <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed">
        <div className="flex items-start gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1">¿Cómo comunicamos el valor de tu producto?</h4>
            <p className="text-xs text-muted-foreground">
              Analizamos tu producto y lo traducimos en un mensaje claro que tus clientes entienden al instante. Así mejoras la percepción de tu marca y vendes más, de forma honesta y directa.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="font-semibold text-primary mb-1 flex items-center gap-1">
              <span>↑</span> Aumentar
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Sueño:</span>
                <p className="text-muted-foreground">El resultado que tu cliente quiere conseguir</p>
              </div>
              <div>
                <span className="font-semibold">Probabilidad:</span>
                <p className="text-muted-foreground">La confianza de que tu solución funciona</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="font-semibold text-destructive mb-1 flex items-center gap-1">
              <span>↓</span> Reducir
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Tiempo:</span>
                <p className="text-muted-foreground">Cuánto tardan en ver resultados</p>
              </div>
              <div>
                <span className="font-semibold">Esfuerzo:</span>
                <p className="text-muted-foreground">Lo fácil que es usar tu solución</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 p-2 bg-background rounded text-center">
          <p className="text-xs font-mono">
            Valor = <span className="text-primary">(Sueño × Probabilidad)</span> / <span className="text-destructive">(Tiempo × Esfuerzo)</span>
          </p>
        </div>
      </div>

      {hasOffers && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Tu Oferta Más Fuerte
            </h3>
            <div className="p-6 rounded-lg border-2 border-primary bg-primary/5 relative">
              {offers[0].valueGauge && offers[0].valueGauge.value >= 75 && (
                <div className="absolute -top-3 -right-3">
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    TOP
                  </div>
                </div>
              )}
              <p className="text-xl font-semibold mb-4">{offers[0].offer}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Valor percibido</span>
                <div className="flex items-center gap-2">
                  <Progress value={offers[0].valueGauge?.value || 0} className="w-32" />
                  <span className="text-2xl font-bold text-primary">{offers[0].valueGauge?.value || 0}</span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
              </div>
            </div>
          </div>

          {offers.length > 1 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full mb-4">
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Ver más ofertas ({offers.length - 1})
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4">
                  {offers.slice(1).map((offer, index) => (
                    <div key={index + 1} className="p-4 rounded-lg border dotted-border bg-card hover:bg-secondary/20 transition-colors">
                      <h4 className="font-semibold mb-2 text-sm">{offer.offer}</h4>
                      <div className="flex items-center gap-3">
                        <Progress value={offer.valueGauge?.value || 0} className="flex-1" />
                        <span className="text-sm font-bold text-primary">{offer.valueGauge?.value || 0}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      )}

      <div className="mt-6">
        <ContextualNotice 
          status="theoretical" 
          componentType="offer"
          confidenceScore={0}
        />
      </div>
    </div>
  );
};
