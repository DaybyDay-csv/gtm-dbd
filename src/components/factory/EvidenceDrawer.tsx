import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const EvidenceDrawer = () => {
  const cases = [
    {
      hypothesis: "Offer + DISC Red + Meta",
      metric: "CTR",
      range: "2.1% - 3.8%",
      trend: "up" as const,
      note: "Speed-focused copy resonates",
    },
    {
      hypothesis: "Pain point + DISC Green + Email",
      metric: "Reply Rate",
      range: "8% - 15%",
      trend: "up" as const,
      note: "Trust messaging performs well",
    },
    {
      hypothesis: "Ambition + DISC Blue + Landing",
      metric: "CPL",
      range: "$147 → $95",
      trend: "down" as const,
      note: "Data-driven approach varies by segment",
      decrease: "35%",
    },
  ];

  return (
    <section className="w-full px-8 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Evidence from Real Tests</h3>
          <p className="text-sm text-muted-foreground">
            Ranges show variability across segments and timing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cases.map((c, idx) => (
            <Card key={idx} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="text-xs">
                  {c.hypothesis}
                </Badge>
                {c.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                {c.trend === "down" && <TrendingDown className="h-4 w-4 text-green-600" />}
              </div>
              <div>
                <p className="text-sm font-medium">{c.metric}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{c.range}</p>
                  {'decrease' in c && <span className="text-sm font-medium text-green-600">-{c.decrease}</span>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{c.note}</p>
            </Card>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          * Results vary by market, timing, and execution. Connect your data for personalized insights.
        </p>
      </div>
    </section>
  );
};
