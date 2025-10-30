import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, TrendingUp, Target, Zap, Rocket, Crown, DollarSign, Lightbulb, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface BudgetInputProps {
  onSubmit: (budgetLevel: string, budgetAmount: number, channelPreference?: string) => void;
}

const budgetLevels = [
  { value: "nulo", label: "Nulo", range: 0, icon: Target, color: "text-gray-500" },
  { value: "bajo", label: "Bajo", range: 1250, icon: Zap, color: "text-yellow-600" },
  { value: "medio", label: "Medio", range: 6000, icon: TrendingUp, color: "text-blue-600" },
  { value: "medio-alto", label: "Medio-Alto", range: 20000, icon: Rocket, color: "text-purple-600" },
  { value: "alto", label: "Alto", range: 65000, icon: Crown, color: "text-orange-600" },
  { value: "maximo", label: "Máximo", range: 100000, icon: Crown, color: "text-red-600" },
];

export const BudgetInput = ({ onSubmit }: BudgetInputProps) => {
  const [selectedLevel, setSelectedLevel] = useState(2); // Default to "Medio"
  const [customAmount, setCustomAmount] = useState(budgetLevels[2].range);
  const [channelPreference, setChannelPreference] = useState("");

  const handleLevelChange = (value: number[]) => {
    const level = value[0];
    setSelectedLevel(level);
    setCustomAmount(budgetLevels[level].range);
  };

  const handleSubmit = () => {
    const level = budgetLevels[selectedLevel];
    const preference = channelPreference.trim() || undefined;
    onSubmit(level.value, customAmount, preference);
  };

  const currentLevel = budgetLevels[selectedLevel];
  const LevelIcon = currentLevel.icon;

  return (
    <section className="w-full px-8 py-12">
      <Card className="max-w-3xl mx-auto border-2 dotted-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2 flex items-center gap-2 justify-center">
            <DollarSign className="w-8 h-8 text-primary" />
            Define tu presupuesto de campaña
          </CardTitle>
          <CardDescription className="text-base">
            Esto nos ayudará a recomendar el canal más óptimo para tu estrategia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Visual Level Selector */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Nivel de esfuerzo económico</Label>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {budgetLevels.map((level, idx) => {
                const Icon = level.icon;
                const isSelected = selectedLevel === idx;
                return (
                  <button
                    key={level.value}
                    onClick={() => {
                      setSelectedLevel(idx);
                      setCustomAmount(level.range);
                    }}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 scale-105"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-1 ${level.color}`} />
                    <span className="text-xs font-medium">{level.label}</span>
                  </button>
                );
              })}
            </div>
            
            <Slider
              value={[selectedLevel]}
              onValueChange={handleLevelChange}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          {/* Current Selection Display */}
          <div className="flex items-center justify-center gap-4 p-6 bg-secondary/30 rounded-lg border dotted-border">
            <LevelIcon className={`w-12 h-12 ${currentLevel.color}`} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Nivel seleccionado</p>
              <p className="text-2xl font-bold">{currentLevel.label}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {currentLevel.value === "nulo" && "Sin presupuesto disponible"}
                {currentLevel.value === "bajo" && "€500 - €2,000 /mes"}
                {currentLevel.value === "medio" && "€2,000 - €10,000 /mes"}
                {currentLevel.value === "medio-alto" && "€10,000 - €30,000 /mes"}
                {currentLevel.value === "alto" && "€30,000 - €100,000 /mes"}
                {currentLevel.value === "maximo" && "€100,000+ /mes"}
              </p>
            </div>
          </div>

          {/* Editable Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base">
              Presupuesto estimado (editable)
            </Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="pl-10 text-lg font-semibold"
                min={0}
                step={100}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Puedes modificar esta cifra según tu presupuesto real
            </p>
          </div>

          {/* Channel Preference */}
          <div className="space-y-2">
            <Label htmlFor="channelPreference" className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Preferencia de canal (opcional)
            </Label>
            <Textarea
              id="channelPreference"
              value={channelPreference}
              onChange={(e) => setChannelPreference(e.target.value)}
              placeholder='Ej: "Prefiero Google Ads", "Quiero evitar Facebook", "Me interesa TikTok Shop"...'
              className="min-h-[80px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Si tienes alguna preferencia o canal específico en mente, indícalo aquí y lo tendremos en cuenta en el análisis
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full text-lg"
          >
            Continuar análisis de canal →
          </Button>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
              <span><strong>¿Por qué es importante?</strong> El presupuesto determina qué canales son viables para tu estrategia.</span>
              Un presupuesto bajo puede favorecer canales orgánicos, mientras que uno alto permite experimentar con múltiples canales de pago.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};