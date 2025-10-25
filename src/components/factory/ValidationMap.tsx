import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Target, TrendingUp, Clock, Euro, ChevronDown, Filter, 
  ExternalLink, PlusCircle, Zap 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "./StatusBadge";
import { SystemLiveIndicator } from "./SystemLiveIndicator";
import { ContextualNotice } from "./ContextualNotice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Variation {
  id: string;
  channel: string;
  discProfile: string;
  effect: string;
  objective: string;
  headline: string;
  subheadline: string;
  cta: string;
  emotionalTrigger: string;
  buyerField: string;
  offer: string;
  visualSuggestion: string;
  kpi: string;
  estimatedCost: string;
  ttv: string;
  state: string;
  owner: string;
  reasoning: string;
}

interface ValidationMapProps {
  data?: {
    variations?: Variation[];
  };
  isRunning?: boolean;
}

export const ValidationMap = ({ data, isRunning }: ValidationMapProps) => {
  const { toast } = useToast();
  const variations = data?.variations || [];
  const hasData = variations.length > 0;

  const [filterDisc, setFilterDisc] = useState<string | null>(null);
  const [filterChannel, setFilterChannel] = useState<string | null>(null);
  const [expandedVariation, setExpandedVariation] = useState<string | null>(null);
  const [variationStates, setVariationStates] = useState<Record<string, string>>(
    variations.reduce((acc, v) => ({ ...acc, [v.id]: v.state }), {})
  );

  const discColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    "Rojo": { bg: "bg-red-100", text: "text-red-800", border: "border-red-300", icon: "🔴" },
    "Amarillo": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", icon: "🟡" },
    "Verde": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", icon: "🟢" },
    "Azul": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300", icon: "🔵" },
  };

  const stateColors: Record<string, string> = {
    "Discover": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Test": "bg-blue-100 text-blue-800 border-blue-300",
    "Scale": "bg-green-100 text-green-800 border-green-300",
    "Paused": "bg-gray-100 text-gray-800 border-gray-300",
  };

  const availableStates = ["Discover", "Test", "Scale", "Paused"];
  const uniqueChannels = [...new Set(variations.map(v => v.channel))];
  const uniqueDisc = [...new Set(variations.map(v => v.discProfile))];

  const filteredVariations = variations.filter(v => {
    if (filterDisc && v.discProfile !== filterDisc) return false;
    if (filterChannel && v.channel !== filterChannel) return false;
    return true;
  });

  const handleStateChange = (id: string, newState: string) => {
    setVariationStates(prev => ({ ...prev, [id]: newState }));
  };

  const handleGenerateMore = (channel: string) => {
    toast({
      title: "Función próximamente",
      description: `Generar 10 variaciones adicionales para ${channel} estará disponible pronto.`,
    });
  };

  const handleConnect = (channel: string) => {
    toast({
      title: "Próximamente disponible",
      description: `La integración con ${channel} estará disponible próximamente.`,
    });
  };

  if (!hasData && !isRunning) return null;

  return (
    <section className={`container mx-auto px-4 py-12 ${isRunning ? 'charging' : ''} ${hasData ? 'magic-reveal' : ''}`}>
      <Card className="border-2 dotted-border relative">
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <SystemLiveIndicator status="theoretical" />
          <StatusBadge status="theoretical" />
        </div>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl mb-2">
                🎨 Variaciones Creativas
              </CardTitle>
              <CardDescription className="text-base">
                {filteredVariations.length} variaciones listas para probar • Formato Efecto → Causa
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* DISC Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    {filterDisc ? `DISC: ${filterDisc}` : "Todos DISC"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterDisc(null)}>
                    Todos los perfiles
                  </DropdownMenuItem>
                  {uniqueDisc.map(disc => (
                    <DropdownMenuItem key={disc} onClick={() => setFilterDisc(disc)}>
                      {discColors[disc]?.icon} {disc}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Channel Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    {filterChannel || "Todos Canales"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterChannel(null)}>
                    Todos los canales
                  </DropdownMenuItem>
                  {uniqueChannels.map(channel => (
                    <DropdownMenuItem key={channel} onClick={() => setFilterChannel(channel)}>
                      {channel}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Grid de 3 columnas con tarjetas compactas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {filteredVariations.map((variation) => {
              const discStyle = discColors[variation.discProfile] || discColors["Azul"];
              const currentState = variationStates[variation.id] || variation.state;

              return (
                <Card 
                  key={variation.id} 
                  className="border dotted-border hover:border-primary cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => setExpandedVariation(variation.id)}
                >
                  <CardHeader className="pb-3">
                    {/* Header con badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge className={`${discStyle.bg} ${discStyle.text} border ${discStyle.border}`}>
                        {discStyle.icon} {variation.discProfile}
                      </Badge>
                      <Badge className={`${stateColors[currentState]} border`}>
                        {currentState}
                      </Badge>
                    </div>
                    
                    {/* ID y Canal */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {variation.channel}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{variation.id}</span>
                    </div>
                    
                    {/* Headline (preview) */}
                    <p className="text-sm font-semibold line-clamp-2 mb-2">
                      {variation.headline}
                    </p>
                    
                    {/* Quick metrics preview */}
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>💰 {variation.estimatedCost}</span>
                      <span>⏱️ {variation.ttv}</span>
                    </div>
                  </CardHeader>
                  
                  <CardFooter className="pt-0">
                    <Button variant="ghost" size="sm" className="w-full">
                      Ver detalles →
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Dialog con el detalle completo */}
          <Dialog 
            open={expandedVariation !== null} 
            onOpenChange={(open) => !open && setExpandedVariation(null)}
          >
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              {expandedVariation && (() => {
                const variation = filteredVariations.find(v => v.id === expandedVariation);
                if (!variation) return null;
                
                const discStyle = discColors[variation.discProfile] || discColors["Azul"];
                const currentState = variationStates[variation.id] || variation.state;

                return (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Badge className={`${discStyle.bg} ${discStyle.text} border ${discStyle.border}`}>
                          {discStyle.icon} {variation.discProfile}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {variation.channel}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{variation.id}</span>
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                      {/* State Selector */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Estado:</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={`px-3 py-1 rounded text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${stateColors[currentState]}`}>
                              {currentState}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {availableStates.map((state) => (
                              <DropdownMenuItem
                                key={state}
                                onClick={() => handleStateChange(variation.id, state)}
                              >
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${stateColors[state]}`}>
                                  {state}
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Effect and Objective */}
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                          <p className="text-xs font-semibold text-green-900 dark:text-green-100 mb-1 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            EFECTO (Lo que validamos):
                          </p>
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            "{variation.effect}"
                          </p>
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            CAUSA (Por qué lo hacemos):
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {variation.objective}
                          </p>
                        </div>
                      </div>

                      {/* Copy */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">📝 Copy:</p>
                        <div className="space-y-1 pl-4 border-l-2 border-primary">
                          <p className="text-sm">
                            <span className="font-semibold">H1:</span> "{variation.headline}"
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">H2:</span> "{variation.subheadline}"
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">CTA:</span> <Button size="sm" variant="default" className="h-6 text-xs">{variation.cta}</Button>
                          </p>
                        </div>
                      </div>

                      {/* Visual Suggestion */}
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <p className="text-xs font-semibold mb-1">🎨 Sugerencia Visual:</p>
                        <p className="text-sm text-muted-foreground">{variation.visualSuggestion}</p>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2 bg-secondary/20 rounded">
                          <p className="text-xs text-muted-foreground mb-1">KPI</p>
                          <p className="text-sm font-semibold">{variation.kpi}</p>
                        </div>
                        <div className="text-center p-2 bg-secondary/20 rounded">
                          <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                            <Euro className="w-3 h-3" /> Coste
                          </p>
                          <p className="text-sm font-semibold">{variation.estimatedCost}</p>
                        </div>
                        <div className="text-center p-2 bg-secondary/20 rounded">
                          <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" /> TTV
                          </p>
                          <p className="text-sm font-semibold">{variation.ttv}</p>
                        </div>
                      </div>

                      {/* Expandable Reasoning */}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-between">
                            <span className="text-xs flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Ver razonamiento estratégico
                            </span>
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900">
                            <p className="text-xs font-semibold text-purple-900 dark:text-purple-100 mb-2">
                              💡 Razonamiento:
                            </p>
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                              {variation.reasoning}
                            </p>
                            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800 space-y-1">
                              <p className="text-xs"><span className="font-semibold">Trigger:</span> {variation.emotionalTrigger}</p>
                              <p className="text-xs"><span className="font-semibold">Campo Buyer:</span> {variation.buyerField}</p>
                              <p className="text-xs"><span className="font-semibold">Oferta:</span> {variation.offer}</p>
                              <p className="text-xs"><span className="font-semibold">Owner:</span> {variation.owner}</p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleConnect(variation.channel)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Conectar {variation.channel}
                        </Button>
                        <Button variant="ghost" size="sm">
                          Duplicar
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>

          {/* Generate More Button */}
          {uniqueChannels.length > 0 && (
            <div className="pt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="w-full">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Generar 10 variaciones más
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {uniqueChannels.map(channel => (
                    <DropdownMenuItem
                      key={channel}
                      onClick={() => handleGenerateMore(channel)}
                    >
                      {channel}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="mt-6">
            <ContextualNotice 
              status="theoretical" 
              componentType="validation"
              confidenceScore={0}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
};