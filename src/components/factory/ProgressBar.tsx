import { CheckCircle2, Circle } from "lucide-react";

const phases = [
  {
    title: "Analizar el mercado",
    desc: "Descubrimos competidores y huecos",
    completed: true
  },
  {
    title: "Definir avatar",
    desc: "Creamos tu buyer persona",
    completed: true
  },
  {
    title: "Calcular valor",
    desc: "Aplicamos la ecuación de valor",
    completed: true
  },
  {
    title: "Adaptar colores DISC",
    desc: "Personalizamos la comunicación",
    completed: false
  },
  {
    title: "Triggers emocionales",
    desc: "Identificamos gatillos",
    completed: false
  },
  {
    title: "Validación",
    desc: "Mapeamos experimentos",
    completed: false
  }
];

export const ProgressBar = () => {
  return (
    <nav className="border-b dotted-border-b bg-secondary/30">
      <div className="container mx-auto px-4 py-6">
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {phases.map((phase, index) => (
            <li
              key={index}
              className={`flex flex-col items-center text-center transition-all duration-300 ${
                phase.completed ? "opacity-100" : "opacity-50"
              }`}
            >
              <div className="mb-2">
                {phase.completed ? (
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                ) : (
                  <Circle className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <span className="text-sm font-medium mb-1">{phase.title}</span>
              <span className="text-xs text-muted-foreground">{phase.desc}</span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
