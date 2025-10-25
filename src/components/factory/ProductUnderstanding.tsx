import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Target, Lightbulb, TrendingUp, Package } from "lucide-react";

interface ProductUnderstandingProps {
  data?: {
    mainProduct: string;
    category: string;
    problemsSolved: string[];
    utility: string;
    value: string;
    positioning: string;
    gapsCovered: string[];
  };
}

export const ProductUnderstanding = ({ data }: ProductUnderstandingProps) => {
  if (!data) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Deep Product Understanding
        </CardTitle>
        <div className="mt-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-xs text-muted-foreground inline-flex items-center gap-1 w-fit">
          <BarChart3 className="w-3 h-3 text-primary" />
          Web Content + Your Description + Market Context
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Product */}
        <div>
          <h4 className="font-semibold text-lg mb-2">{data.mainProduct}</h4>
          <p className="text-sm text-muted-foreground">{data.category}</p>
        </div>

        {/* Problems Solved */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-destructive" />
            <h5 className="font-semibold">Problems Solved</h5>
          </div>
          <ul className="space-y-2">
            {data.problemsSolved.map((problem, idx) => (
              <li key={idx} className="text-sm pl-4 border-l-2 border-destructive/20">
                {problem}
              </li>
            ))}
          </ul>
        </div>

        {/* Utility */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h5 className="font-semibold">Utility & Transformation</h5>
          </div>
          <p className="text-sm">{data.utility}</p>
        </div>

        {/* Value */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h5 className="font-semibold">Value Proposition</h5>
          </div>
          <p className="text-sm">{data.value}</p>
        </div>

        {/* Positioning */}
        <div>
          <h5 className="font-semibold mb-2">Market Positioning</h5>
          <p className="text-sm italic">{data.positioning}</p>
        </div>

        {/* Gaps Covered */}
        <div>
          <h5 className="font-semibold mb-3">Market Gaps & Opportunities</h5>
          <div className="space-y-2">
            {data.gapsCovered.map((gap, idx) => (
              <div key={idx} className="text-sm p-3 bg-primary/5 rounded-lg border border-primary/10">
                {gap}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
