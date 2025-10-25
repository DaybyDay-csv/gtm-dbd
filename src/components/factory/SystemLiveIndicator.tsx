import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SystemLiveIndicatorProps {
  status: 'theoretical' | 'partial' | 'validated';
  connectedPlatforms?: string[];
  lastSync?: Date;
}

export const SystemLiveIndicator = ({ status, connectedPlatforms = [], lastSync }: SystemLiveIndicatorProps) => {
  const [showModal, setShowModal] = useState(false);

  const statusConfig = {
    theoretical: {
      color: 'bg-secondary',
      animation: '',
      tooltip: 'Sistema en Modo Teórico',
    },
    partial: {
      color: 'bg-amber-500',
      animation: '',
      tooltip: 'Sistema Parcialmente Conectado',
    },
    validated: {
      color: 'bg-green-500',
      animation: 'animate-pulse',
      tooltip: 'Sistema Vivo - Conectado',
    },
  };

  const config = statusConfig[status];

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group relative"
        aria-label="Estado del sistema"
      >
        <div className="absolute right-0 top-6 w-64 bg-popover text-popover-foreground border rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-xs shadow-lg z-50">
          <p className="font-semibold mb-2">{config.tooltip}</p>
          {status === 'theoretical' ? (
            <>
              <p className="text-muted-foreground mb-2">
                Estos datos son hipótesis generadas por IA sin validar todavía con datos de mercado.
              </p>
              <p className="text-muted-foreground text-[10px]">
                🔜 Próximamente podrás conectar: Meta Ads, Google Ads, Amazon Ads y más
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-1">
                {connectedPlatforms.length}/{connectedPlatforms.length > 0 ? '5' : '0'} plataformas conectadas
              </p>
              {lastSync && (
                <p className="text-muted-foreground text-[10px]">
                  Última actualización: {lastSync.toLocaleString('es-ES')}
                </p>
              )}
            </>
          )}
          <button className="text-primary text-[10px] mt-2 underline">
            Ver detalles
          </button>
        </div>
      </button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              ⚙️ ¿Qué es un Sistema Vivo?
            </DialogTitle>
            <DialogDescription>
              Un sistema de análisis de mercado que se mantiene actualizado en tiempo real
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-sm">
            <p>
              Un sistema de análisis de mercado que se mantiene actualizado en tiempo real 
              conectándose a tus campañas y plataformas de venta.
            </p>

            <div>
              <p className="font-semibold mb-2">📊 CÓMO FUNCIONA:</p>
              <ol className="space-y-2 ml-4">
                <li>1. Hipótesis Inicial (IA)</li>
                <li>2. Lanzas Experimentos</li>
                <li>3. Conectas Plataformas (Meta, Google, etc.)</li>
                <li>4. Sistema Valida con Datos Reales</li>
                <li>5. Ajusta Automáticamente los Insights</li>
              </ol>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold mb-2 text-green-900 dark:text-green-100">✅ BENEFICIOS:</p>
              <ul className="space-y-1 text-xs text-green-800 dark:text-green-200">
                <li>• Insights basados en TU mercado real</li>
                <li>• Decisiones guiadas por datos frescos</li>
                <li>• Evita sesgos de "teoría sin validar"</li>
                <li>• Aprende continuamente de tus campañas</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold mb-2 text-blue-900 dark:text-blue-100">🔜 PRÓXIMAMENTE:</p>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Podrás conectar Meta Ads, Google Ads, Amazon Ads, TikTok, Shopify, Email Marketing y más.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
