import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, TrendingDown } from "lucide-react";

interface EvidenceDrawerProps {
  industry?: string;
}

const casesByIndustry: Record<string, Array<{
  hypothesis: string;
  metric: string;
  range: string;
  trend: 'up' | 'down';
  noteKey: string;
  decrease?: string;
}>> = {
  saas: [
    {
      hypothesis: "Free Trial + DISC Red + Meta",
      metric: "Trial Signups",
      range: "+45% - +78%",
      trend: "up",
      noteKey: "evidence.saas.note1",
    },
    {
      hypothesis: "ROI Focus + DISC Blue + LinkedIn",
      metric: "Demo Requests",
      range: "+32% - +55%",
      trend: "up",
      noteKey: "evidence.saas.note2",
    },
    {
      hypothesis: "Pain Point + DISC Green + Email",
      metric: "CAC",
      range: "$180 → $95",
      trend: "down",
      noteKey: "evidence.saas.note3",
      decrease: "47%",
    },
  ],
  ecommerce: [
    {
      hypothesis: "Urgency + DISC Red + Meta",
      metric: "Conversion Rate",
      range: "2.8% - 4.5%",
      trend: "up",
      noteKey: "evidence.ecommerce.note1",
    },
    {
      hypothesis: "Social Proof + DISC Yellow + Instagram",
      metric: "ROAS",
      range: "3.2x → 5.8x",
      trend: "up",
      noteKey: "evidence.ecommerce.note2",
    },
    {
      hypothesis: "Bundle Offer + DISC Green + Email",
      metric: "AOV",
      range: "+28% - +45%",
      trend: "up",
      noteKey: "evidence.ecommerce.note3",
    },
  ],
  services: [
    {
      hypothesis: "Authority + DISC Blue + LinkedIn",
      metric: "Lead Quality",
      range: "+40% - +65%",
      trend: "up",
      noteKey: "evidence.services.note1",
    },
    {
      hypothesis: "Case Study + DISC Green + Email",
      metric: "Close Rate",
      range: "15% → 28%",
      trend: "up",
      noteKey: "evidence.services.note2",
    },
    {
      hypothesis: "Consultation + DISC Yellow + Meta",
      metric: "CPL",
      range: "$85 → $52",
      trend: "down",
      noteKey: "evidence.services.note3",
      decrease: "39%",
    },
  ],
  default: [
    {
      hypothesis: "Offer + DISC Red + Meta",
      metric: "CTR",
      range: "2.1% - 3.8%",
      trend: "up",
      noteKey: "evidence.default.note1",
    },
    {
      hypothesis: "Pain point + DISC Green + Email",
      metric: "Reply Rate",
      range: "8% - 15%",
      trend: "up",
      noteKey: "evidence.default.note2",
    },
    {
      hypothesis: "Ambition + DISC Blue + Landing",
      metric: "CPL",
      range: "$147 → $95",
      trend: "down",
      noteKey: "evidence.default.note3",
      decrease: "35%",
    },
  ],
};

export const EvidenceDrawer = ({ industry }: EvidenceDrawerProps) => {
  const { t } = useLanguage();
  
  // Get cases based on industry or use default
  const cases = casesByIndustry[industry || ''] || casesByIndustry.default;

  return (
    <section className="w-full px-8 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold mb-2">{t('evidence.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('evidence.subtitle')}
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
                  {'decrease' in c && c.decrease && (
                    <span className="text-sm font-medium text-green-600">-{c.decrease}</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t(c.noteKey)}</p>
            </Card>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          {t('evidence.disclaimer')}
        </p>
      </div>
    </section>
  );
};