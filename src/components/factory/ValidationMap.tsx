import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ValidationMapProps {
  data?: {
    experiments?: Array<{
      hypothesis: string;
      channel: string;
      headline: string;
      cta: string;
      kpi: string;
      cost: string;
      ttv: string;
      state: string;
      owner: string;
    }>;
  };
  isRunning?: boolean;
}

export const ValidationMap = ({ data, isRunning }: ValidationMapProps) => {
  const experiments = data?.experiments || [];
  const hasData = experiments.length > 0;
  const { toast } = useToast();
  
  const [experimentStates, setExperimentStates] = useState<Record<number, string>>(
    experiments.reduce((acc, exp, idx) => ({ ...acc, [idx]: exp.state }), {})
  );

  const stateColors: Record<string, string> = {
    "Discover": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Test": "bg-blue-100 text-blue-800 border-blue-300",
    "Scale": "bg-green-100 text-green-800 border-green-300",
    "Paused": "bg-gray-100 text-gray-800 border-gray-300",
    "Completed": "bg-purple-100 text-purple-800 border-purple-300"
  };
  
  const availableStates = ["Discover", "Test", "Scale", "Paused", "Completed"];
  
  const handleStateChange = (index: number, newState: string) => {
    setExperimentStates(prev => ({ ...prev, [index]: newState }));
  };

  const platformOptions: Record<string, Array<{ name: string; type: string }>> = {
    "LinkedIn Ads": [{ name: "LinkedIn Ads", type: "ads" }],
    "LinkedIn": [{ name: "LinkedIn", type: "organic" }],
    "Facebook Ads": [{ name: "Meta Ads", type: "ads" }],
    "Facebook": [{ name: "Meta", type: "organic" }],
    "Instagram Ads": [{ name: "Meta Ads", type: "ads" }],
    "Instagram": [{ name: "Instagram", type: "organic" }],
    "TikTok Ads": [{ name: "TikTok Ads", type: "ads" }],
    "TikTok": [{ name: "TikTok", type: "organic" }],
    "Google Ads": [{ name: "Google Ads", type: "ads" }],
    "Email": [{ name: "Klaviyo", type: "email" }],
    "Email nurture": [{ name: "Klaviyo", type: "email" }],
    "Landing page": [{ name: "Google Ads", type: "ads" }, { name: "Meta Ads", type: "ads" }],
  };

  const handleConnect = (platform: string) => {
    toast({
      title: `Connect to ${platform}`,
      description: "Integration coming soon. This will allow you to launch campaigns directly.",
    });
  };

  return (
    <section className={`container mx-auto px-4 py-12 border-t dotted-border-t ${isRunning && !hasData ? 'charging' : ''} ${hasData ? 'magic-reveal' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Mapa de validación</h2>
          <p className="text-sm text-muted-foreground">
            Hipótesis de campaña listas para experimentar
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border dotted-border rounded-lg">
          <thead className="bg-secondary/30">
            <tr>
              <th className="text-left p-3 font-semibold">Hipótesis</th>
              <th className="text-left p-3 font-semibold">Canal</th>
              <th className="text-left p-3 font-semibold">Headline</th>
              <th className="text-left p-3 font-semibold">CTA</th>
              <th className="text-left p-3 font-semibold">KPI</th>
              <th className="text-left p-3 font-semibold">Coste</th>
              <th className="text-left p-3 font-semibold">TTV</th>
              <th className="text-left p-3 font-semibold">Estado</th>
              <th className="text-left p-3 font-semibold">Owner</th>
              <th className="text-left p-3 font-semibold">Conectar</th>
            </tr>
          </thead>
          <tbody>
            {experiments.map((exp, index) => (
              <tr key={index} className="border-t dotted-border-t hover:bg-secondary/20 transition-colors">
                <td className="p-3 font-medium">{exp.hypothesis}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                    {exp.channel}
                  </span>
                </td>
                <td className="p-3">{exp.headline}</td>
                <td className="p-3 text-muted-foreground">{exp.cta}</td>
                <td className="p-3">{exp.kpi}</td>
                <td className="p-3 font-medium">{exp.cost}</td>
                <td className="p-3 text-muted-foreground">{exp.ttv}</td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${stateColors[experimentStates[index] || exp.state]}`}>
                        {experimentStates[index] || exp.state}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-background border z-50">
                      {availableStates.map((state) => (
                        <DropdownMenuItem
                          key={state}
                          onClick={() => handleStateChange(index, state)}
                          className="cursor-pointer"
                        >
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${stateColors[state]}`}>
                            {state}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
                <td className="p-3 text-muted-foreground">{exp.owner}</td>
                <td className="p-3">
                  {platformOptions[exp.channel] ? (
                    platformOptions[exp.channel].length === 1 ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConnect(platformOptions[exp.channel][0].name)}
                        className="gap-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {platformOptions[exp.channel][0].name}
                      </Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-2">
                            <ExternalLink className="w-3 h-3" />
                            Connect
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background border z-50">
                          {platformOptions[exp.channel].map((platform) => (
                            <DropdownMenuItem
                              key={platform.name}
                              onClick={() => handleConnect(platform.name)}
                              className="cursor-pointer"
                            >
                              {platform.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  ) : (
                    <span className="text-xs text-muted-foreground">Manual</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-secondary/30 rounded-lg border dotted-border">
        <p className="text-sm text-muted-foreground">
          <strong>Nota:</strong> Esta tabla representa experimentos derivados de las fases anteriores.
          Cada hipótesis combina un campo del buyer persona, una oferta y un color DISC para crear 
          campañas personalizadas listas para probar en diferentes canales.
        </p>
      </div>
    </section>
  );
};
