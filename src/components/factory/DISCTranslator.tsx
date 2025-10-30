import { Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { StatusBadge } from "./StatusBadge";
import { SystemLiveIndicator } from "./SystemLiveIndicator";
import { ContextualNotice } from "./ContextualNotice";
import { SectionDownloadButton } from "./SectionDownloadButton";

interface DISCTranslatorProps {
  data?: {
    discTable?: Array<{
      offer: string;
      red: { copy: string; channel: string; purpose: string };
      yellow: { copy: string; channel: string; purpose: string };
      green: { copy: string; channel: string; purpose: string };
      blue: { copy: string; channel: string; purpose: string };
    }>;
  };
}

export const DISCTranslator = ({ data }: DISCTranslatorProps) => {
  const discTable = data?.discTable || [];
  
  const translations = discTable.length > 0
    ? [
        { color: "Rojo", copy: discTable[0].red.copy, channel: discTable[0].red.channel, purpose: discTable[0].red.purpose },
        { color: "Amarillo", copy: discTable[0].yellow.copy, channel: discTable[0].yellow.channel, purpose: discTable[0].yellow.purpose },
        { color: "Verde", copy: discTable[0].green.copy, channel: discTable[0].green.channel, purpose: discTable[0].green.purpose },
        { color: "Azul", copy: discTable[0].blue.copy, channel: discTable[0].blue.channel, purpose: discTable[0].blue.purpose }
      ]
    : [
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
    <div className="p-6 border dotted-border rounded-lg bg-card h-full relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <SectionDownloadButton sectionName="DISC Translator" data={data} />
        <SystemLiveIndicator status="theoretical" />
        <StatusBadge status="theoretical" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Traductor DISC</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Adapta ofertas según personalidad del comprador (Tomas Erikson)
      </p>
      <div className="mb-4 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-xs text-muted-foreground inline-flex items-center gap-1 w-fit">
        <Palette className="w-3 h-3 text-primary" />
        Ofertas + Perfil del Buyer + 4 Estilos DISC
      </div>
      
      <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed">
        <h4 className="font-semibold text-sm mb-2">¿Qué es DISC?</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Las personas toman decisiones de compra de formas diferentes. DISC divide a los compradores en 4 tipos según su personalidad:
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full mt-0.5" style={{ backgroundColor: colorMap["Rojo"] }} />
            <div>
              <span className="font-semibold">Rojo (Dominante):</span>
              <p className="text-muted-foreground">Quiere resultados rápidos y directos. Dale datos y beneficios claros.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full mt-0.5" style={{ backgroundColor: colorMap["Amarillo"] }} />
            <div>
              <span className="font-semibold">Amarillo (Influyente):</span>
              <p className="text-muted-foreground">Quiere sentirse parte de algo. Dale comunidad y experiencias.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full mt-0.5" style={{ backgroundColor: colorMap["Verde"] }} />
            <div>
              <span className="font-semibold">Verde (Estable):</span>
              <p className="text-muted-foreground">Necesita confianza y seguridad. Dale garantías y apoyo continuo.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full mt-0.5" style={{ backgroundColor: colorMap["Azul"] }} />
            <div>
              <span className="font-semibold">Azul (Analítico):</span>
              <p className="text-muted-foreground">Quiere detalles y pruebas. Dale especificaciones y certificaciones.</p>
            </div>
          </div>
        </div>
      </div>

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

      <div className="mt-6">
        <ContextualNotice 
          status="theoretical" 
          componentType="disc"
          confidenceScore={0}
        />
      </div>
    </div>
  );
};
