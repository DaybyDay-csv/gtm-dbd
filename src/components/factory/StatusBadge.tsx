import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, X } from 'lucide-react';

interface StatusBadgeProps {
  status: 'theoretical' | 'partial' | 'validated' | 'stale';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const statusConfig = {
    theoretical: { 
      dot: <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />, 
      label: 'Teórico', 
      color: 'bg-secondary/50 text-muted-foreground border-border' 
    },
    partial: { 
      dot: <div className="w-2 h-2 rounded-full bg-amber-500" />, 
      label: 'Parcial', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300' 
    },
    validated: { 
      dot: <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />, 
      label: 'Validado', 
      color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300' 
    },
    stale: { 
      dot: <div className="w-2 h-2 rounded-full bg-red-500" />, 
      label: 'Obsoleto', 
      color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300' 
    }
  };

  const config = statusConfig[status];

  // Solo mostrar popover/dialog para el estado "theoretical"
  if (status !== 'theoretical') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${config.color}`}>
        {config.dot}
        <span className="hidden sm:inline">{config.label}</span>
      </span>
    );
  }

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button 
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${config.color} cursor-pointer hover:bg-secondary/70 transition-colors`}
            onMouseEnter={() => setPopoverOpen(true)}
            onMouseLeave={() => setPopoverOpen(false)}
          >
            {config.dot}
            <span className="hidden sm:inline">{config.label}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4"
          onMouseEnter={() => setPopoverOpen(true)}
          onMouseLeave={() => setPopoverOpen(false)}
        >
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1.5">Sistema en Modo Teórico</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Estos datos son hipótesis generadas por IA sin validar todavía con datos de mercado.
              </p>
            </div>
            
            <div className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Próximamente:</span> Podrás conectar Meta Ads, Google Ads, Amazon Ads, TikTok y más.
              </p>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => {
                setShowDialog(true);
                setPopoverOpen(false);
              }}
            >
              Ver detalles
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <DialogTitle>¿Qué es un Sistema Vivo?</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Un sistema de análisis de mercado que se mantiene actualizado en tiempo real
            </p>

            <p className="text-sm leading-relaxed">
              Un sistema de análisis de mercado que se mantiene actualizado en tiempo real conectándose a 
              tus campañas y plataformas de venta.
            </p>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-lg">📊</span>
                CÓMO FUNCIONA:
              </h4>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-muted-foreground">1.</span>
                  <span>Hipótesis Inicial (IA)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">2.</span>
                  <span>Lanzas Experimentos</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">3.</span>
                  <span>Conectas Plataformas (Meta, Google, etc.)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">4.</span>
                  <span>Sistema Valida con Datos Reales</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">5.</span>
                  <span>Ajusta Automáticamente los Insights</span>
                </li>
              </ol>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
              <h4 className="font-semibold text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                BENEFICIOS:
              </h4>
              <ul className="space-y-1.5 text-sm text-green-700 dark:text-green-400">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Insights basados en TU mercado real</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Decisiones guiadas por datos frescos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Evita sesgos de "teoría sin validar"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Aprende continuamente de tus campañas</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                PRÓXIMAMENTE:
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Podrás conectar Meta Ads, Google Ads, Amazon Ads, TikTok, Shopify, Email Marketing y más.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
