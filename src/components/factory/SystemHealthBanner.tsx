import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SystemHealthBannerProps {
  status: 'theoretical' | 'partial' | 'active';
  confidenceScore?: number;
  freshnessScore?: number;
  connectedPlatforms?: string[];
}

export const SystemHealthBanner = ({ 
  status, 
  confidenceScore = 0,
  freshnessScore = 0,
  connectedPlatforms = []
}: SystemHealthBannerProps) => {
  
  if (status === 'theoretical') {
    return (
      <Alert className="bg-secondary/30 border-border">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚪</span>
            <div>
              <p className="font-semibold text-sm">Sistema en Modo Teórico</p>
              <AlertDescription className="text-xs">
                Estos análisis están basados en hipótesis generadas por IA. Para validarlos con datos reales del mercado, 
                podrás conectar plataformas de marketing próximamente.
              </AlertDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" disabled>
            🔗 Próximamente
          </Button>
        </div>
      </Alert>
    );
  }

  if (status === 'partial') {
    return (
      <Alert className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🟡</span>
            <div>
              <p className="font-semibold text-sm text-yellow-900 dark:text-yellow-100">
                Sistema Parcialmente Conectado | Confianza: {confidenceScore}%
              </p>
              <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
                {connectedPlatforms.length} plataformas conectadas: {connectedPlatforms.join(', ')}
              </AlertDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" className="shrink-0">
            Conectar más
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🟢</span>
          <div>
            <p className="font-semibold text-sm text-green-900 dark:text-green-100">
              Sistema Activo | Confianza: {confidenceScore}% | Freshness: {freshnessScore}%
            </p>
            <AlertDescription className="text-xs text-green-800 dark:text-green-200">
              {connectedPlatforms.length}/5 plataformas conectadas | Balance: 73% Mercado / 27% Teoría ✅
            </AlertDescription>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm">Ver salud del sistema</Button>
          <Button variant="outline" size="sm">Configurar alertas</Button>
        </div>
      </div>
    </Alert>
  );
};
