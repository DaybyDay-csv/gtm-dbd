import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Map, 
  User, 
  Package, 
  MessageSquare, 
  Palette, 
  TestTube,
  Wand2,
  ChevronUp,
  Loader2
} from "lucide-react";

interface FloatingProgressProps {
  currentPhase: number;
  isRunning: boolean;
  isVisible: boolean;
  onScrollToPhases: () => void;
}

const phases = [
  { number: 1, labelKey: "phase.market", icon: Map },
  { number: 2, labelKey: "phase.buyer", icon: User },
  { number: 3, labelKey: "phase.offers", icon: Package },
  { number: 4, labelKey: "phase.disc", icon: Palette },
  { number: 5, labelKey: "phase.triggers", icon: MessageSquare },
  { number: 6, labelKey: "phase.channels", icon: TestTube },
  { number: 7, labelKey: "phase.creatives", icon: Wand2 },
];

export const FloatingProgress = ({ 
  currentPhase, 
  isRunning, 
  isVisible,
  onScrollToPhases 
}: FloatingProgressProps) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-collapse after 3 seconds if expanded
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => setIsExpanded(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  if (!isVisible || currentPhase === 0) return null;

  const currentPhaseData = phases.find(p => p.number === currentPhase);
  const CurrentIcon = currentPhaseData?.icon || Map;
  const completedCount = isRunning ? currentPhase - 1 : currentPhase;
  const progressPercent = (completedCount / 7) * 100;

  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out",
        "animate-fade-in"
      )}
    >
      {/* Expanded view */}
      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-xl shadow-lg p-4 min-w-[280px] animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              {t('phase.progress')} {completedCount}/7
            </span>
            {isRunning && (
              <span className="text-xs text-primary flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {t('phase.processing')}
              </span>
            )}
          </div>
          
          {/* Mini phase list */}
          <div className="space-y-2">
            {phases.map((phase) => {
              const Icon = phase.icon;
              const isActive = currentPhase === phase.number;
              const isCompleted = currentPhase > phase.number;
              
              return (
                <div 
                  key={phase.number}
                  className={cn(
                    "flex items-center gap-2 text-xs py-1 px-2 rounded-md transition-colors",
                    isActive && "bg-primary/10 text-primary",
                    isCompleted && "text-muted-foreground",
                    !isActive && !isCompleted && "text-muted-foreground/50"
                  )}
                >
                  <Icon className={cn(
                    "w-3.5 h-3.5",
                    isActive && "animate-pulse"
                  )} />
                  <span className="flex-1">{t(phase.labelKey)}</span>
                  {isCompleted && <span className="text-green-500">✓</span>}
                  {isActive && isRunning && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                </div>
              );
            })}
          </div>
          
          {/* Go to phases button */}
          <button
            onClick={onScrollToPhases}
            className="w-full mt-3 py-2 text-xs text-center text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <ChevronUp className="w-3 h-3" />
            {t('phase.goToProgress') || 'Ver progreso'}
          </button>
        </div>
      )}

      {/* Collapsed pill */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-3 bg-card border border-border rounded-full px-4 py-3 shadow-lg",
          "hover:shadow-xl hover:border-primary/30 transition-all duration-200",
          "group cursor-pointer"
        )}
      >
        {/* Progress ring */}
        <div className="relative w-8 h-8">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted/20"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${progressPercent * 0.88} 88`}
              strokeLinecap="round"
              className="text-primary transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isRunning ? (
              <CurrentIcon className="w-3.5 h-3.5 text-primary animate-pulse" />
            ) : (
              <span className="text-[10px] font-bold text-primary">{completedCount}</span>
            )}
          </div>
        </div>

        {/* Status text */}
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium text-foreground">
            {isRunning ? t(currentPhaseData?.labelKey || 'phase.market') : t('phase.completed') || 'Completado'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {completedCount}/7 {t('phase.phases') || 'fases'}
          </span>
        </div>

        {/* Expand indicator */}
        <ChevronUp className={cn(
          "w-4 h-4 text-muted-foreground transition-transform duration-200",
          isExpanded && "rotate-180"
        )} />
      </button>
    </div>
  );
};