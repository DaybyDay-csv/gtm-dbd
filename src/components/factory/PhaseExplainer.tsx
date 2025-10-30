import { Loader2, BarChart3, Target, Search, Lightbulb, User, MessageSquare, Palette, TrendingUp, Gem, ArrowUp, ArrowDown, Gift, Zap, Wrench, FlaskConical, Smartphone, Rocket, Info, Circle } from "lucide-react";
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
      { icon: BarChart3, text: "Estudiando tu página web para entender quién eres y qué ofreces" },
      { icon: Target, text: "Identificando el problema que resuelves y cómo lo haces" },
      { icon: Search, text: "Investigando el mercado: competidores, gaps y oportunidades" },
      { icon: Lightbulb, text: "Detectando dónde puedes diferenciarte y ganar" },
    ],
    dataSource: "Análisis basado en: contenido real de tu web, descripción del producto, información de competidores y contexto del mercado que proporcionaste.",
  },
  {
    phase: 2,
    title: "Creando tu Buyer Persona ideal",
    steps: [
      { icon: User, text: "Definiendo quién es tu cliente perfecto basado en el mercado real" },
      { icon: MessageSquare, text: "Identificando sus deseos, miedos, ambiciones y objetivos" },
      { icon: Palette, text: "Generando un avatar visual que representa a tu buyer" },
      { icon: TrendingUp, text: "Calculando la confiabilidad inicial de este perfil" },
    ],
    dataSource: "Perfil construido a partir de: análisis de mercado previo, características de tu producto y posicionamiento competitivo identificado en la fase anterior.",
  },
  {
    phase: 3,
    title: "Diseñando ofertas de alto valor",
    steps: [
      { icon: Gem, text: "Aplicando la ecuación de valor de Hormozi a tu producto" },
      { icon: ArrowUp, text: "Maximizando el resultado deseado y la probabilidad de éxito" },
      { icon: ArrowDown, text: "Reduciendo el tiempo de espera y el esfuerzo percibido" },
      { icon: Gift, text: "Creando ofertas irresistibles para cada necesidad de tu buyer" },
    ],
    dataSource: "Ofertas diseñadas usando: perfil completo del buyer persona, gaps del mercado identificados y características únicas de tu producto.",
  },
  {
    phase: 4,
    title: "Traduciendo a los 4 lenguajes DISC",
    steps: [
      { icon: Circle, text: "Versión ROJA: Mensaje directo y orientado a resultados", color: "text-red-500" },
      { icon: Circle, text: "Versión AMARILLA: Mensaje emocional y entusiasta", color: "text-yellow-500" },
      { icon: Circle, text: "Versión VERDE: Mensaje cercano y basado en confianza", color: "text-green-500" },
      { icon: Circle, text: "Versión AZUL: Mensaje lógico y basado en datos", color: "text-blue-500" },
    ],
    dataSource: "Mensajes adaptados desde: las ofertas de valor creadas y el perfil psicológico del buyer persona, traducidos a cada estilo de comunicación DISC.",
  },
  {
    phase: 5,
    title: "Generando disparadores emocionales",
    steps: [
      { icon: Target, text: "Combinando características del buyer × color DISC × variable de valor" },
      { icon: Zap, text: "Creando triggers que activan la decisión de compra" },
      { icon: MessageSquare, text: "Diseñando ejemplos de copy para cada trigger" },
      { icon: Wrench, text: "Definiendo cómo implementar cada disparador" },
    ],
    dataSource: "Triggers generados combinando: perfil emocional del buyer, mensajes DISC personalizados y ecuación de valor de tus ofertas.",
  },
  {
    phase: 6,
    title: "Creando tu mapa de validación",
    steps: [
      { icon: FlaskConical, text: "Transformando todo en hipótesis testeables" },
      { icon: Smartphone, text: "Definiendo canales: Meta, Google, Email, Landing..." },
      { icon: BarChart3, text: "Estableciendo KPIs, costes y tiempos para cada test" },
      { icon: Rocket, text: "Priorizando la siguiente mejor acción a ejecutar" },
    ],
    dataSource: "Experimentos diseñados integrando: todas las fases anteriores (buyer, ofertas, mensajes DISC y triggers emocionales) en tests accionables.",
  },
];

export const PhaseExplainer = ({ currentPhase, isRunning }: PhaseExplainerProps) => {
  if (!isRunning || currentPhase === 0) return null;

  const currentExplanation = phaseExplanations.find((p) => p.phase === currentPhase);
  if (!currentExplanation) return null;

  return (
    <section className="container mx-auto px-4 py-8 no-pdf">
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
              {currentExplanation.steps.map((step, idx) => {
                const StepIcon = step.icon;
                const iconColor = step.color || "text-primary";
                return (
                  <li
                    key={idx}
                    className="text-sm text-muted-foreground flex items-start gap-2 animate-in fade-in slide-in-from-left"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <StepIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} fill="currentColor" />
                    <span>{step.text}</span>
                  </li>
                );
              })}
            </ul>
            {currentExplanation.dataSource && (
              <div className="mt-4 pt-3 border-t border-primary/10">
                <p className="text-xs text-muted-foreground italic flex items-start gap-2">
                  <Info className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                  <span>{currentExplanation.dataSource}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
};
