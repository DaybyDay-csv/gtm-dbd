import { Palette, FileText, Zap, Target, Clock } from "lucide-react";

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
        { color: "Rojo", copy: "Resultados en 14 días o devolvemos tu dinero", channel: "Meta", purpose: "Venta" },
        { color: "Amarillo", copy: "Únete a 10,000 personas que ya transformaron su rutina", channel: "Instagram", purpose: "Comunidad" },
        { color: "Verde", copy: "Te acompañamos paso a paso, sin prisa, a tu ritmo", channel: "Email", purpose: "Fidelizar" },
        { color: "Azul", copy: "Ingredientes clínicamente probados y certificados por la UE", channel: "Meta", purpose: "Venta" }
      ];

  const colorMap: Record<string, { bg: string; border: string; dotBg: string; text: string }> = {
    "Rojo": { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-300 dark:border-red-700", dotBg: "bg-red-500", text: "text-red-900 dark:text-red-100" },
    "Amarillo": { bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-300 dark:border-yellow-700", dotBg: "bg-yellow-500", text: "text-yellow-900 dark:text-yellow-100" },
    "Verde": { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-300 dark:border-green-700", dotBg: "bg-green-500", text: "text-green-900 dark:text-green-100" },
    "Azul": { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-300 dark:border-blue-700", dotBg: "bg-blue-500", text: "text-blue-900 dark:text-blue-100" }
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
            <div className="w-3 h-3 rounded-full bg-red-500 mt-0.5" />
            <div>
              <span className="font-semibold">Rojo (Dominante):</span>
              <p className="text-muted-foreground">Quiere resultados rápidos y directos. Dale datos y beneficios claros.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mt-0.5" />
            <div>
              <span className="font-semibold">Amarillo (Influyente):</span>
              <p className="text-muted-foreground">Quiere sentirse parte de algo. Dale comunidad y experiencias.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 mt-0.5" />
            <div>
              <span className="font-semibold">Verde (Estable):</span>
              <p className="text-muted-foreground">Necesita confianza y seguridad. Dale garantías y apoyo continuo.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 mt-0.5" />
            <div>
              <span className="font-semibold">Azul (Analítico):</span>
              <p className="text-muted-foreground">Quiere detalles y pruebas. Dale especificaciones y certificaciones.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {translations.map((row) => {
          const colorStyle = colorMap[row.color] || colorMap["Azul"];
          const discType = row.color === "Rojo" ? "Dominante" : row.color === "Amarillo" ? "Influyente" : row.color === "Verde" ? "Estable" : "Concienzudo";
          return (
            <div
              key={row.color}
              className={`p-6 rounded-lg border-2 ${colorStyle.border} ${colorStyle.bg}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-4 h-4 rounded-full ${colorStyle.dotBg}`} />
                <h3 className={`text-xl font-bold ${colorStyle.text}`}>{row.color} - {discType}</h3>
              </div>
              
              <div className="mb-4 p-4 bg-background/80 rounded-lg border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Ejemplo de copy real:
                </p>
                <div className="space-y-2">
                  <p className="text-base font-semibold">{row.copy}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {row.color === "Rojo" && (
                      <>
                        <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Directo
                        </span>
                        <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full flex items-center gap-1">
                          <Target className="w-3 h-3" /> Resultados
                        </span>
                        <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Deadline
                        </span>
                      </>
                    )}
                    {row.color === "Amarillo" && (
                      <>
                        <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">Social</span>
                        <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">Inspirador</span>
                        <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">Emocional</span>
                      </>
                    )}
                    {row.color === "Verde" && (
                      <>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">Paso a paso</span>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">Apoyo</span>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">Seguridad</span>
                      </>
                    )}
                    {row.color === "Azul" && (
                      <>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">Datos</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">Lógica</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">Detalles</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Canal:</p>
                    <p className="text-sm">{row.channel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Propósito:</p>
                    <p className="text-sm">{row.purpose}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
