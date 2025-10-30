import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipTermProps {
  term: string;
  definition: string;
  children?: React.ReactNode;
}

export const TooltipTerm = ({ term, definition, children }: TooltipTermProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 underline decoration-dotted cursor-help">
            {children || term}
            <Info className="w-3 h-3 inline" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
