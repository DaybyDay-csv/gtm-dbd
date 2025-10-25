interface ProductNucleusProps {
  data?: {
    product?: string;
    problemsSolved?: string[];
    gaps?: string[];
    value?: string;
  };
}

export const ProductNucleus = ({ data }: ProductNucleusProps) => {
  const product = data?.product || "Tu Producto Principal";
  const problemsSolved = data?.problemsSolved || ["Resuelve X problema", "Ofrece Y solución"];
  const gaps = data?.gaps || ["Puede cubrir Z gap"];
  const value = data?.value || "Propuesta de valor única";

  return (
    <div className="p-6 border-2 border-primary/30 rounded-lg bg-gradient-to-br from-primary/5 to-background text-center max-w-sm h-full flex flex-col">
      <h3 className="text-2xl font-bold mb-4 text-primary">Producto</h3>
      
      <div className="mb-3 px-3 py-1.5 bg-background/80 border border-primary/20 rounded-full text-xs text-muted-foreground inline-flex items-center gap-1 mx-auto">
        <span className="text-primary font-semibold">⚡</span>
        Problemas + Soluciones + Valor Único
      </div>
      
      <div className="text-lg font-semibold mb-3 text-foreground">
        {product}
      </div>
      
      <div className="mb-6 flex justify-center">
        <div className="relative w-24 h-32">
          {/* Simple bottle illustration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-6 bg-primary rounded-t-lg" />
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-24 bg-gradient-to-b from-primary/80 to-primary/60 rounded-b-2xl border-2 border-primary/40" />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-16 bg-white/30 rounded-b-xl" />
        </div>
      </div>

      <div className="mb-4 space-y-2 flex-1">
        <div className="text-left">
          <p className="text-xs font-medium text-muted-foreground mb-1">Problemas que resuelve:</p>
          <ul className="text-xs space-y-1">
            {problemsSolved.map((problem, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-primary mt-0.5">•</span>
                <span>{problem}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {gaps.length > 0 && (
          <div className="text-left">
            <p className="text-xs font-medium text-muted-foreground mb-1">Gaps que puede cubrir:</p>
            <ul className="text-xs space-y-1">
              {gaps.map((gap, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="text-left pt-2 border-t dotted-border-t">
          <p className="text-xs font-medium text-muted-foreground mb-1">Valor único:</p>
          <p className="text-xs italic">{value}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t dotted-border-t">
        <div className="flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">Mercado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.3s" }} />
            <span className="text-muted-foreground">Cliente</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.6s" }} />
            <span className="text-muted-foreground">Valor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
