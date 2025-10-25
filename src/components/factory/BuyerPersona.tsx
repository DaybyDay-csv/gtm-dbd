import { StatusBadge } from "./StatusBadge";
import { SystemLiveIndicator } from "./SystemLiveIndicator";
import { ContextualNotice } from "./ContextualNotice";
import { User, AlertTriangle } from "lucide-react";

interface BuyerPersonaProps {
  data?: {
    avatar?: {
      name: string;
      age: number;
      city: string;
      ses: string;
      description: string;
    };
    intro?: string;
    clouds?: string[];
    objections?: Array<{
      objection: string;
      likelihood: number;
      source: string;
    }>;
  };
}

export const BuyerPersona = ({ data }: BuyerPersonaProps) => {
  const avatar = data?.avatar || { name: "Lucía", age: 32, city: "Madrid", ses: "Clase media–alta" };
  const intro = data?.intro || "Hola, soy Lucía. Busco soluciones que me hagan la vida más fácil...";
  const thoughtClouds = data?.clouds || [
    "Le preocupa el tiempo",
    "Desea resultados visibles",
    "Quiere sentirse segura",
    "Le da pereza lo complejo"
  ];

  return (
    <div className="p-6 border dotted-border rounded-lg bg-card h-full relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <SystemLiveIndicator status="theoretical" />
        <StatusBadge status="theoretical" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Buyer Persona</h3>
      <div className="mt-2 mb-4 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-xs text-muted-foreground inline-flex items-center gap-1 w-fit">
        <span className="text-primary font-semibold"></span>
        Mercado + Producto + Posicionamiento
      </div>
      
      <div className="flex flex-col items-center mt-2">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 border-2 border-primary/30">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <p className="text-sm font-medium text-center mb-4">
          {avatar.name}, {avatar.age} años, {avatar.city}
          <br />
          <span className="text-muted-foreground">{avatar.ses}</span>
        </p>

        <div className="space-y-2 w-full">
          {thoughtClouds.map((thought, index) => (
            <div
              key={index}
              className="bg-secondary/50 rounded-full px-4 py-2 text-sm text-center border dotted-border hover:bg-secondary transition-colors"
            >
              {thought}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border dotted-border w-full">
          <p className="text-sm italic text-muted-foreground">"{intro}"</p>
        </div>

        {data?.objections && data.objections.length > 0 && (
          <div className="mt-6 w-full">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Posibles Objeciones
            </h4>
            <div className="space-y-2">
              {data.objections
                .sort((a, b) => b.likelihood - a.likelihood)
                .map((obj, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 text-center">
                      <div className="text-lg font-bold text-destructive">
                        {obj.likelihood}%
                      </div>
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="text-foreground">{obj.objection}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fuente: {
                          obj.source === 'competitor_advantage' ? 'Ventaja competidora' :
                          obj.source === 'market_gap' ? 'Brecha de mercado' :
                          obj.source === 'price_concern' ? 'Precio' :
                          'Barrera de confianza'
                        }
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-6 w-full">
          <ContextualNotice 
            status="theoretical" 
            componentType="persona"
            confidenceScore={0}
          />
        </div>
      </div>
    </div>
  );
};
