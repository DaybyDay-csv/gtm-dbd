import { CheckCircle2, Circle, Loader2 } from "lucide-react";

const phaseDefinitions = [
  {
    title: "Analizar el mercado",
    desc: "Descubrimos competidores y huecos",
  },
  {
    title: "Definir avatar",
    desc: "Creamos tu buyer persona",
  },
  {
    title: "Calcular valor",
    desc: "Aplicamos la ecuación de valor",
  },
  {
    title: "Adaptar colores DISC",
    desc: "Personalizamos la comunicación",
  },
  {
    title: "Triggers emocionales",
    desc: "Identificamos gatillos",
  },
  {
    title: "Validación",
    desc: "Mapeamos experimentos",
  },
];

interface ProgressBarProps {
  currentPhase: number;
  isRunning: boolean;
}

export const ProgressBar = ({ currentPhase, isRunning }: ProgressBarProps) => {
  return (
    <nav className="border-b dotted-border-b bg-secondary/30">
      <div className="container mx-auto px-4 py-6">
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {phaseDefinitions.map((phase, index) => {
            const phaseNumber = index + 1;
            const isCompleted = currentPhase > phaseNumber;
            const isActive = currentPhase === phaseNumber && isRunning;

            return (
              <li
                key={index}
                className={`flex flex-col items-center text-center transition-all duration-300 ${
                  isCompleted || isActive ? "opacity-100" : "opacity-50"
                }`}
              >
                <div className="mb-3">
                  {isActive ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  ) : (
                    <Circle className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm font-semibold mb-1.5">{phase.title}</span>
                <span className="text-xs text-muted-foreground leading-tight">{phase.desc}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
