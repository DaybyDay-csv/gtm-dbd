import { cn } from "@/lib/utils";
import { 
  Map, 
  User, 
  Package, 
  MessageSquare, 
  Palette, 
  TestTube 
} from "lucide-react";

interface PhaseRibbonProps {
  currentPhase: number;
  isRunning: boolean;
}

const phases = [
  { number: 1, label: "Market", icon: Map, tooltip: "Understand your competitive landscape" },
  { number: 2, label: "Buyer", icon: User, tooltip: "Define your ideal customer" },
  { number: 3, label: "Offers", icon: Package, tooltip: "Create high-value propositions" },
  { number: 4, label: "DISC", icon: Palette, tooltip: "Translate to 4 emotional languages" },
  { number: 5, label: "Triggers", icon: MessageSquare, tooltip: "Generate emotional hooks" },
  { number: 6, label: "Validation", icon: TestTube, tooltip: "Test hypotheses across channels" },
];

export const PhaseRibbon = ({ currentPhase, isRunning }: PhaseRibbonProps) => {
  return (
    <section className="container mx-auto px-4 py-8">
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
                  "group relative flex flex-col items-center gap-2 px-3 py-2 rounded-lg transition-all",
                  isActive && "bg-primary/10 ring-2 ring-primary",
                  isCompleted && "bg-secondary"
                )}
                title={phase.tooltip}
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
                    {phase.label}
                  </span>
                </div>
                
                {/* Tooltip */}
                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-3 py-1 rounded-md whitespace-nowrap pointer-events-none z-10 shadow-md">
                  {phase.tooltip}
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
