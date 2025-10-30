import { SectionDownloadButton } from "./SectionDownloadButton";

interface ClientReadinessProps {
  data?: {
    score: number;
    maturity: string;
    recommendation: string;
    reasoning: string;
    budgetSignals?: string[];
  };
}

export const ClientReadiness = ({ data }: ClientReadinessProps) => {
  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score <= 2) return "text-yellow-600 dark:text-yellow-400";
    if (score === 3) return "text-blue-600 dark:text-blue-400";
    return "text-green-600 dark:text-green-400";
  };

  const getScoreLabel = (score: number) => {
    if (score <= 2) return "Recursos Limitados";
    if (score === 3) return "Recursos Moderados";
    return "Recursos Sólidos";
  };

  return (
    <div className="p-6 border dotted-border rounded-lg bg-card relative">
      <div className="absolute top-4 right-4">
        <SectionDownloadButton sectionName="Client Readiness" data={data} />
      </div>
      <h3 className="text-xl font-semibold mb-4">Evaluación de Recursos del Cliente</h3>
      
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-muted-foreground">Puntuación:</span>
          <span className={`text-3xl font-bold ${getScoreColor(data.score)}`}>
            {data.score}/5
          </span>
          <span className={`text-sm font-medium ${getScoreColor(data.score)}`}>
            {getScoreLabel(data.score)}
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all"
            style={{ 
              width: `${(data.score / 5) * 100}%`,
              backgroundColor: data.score <= 2 ? 'hsl(var(--warning))' : data.score === 3 ? 'hsl(var(--primary))' : 'hsl(var(--success))'
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-1">Madurez del Negocio</h4>
          <p className="text-sm text-muted-foreground">{data.maturity}</p>
        </div>

        {data.budgetSignals && data.budgetSignals.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Señales de Presupuesto</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {data.budgetSignals.map((signal, i) => (
                <li key={i}>• {signal}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="font-semibold text-sm mb-1">Análisis</h4>
          <p className="text-sm text-muted-foreground">{data.reasoning}</p>
        </div>

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="font-semibold text-sm mb-1 text-primary">Recomendación</h4>
          <p className="text-sm">{data.recommendation}</p>
        </div>
      </div>
    </div>
  );
};
