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
  Clock
} from "lucide-react";

interface PhaseRibbonProps {
  currentPhase: number;
  isRunning: boolean;
}

const phases = [
  { 
    number: 1, 
    labelKey: "phase.market",
    icon: Map, 
    tooltipKey: "phase.market.tooltip",
    time: "~2 min"
  },
  { 
    number: 2, 
    labelKey: "phase.buyer",
    icon: User, 
    tooltipKey: "phase.buyer.tooltip",
    time: "~1 min"
  },
  { 
    number: 3, 
    labelKey: "phase.offers",
    icon: Package, 
    tooltipKey: "phase.offers.tooltip",
    time: "~1 min"
  },
  { 
    number: 4, 
    labelKey: "phase.disc",
    icon: Palette, 
    tooltipKey: "phase.disc.tooltip",
    time: "~1 min"
  },
  { 
    number: 5, 
    labelKey: "phase.triggers",
    icon: MessageSquare, 
    tooltipKey: "phase.triggers.tooltip",
    time: "~1 min"
  },
  {
    number: 6,
    labelKey: "phase.channels",
    icon: TestTube,
    tooltipKey: "phase.channels.tooltip",
    time: "~1 min"
  },
  {
    number: 7,
    labelKey: "phase.creatives",
    icon: Wand2,
    tooltipKey: "phase.creatives.tooltip",
    time: "~1 min"
  },
];

export const PhaseRibbon = ({ currentPhase, isRunning }: PhaseRibbonProps) => {
  const { t } = useLanguage();
  
  // Calculate remaining time
  const remainingPhases = phases.filter(p => p.number >= currentPhase);
  const totalRemainingMinutes = remainingPhases.reduce((acc, p) => {
    const mins = parseInt(p.time.replace('~', '').replace(' min', ''));
    return acc + mins;
  }, 0);

  return (
    <section className="w-full px-8 py-8 no-pdf">
      {/* Progress summary */}
      {isRunning && currentPhase > 0 && (
        <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            {t('phase.progress')} {currentPhase}/7 • ~{totalRemainingMinutes} {t('phase.remaining')}
          </span>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
        {phases.map((phase, idx) => {
          const Icon = phase.icon;
          const isActive = currentPhase === phase.number;
          const isCompleted = currentPhase > phase.number;
          const showSeparator = idx < phases.length - 1;

          return (
            <div key={phase.number} className="flex items-center">
              <div
                className={cn(
                  "group relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                  isActive && "bg-primary/10 ring-2 ring-primary",
                  isCompleted && "bg-secondary"
                )}
                title={t(phase.tooltipKey)}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive && "text-primary animate-pulse",
                      isCompleted && "text-primary",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive && "text-primary",
                      isCompleted && "text-foreground",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  >
                    {t(phase.labelKey)}
                  </span>
                </div>
                
                {/* Time estimate */}
                <span className={cn(
                  "text-[10px] transition-colors",
                  isActive && "text-primary",
                  isCompleted && "text-muted-foreground",
                  !isActive && !isCompleted && "text-muted-foreground/60"
                )}>
                  {phase.time}
                </span>
                
                {/* Tooltip */}
                <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-3 py-1 rounded-md whitespace-nowrap pointer-events-none z-10 shadow-md">
                  {t(phase.tooltipKey)}
                </span>
              </div>

              {showSeparator && (
                <div className="hidden md:block w-12 h-px dotted-border-t mx-2" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};