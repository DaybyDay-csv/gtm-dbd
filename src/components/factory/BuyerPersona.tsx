export const BuyerPersona = () => {
  const thoughtClouds = [
    "Le preocupa el tiempo",
    "Desea resultados visibles",
    "Quiere sentirse segura",
    "Le da pereza lo complejo"
  ];

  return (
    <div className="p-6 border dotted-border rounded-lg bg-card h-full">
      <h3 className="text-xl font-semibold mb-2">Buyer Persona</h3>
      
      <div className="flex flex-col items-center mt-6">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 border-2 border-primary/30">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
            👩
          </div>
        </div>
        
        <p className="text-sm font-medium text-center mb-4">
          Lucía, 32 años, Madrid
          <br />
          <span className="text-muted-foreground">Clase media–alta</span>
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
          <p className="text-sm italic text-muted-foreground">
            "Hi, soy Lucía. Busco soluciones que me hagan la vida más fácil sin complicarme. 
            Valoro mi tiempo y quiero resultados que pueda ver."
          </p>
        </div>
      </div>
    </div>
  );
};
