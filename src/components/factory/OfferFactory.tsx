import { StatusBadge } from "./StatusBadge";
import { SystemLiveIndicator } from "./SystemLiveIndicator";
import { ContextualNotice } from "./ContextualNotice";
import { SectionDownloadButton } from "./SectionDownloadButton";
import { Sparkles } from "lucide-react";

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
  const offers = data?.offers?.map((o) => o.offer) || [
    "Obtén piel radiante en 14 días",
    "Rutina de 5 minutos garantizada",
    "Entrega en 48 horas o gratis",
    "Primera caja con 20% descuento"
  ];

  const valueScore = data?.overallValue || 78;

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
        <h4 className="font-semibold text-sm mb-2">¿Cómo aumentamos el valor?</h4>
        <p className="text-xs text-muted-foreground mb-3">
          El valor de una oferta se maximiza cuando aumentamos el resultado deseado y su probabilidad, mientras reducimos el tiempo y esfuerzo necesarios.
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="font-semibold text-primary mb-1 flex items-center gap-1">
              <span>↑</span> Aumentar (Numerador)
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Sueño:</span>
                <p className="text-muted-foreground">El resultado que tu cliente realmente desea alcanzar</p>
              </div>
              <div>
                <span className="font-semibold">Probabilidad:</span>
                <p className="text-muted-foreground">La confianza de que tu solución realmente funciona</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="font-semibold text-destructive mb-1 flex items-center gap-1">
              <span>↓</span> Reducir (Denominador)
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Tiempo:</span>
                <p className="text-muted-foreground">Cuánto tardan en conseguir el resultado</p>
              </div>
              <div>
                <span className="font-semibold">Esfuerzo:</span>
                <p className="text-muted-foreground">Lo difícil que es implementar tu solución</p>
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

      <ul className="space-y-3 mb-8">
        {offers.map((offer, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <span className="text-primary font-semibold">•</span>
            <span>{offer}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <div className="flex justify-between text-sm font-medium">
          <span>Valor percibido</span>
          <span className="text-primary">{valueScore}/100</span>
        </div>
        
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${valueScore}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground pt-2">
          <div className="text-center">
            <div className="font-medium text-foreground">↑ Numerador</div>
            <div>Sueño × Probabilidad</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-foreground">↓ Denominador</div>
            <div>Tiempo × Esfuerzo</div>
          </div>
        </div>
      </div>

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
