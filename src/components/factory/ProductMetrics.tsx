import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CheckCircle2, Target, Gauge, ArrowRight } from "lucide-react";

interface ProductMetricsProps {
  avatarReliability?: number;
  hypothesesValidated?: number;
  topMessages?: Array<{ channel: string; metric: string; value: string }>;
  topOffers?: Array<{ offer: string; value: number }>;
  nextAction?: string;
}

export const ProductMetrics = ({
  avatarReliability = 0,
  hypothesesValidated = 0,
  topMessages = [],
  topOffers = [],
  nextAction,
}: ProductMetricsProps) => {
  // Only show if we have data
  if (!avatarReliability && !hypothesesValidated && topMessages.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Product Metrics</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Avatar Reliability */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Avatar Reliability
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{avatarReliability}%</span>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <Progress value={avatarReliability} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {avatarReliability < 30 && "Baseline - connect data to increase"}
                {avatarReliability >= 30 && avatarReliability < 70 && "Building confidence"}
                {avatarReliability >= 70 && "High confidence"}
              </p>
            </div>
          </div>

          {/* Hypotheses Validated */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Hypotheses Validated
            </div>
            <div className="space-y-2">
              <span className="text-3xl font-bold">{hypothesesValidated}%</span>
              <p className="text-xs text-muted-foreground">Last 14 days</p>
            </div>
          </div>

          {/* Top Messages */}
          {topMessages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Gauge className="h-4 w-4" />
                Top Messages
              </div>
              <div className="space-y-1">
                {topMessages.slice(0, 3).map((msg, idx) => (
                  <div key={idx} className="text-xs">
                    <Badge variant="outline" className="mr-2">
                      {msg.channel}
                    </Badge>
                    <span className="font-medium">{msg.metric}:</span> {msg.value}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Offers */}
          {topOffers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Highest Value Offers
              </div>
              <div className="space-y-1">
                {topOffers.slice(0, 3).map((offer, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-medium">{offer.offer}</span>
                    <Progress value={offer.value} className="h-1 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Next Best Action */}
        {nextAction && (
          <div className="mt-6 pt-6 border-t dotted-border-t">
            <div className="flex items-center gap-3 text-primary">
              <ArrowRight className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Next Best Action</p>
                <p className="text-sm text-foreground">{nextAction}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
};
