import { Palette } from "lucide-react";

export const DISCTranslatorPreview = () => {
  return (
    <div className="p-6 border dotted-border rounded-t-lg bg-card relative border-b-0">
      <h3 className="text-xl font-semibold mb-2">Traductor DISC</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Adapta ofertas según personalidad del comprador (Tomas Erikson)
      </p>
      <div className="mb-4 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-xs text-muted-foreground inline-flex items-center gap-1 w-fit">
        <Palette className="w-3 h-3 text-primary" />
        Ofertas + Perfil del Buyer + 4 Estilos DISC
      </div>
      
      <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
        <h4 className="font-semibold text-sm mb-2">¿Qué es DISC?</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Las personas toman decisiones de compra de formas diferentes. DISC divide a los compradores en 4 tipos:
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full mt-0.5 bg-[hsl(var(--disc-red))]" />
            <div>
              <span className="font-semibold">Rojo (Dominante):</span>
              <p className="text-muted-foreground">Quiere resultados rápidos y directos.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full mt-0.5 bg-[hsl(var(--disc-yellow))]" />
            <div>
              <span className="font-semibold">Amarillo (Influyente):</span>
              <p className="text-muted-foreground">Quiere sentirse parte de algo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
