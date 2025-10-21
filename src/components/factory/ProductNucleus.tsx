export const ProductNucleus = () => {
  return (
    <div className="p-6 border-2 border-primary/30 rounded-lg bg-gradient-to-br from-primary/5 to-background text-center max-w-sm">
      <h3 className="text-2xl font-bold mb-4 text-primary">Producto</h3>
      
      <div className="mb-6 flex justify-center">
        <div className="relative w-24 h-32">
          {/* Simple bottle illustration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-6 bg-primary rounded-t-lg" />
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-24 bg-gradient-to-b from-primary/80 to-primary/60 rounded-b-2xl border-2 border-primary/40" />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-16 bg-white/30 rounded-b-xl" />
        </div>
      </div>

      <p className="text-sm font-medium mb-3">
        El núcleo que conecta mercado, cliente y ofertas
      </p>
      
      <p className="text-xs text-muted-foreground leading-relaxed">
        Describe de forma simple qué problema resuelve tu producto y cómo encaja 
        en el mercado. Esta es la pieza central que da sentido a toda la estrategia.
      </p>

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
