import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PhaseExplainerProps {
  currentPhase: number;
  isRunning: boolean;
}

const phaseExplanations = [
  {
    phase: 1,
    title: "Analizando tu website y el mercado",
    steps: [
      "📊 Estudiando tu página web para entender quién eres y qué ofreces",
      "🎯 Identificando el problema que resuelves y cómo lo haces",
      "🔍 Investigando el mercado: competidores, gaps y oportunidades",
      "💡 Detectando dónde puedes diferenciarte y ganar",
    ],
  },
  {
    phase: 2,
    title: "Creando tu Buyer Persona ideal",
    steps: [
      "👤 Definiendo quién es tu cliente perfecto basado en el mercado real",
      "💭 Identificando sus deseos, miedos, ambiciones y objetivos",
      "🎨 Generando un avatar visual que representa a tu buyer",
      "📈 Calculando la confiabilidad inicial de este perfil",
    ],
  },
  {
    phase: 3,
    title: "Diseñando ofertas de alto valor",
    steps: [
      "💎 Aplicando la ecuación de valor de Hormozi a tu producto",
      "⬆️ Maximizando el resultado deseado y la probabilidad de éxito",
      "⬇️ Reduciendo el tiempo de espera y el esfuerzo percibido",
      "🎁 Creando ofertas irresistibles para cada necesidad de tu buyer",
    ],
  },
  {
    phase: 4,
    title: "Traduciendo a los 4 lenguajes DISC",
    steps: [
      "🔴 Versión ROJA: Mensaje directo y orientado a resultados",
      "🟡 Versión AMARILLA: Mensaje emocional y entusiasta",
      "🟢 Versión VERDE: Mensaje cercano y basado en confianza",
      "🔵 Versión AZUL: Mensaje lógico y basado en datos",
    ],
  },
  {
    phase: 5,
    title: "Generando disparadores emocionales",
    steps: [
      "🎯 Combinando características del buyer × color DISC × variable de valor",
      "⚡ Creando triggers que activan la decisión de compra",
      "💬 Diseñando ejemplos de copy para cada trigger",
      "🛠️ Definiendo cómo implementar cada disparador",
    ],
  },
  {
    phase: 6,
    title: "Creando tu mapa de validación",
    steps: [
      "🧪 Transformando todo en hipótesis testeables",
      "📱 Definiendo canales: Meta, Google, Email, Landing...",
      "📊 Estableciendo KPIs, costes y tiempos para cada test",
      "🚀 Priorizando la siguiente mejor acción a ejecutar",
    ],
  },
];

export const PhaseExplainer = ({ currentPhase, isRunning }: PhaseExplainerProps) => {
  if (!isRunning || currentPhase === 0) return null;

  const currentExplanation = phaseExplanations.find((p) => p.phase === currentPhase);
  if (!currentExplanation) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary mb-3">
              {currentExplanation.title}
            </h3>
            <ul className="space-y-2">
              {currentExplanation.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="text-sm text-muted-foreground flex items-start gap-2 animate-in fade-in slide-in-from-left"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Este análisis es 100% personalizado para tu negocio basado en investigación real del mercado.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
};
