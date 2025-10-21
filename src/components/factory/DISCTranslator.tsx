export const DISCTranslator = () => {
  const translations = [
    { color: "Rojo", copy: "Resultados en 14 días", channel: "Meta", purpose: "Venta" },
    { color: "Amarillo", copy: "¡Únete a la comunidad!", channel: "WPP", purpose: "Educación" },
    { color: "Verde", copy: "Cuidamos de ti paso a paso", channel: "Email", purpose: "Fidelizar" },
    { color: "Azul", copy: "Ingredientes certificados", channel: "Meta", purpose: "Venta" }
  ];

  const colorMap: Record<string, string> = {
    "Rojo": "hsl(var(--disc-red))",
    "Amarillo": "hsl(var(--disc-yellow))",
    "Verde": "hsl(var(--disc-green))",
    "Azul": "hsl(var(--disc-blue))"
  };

  return (
    <div className="p-6 border dotted-border rounded-lg bg-card h-full">
      <h3 className="text-xl font-semibold mb-2">Traductor DISC</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Adapta ofertas según personalidad del comprador (Tomas Erikson)
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dotted-border-b">
              <th className="text-left py-2 font-semibold">Color</th>
              <th className="text-left py-2 font-semibold">Copy</th>
              <th className="text-left py-2 font-semibold">Canal</th>
              <th className="text-left py-2 font-semibold">Propósito</th>
            </tr>
          </thead>
          <tbody>
            {translations.map((row, index) => (
              <tr key={index} className="border-b dotted-border-b last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colorMap[row.color] }}
                    />
                    <span className="font-medium">{row.color}</span>
                  </div>
                </td>
                <td className="py-3">{row.copy}</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-secondary rounded text-xs">{row.channel}</span>
                </td>
                <td className="py-3 text-muted-foreground">{row.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {["Rojo", "Amarillo", "Verde", "Azul"].map((color) => (
          <div
            key={color}
            className="p-4 rounded-lg text-center font-medium text-sm border dotted-border"
            style={{
              backgroundColor: colorMap[color] + "20",
              borderColor: colorMap[color]
            }}
          >
            {color}
          </div>
        ))}
      </div>
    </div>
  );
};
