import { Button } from "@/components/ui/button";
import { Info, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface ContextualNoticeProps {
  status: 'theoretical' | 'partial' | 'validated' | 'stale';
  componentType: 'offer' | 'disc' | 'channel' | 'persona' | 'validation';
  confidenceScore?: number;
  freshnessScore?: number;
  connectedPlatforms?: string[];
}

export const ContextualNotice = ({ 
  status, 
  componentType,
  confidenceScore = 0,
  freshnessScore = 0,
  connectedPlatforms = []
}: ContextualNoticeProps) => {
  
  const getNoticeContent = () => {
    switch (status) {
      case 'theoretical':
        return getTheoreticalNotice();
      case 'partial':
        return getPartialNotice();
      case 'stale':
        return getStaleNotice();
      case 'validated':
        return getValidatedNotice();
      default:
        return null;
    }
  };

  const getTheoreticalNotice = () => {
    const messages = {
      offer: 'Datos teóricos basados en fórmula de Hormozi. Se validarán con datos reales de campañas.',
      disc: 'Perfiles teóricos según modelo DISC. Se ajustarán con datos de engagement real.',
      channel: 'Análisis teórico. El ranking se actualizará con métricas reales de campañas.',
      persona: 'Perfil basado en análisis de mercado. Se refinará con comportamiento real.',
      validation: 'Experimentos listos. Los resultados se sincronizarán automáticamente al conectar plataformas.'
    };

    return (
      <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded border border-border">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          {messages[componentType]}
        </p>
      </div>
    );
  };

  const getPartialNotice = () => (
    <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded border border-border">
      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 text-xs">
        <p className="text-muted-foreground">
          Confianza: {confidenceScore}% • Conectado: {connectedPlatforms.join(', ')}
        </p>
      </div>
    </div>
  );

  const getStaleNotice = () => (
    <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded border border-destructive/30">
      <Clock className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1 text-xs">
        <p className="text-muted-foreground">
          Datos desactualizados. Lanza nuevos tests para mantener insights frescos.
        </p>
      </div>
    </div>
  );

  const getValidatedNotice = () => (
    <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded border border-primary/30">
      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <div className="flex-1 text-xs">
        <p className="text-muted-foreground">
          Validado • Confianza: {confidenceScore}% • Freshness: {freshnessScore}%
        </p>
      </div>
    </div>
  );

  return getNoticeContent();
};
