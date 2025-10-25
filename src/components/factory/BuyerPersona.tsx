import { StatusBadge } from "./StatusBadge";
import { SystemLiveIndicator } from "./SystemLiveIndicator";
import { ContextualNotice } from "./ContextualNotice";

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
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
            👩
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
