import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { CheckCircle2, AlertCircle, TrendingUp, Clock, Euro } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

interface ChannelStrategyProps {
  data?: {
    budgetAnalysis?: {
      estimatedMonthly: number;
      confidence: string;
      factors: string[];
    };
    channels?: Array<{
      name: string;
      score: number;
      reasoning: string;
      pros: string[];
      cons: string[];
      estimatedCPL: string;
      timeToResults: string;
      rank: number;
      isNativePlatform?: boolean;
      platformDetails?: {
        adTypes: string[];
        organicBoost: string;
        budgetSplit: string;
      };
    }>;
    recommendation?: {
      primary: string;
      secondary: string;
      tertiary: string;
      disclosure: string;
    };
  };
  isRunning?: boolean;
}

export const ChannelStrategy = ({ data, isRunning }: ChannelStrategyProps) => {
  if (!data || !data.channels) return null;

  const primaryChannel = data.channels.find(c => c.rank === 1);
  const alternatives = data.channels.filter(c => c.rank !== 1).sort((a, b) => a.rank - b.rank);

  // Prepare radar chart data (top 5 channels)
  const radarData = data.channels.slice(0, 5).map(channel => ({
    channel: channel.name,
    score: channel.score,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceColor = (confidence: string) => {
    if (confidence === "high") return "bg-green-100 text-green-800 border-green-300";
    if (confidence === "medium") return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  return (
    <section className={`container mx-auto px-4 py-12 space-y-8 ${isRunning ? 'charging' : 'magic-reveal'}`}>
      {/* Budget Analysis */}
      {data.budgetAnalysis && (
        <Card className="border-2 dotted-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="w-5 h-5" />
              Análisis de Presupuesto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Presupuesto Mensual Estimado</p>
                <p className="text-3xl font-bold">€{data.budgetAnalysis.estimatedMonthly.toLocaleString()}</p>
              </div>
              <Badge className={`${getConfidenceColor(data.budgetAnalysis.confidence)} border`}>
                Confianza: {data.budgetAnalysis.confidence}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Factores considerados:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {data.budgetAnalysis.factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Recommendation */}
      {primaryChannel && (
        <Card className="border-4 border-primary shadow-xl">
          <CardHeader className="text-center bg-primary/5">
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <CardTitle className="text-3xl">
                🎯 Canal Recomendado: {primaryChannel.name}
              </CardTitle>
              {primaryChannel.isNativePlatform && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700 text-sm">
                  <Target className="w-4 h-4 mr-1" />
                  Canal Nativo - Audiencia Caliente
                </Badge>
              )}
            </div>
            <CardDescription className="text-base">
              Basado en tu buyer persona, presupuesto y gap de mercado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Score Circle */}
            <div className="flex flex-col items-center justify-center p-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-secondary"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - primaryChannel.score / 100)}`}
                    className="text-primary transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold ${getScoreColor(primaryChannel.score)}`}>
                    {primaryChannel.score}
                  </span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
              </div>
            </div>

            {/* Pros and Cons */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  Ventajas
                </h4>
                <ul className="space-y-2">
                  {primaryChannel.pros.map((pro, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <AlertCircle className="w-5 h-5" />
                  Consideraciones
                </h4>
                <ul className="space-y-2">
                  {primaryChannel.cons.map((con, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-orange-600 mt-1">⚠</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-lg border dotted-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">CPL Estimado</p>
                <p className="text-xl font-bold">{primaryChannel.estimatedCPL}</p>
              </div>
              <div className="text-center border-x dotted-border-x">
                <p className="text-sm text-muted-foreground mb-1">Tiempo a Resultados</p>
                <p className="text-xl font-bold flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  {primaryChannel.timeToResults}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Presupuesto Recomendado</p>
                <p className="text-xl font-bold">
                  €{data.budgetAnalysis ? Math.round(data.budgetAnalysis.estimatedMonthly * 0.7).toLocaleString() : "N/A"} - 
                  €{data.budgetAnalysis ? Math.round(data.budgetAnalysis.estimatedMonthly * 1.2).toLocaleString() : "N/A"}/mes
                </p>
              </div>
            </div>

            {/* Disclosure */}
            {data.recommendation?.disclosure && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  💡 POR QUÉ ESTE CANAL:
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {data.recommendation.disclosure}
                </p>
              </div>
            )}

            {/* Platform Details for Native Platforms */}
            {primaryChannel.platformDetails && (
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                  📱 Opciones Disponibles en {primaryChannel.name}:
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-1.5">Tipos de Anuncios:</p>
                    <ul className="text-xs text-green-700 dark:text-green-300 space-y-1 pl-4">
                      {primaryChannel.platformDetails.adTypes.map((type, i) => (
                        <li key={i} className="list-disc">{type}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-1.5">🌱 Posicionamiento Orgánico:</p>
                    <p className="text-xs text-green-700 dark:text-green-300">{primaryChannel.platformDetails.organicBoost}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-1.5">💰 Distribución de Presupuesto Recomendada:</p>
                    <p className="text-xs text-green-700 dark:text-green-300 font-mono bg-green-100/50 dark:bg-green-900/20 px-2 py-1 rounded">{primaryChannel.platformDetails.budgetSplit}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparative Radar Chart */}
      <Card className="border-2 dotted-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Comparativa de Canales
          </CardTitle>
          <CardDescription>
            Puntuación de viabilidad por canal basada en múltiples factores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="channel" 
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ranking of Alternatives */}
      <Card className="border-2 dotted-border">
        <CardHeader>
          <CardTitle>🥇 Ranking de Alternativas</CardTitle>
          <CardDescription>
            Otras opciones viables ordenadas por puntuación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.channels.sort((a, b) => b.score - a.score).map((channel, idx) => (
            <div
              key={channel.name}
              className="p-4 rounded-lg border dotted-border hover:bg-secondary/30 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-2xl font-bold text-muted-foreground w-8">
                    {idx + 1}.
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold">{channel.name}</p>
                      {channel.isNativePlatform && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700 text-xs">
                          <Target className="w-3 h-3 mr-1" />
                          Canal Nativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {channel.reasoning}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{channel.score}/100</p>
                    <div className="w-32 h-2 bg-gray-300 rounded-full overflow-hidden mt-2">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${channel.score}%`,
                          background: `linear-gradient(90deg, rgb(209, 213, 219) 0%, rgb(251, 191, 36) 50%, rgb(217, 119, 6) 100%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Details */}
              {channel.platformDetails && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800 ml-12">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-1">
                    📱 Opciones en {channel.name}
                  </p>
                  <div className="grid md:grid-cols-3 gap-3 text-xs text-blue-700 dark:text-blue-300">
                    <div>
                      <p className="font-medium mb-1">Tipos de Anuncios:</p>
                      <ul className="space-y-0.5 pl-3">
                        {channel.platformDetails.adTypes.slice(0, 2).map((type, i) => (
                          <li key={i} className="list-disc">{type}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">🌱 Orgánico:</p>
                      <p className="line-clamp-2">{channel.platformDetails.organicBoost}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">💰 Presupuesto:</p>
                      <p className="font-mono text-[10px]">{channel.platformDetails.budgetSplit}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
};