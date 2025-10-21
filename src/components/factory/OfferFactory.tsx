export const OfferFactory = () => {
  const offers = [
    "Obtén piel radiante en 14 días",
    "Rutina de 5 minutos garantizada",
    "Entrega en 48 horas o gratis",
    "Primera caja con 20% descuento"
  ];

  const valueScore = 78; // 0-100

  return (
    <div className="p-6 border dotted-border rounded-lg bg-card h-full">
      <h3 className="text-xl font-semibold mb-2">Fábrica de ofertas</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Basado en la ecuación de valor de Hormozi
      </p>

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
    </div>
  );
};
