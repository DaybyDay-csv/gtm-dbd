import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Palette, BarChart3, TestTube, FileText, Sparkles, Target, MessageSquare, Zap } from "lucide-react";

const UNLOCK_FEATURES = [
  {
    icon: Palette,
    titleKey: 'unlock.disc.title',
    descKey: 'unlock.disc.desc',
    preview: ['D - Dominance', 'I - Influence', 'S - Steadiness', 'C - Conscientiousness'],
  },
  {
    icon: BarChart3,
    titleKey: 'unlock.channel.title',
    descKey: 'unlock.channel.desc',
    preview: ['Meta Ads', 'Google Ads', 'LinkedIn', 'Email'],
  },
  {
    icon: TestTube,
    titleKey: 'unlock.variations.title',
    descKey: 'unlock.variations.desc',
    preview: ['30+ Headlines', 'CTAs', 'Visual Ideas'],
  },
  {
    icon: FileText,
    titleKey: 'unlock.pdf.title',
    descKey: 'unlock.pdf.desc',
    preview: ['Complete Analysis', 'Actionable Insights'],
  },
];

export const UnlockPreview = () => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 space-y-4">
      <div className="text-center lg:text-left mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 justify-center lg:justify-start">
          <Sparkles className="w-5 h-5 text-primary" />
          {t('unlock.title')}
        </h3>
        <p className="text-sm text-muted-foreground">{t('unlock.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {UNLOCK_FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Card key={idx} className="p-4 space-y-2 bg-muted/30 border-border/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h4 className="font-medium text-sm">{t(feature.titleKey)}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{t(feature.descKey)}</p>
              <div className="flex flex-wrap gap-1">
                {feature.preview.map((item, i) => (
                  <span key={i} className="px-2 py-0.5 text-[10px] bg-background rounded border border-border">
                    {item}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};