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
  const { toast } = useToast();
  const experiments = data?.experiments || [];
  const hasData = experiments.length > 0;
  
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

  // Platform mapping based on channel
  const platformOptions: Record<string, Array<{ name: string; url: string }>> = {
    "Meta Ads": [{ name: "Meta Business Suite", url: "https://business.facebook.com/" }],
    "Facebook": [{ name: "Meta Business Suite", url: "https://business.facebook.com/" }],
    "Instagram": [
      { name: "Instagram Business", url: "https://business.instagram.com/" },
      { name: "Meta Business Suite", url: "https://business.facebook.com/" }
    ],
    "Google Ads": [{ name: "Google Ads", url: "https://ads.google.com/" }],
    "TikTok Ads": [{ name: "TikTok Ads Manager", url: "https://ads.tiktok.com/" }],
    "TikTok": [
      { name: "TikTok Ads Manager", url: "https://ads.tiktok.com/" },
      { name: "TikTok Business", url: "https://www.tiktok.com/business/" }
    ],
    "Email": [{ name: "Klaviyo", url: "https://www.klaviyo.com/" }],
    "LinkedIn": [{ name: "LinkedIn Campaign Manager", url: "https://business.linkedin.com/marketing-solutions/ads" }],
    "YouTube": [{ name: "Google Ads", url: "https://ads.google.com/" }],
    "Twitter": [{ name: "Twitter Ads", url: "https://ads.twitter.com/" }],
    "Pinterest": [{ name: "Pinterest Ads", url: "https://ads.pinterest.com/" }]
  };

  const handleConnect = (platform: string, url: string) => {
    toast({
      title: `Conectando con ${platform}`,
      description: "Abriendo plataforma en nueva ventana...",
    });
    window.open(url, '_blank');
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
                  {(() => {
                    const platforms = platformOptions[exp.channel] || platformOptions[exp.channel.split(' ')[0]] || [];
                    
                    if (platforms.length === 0) {
                      return (
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled
                          className="opacity-50"
                        >
                          No disponible
                        </Button>
                      );
                    }
                    
                    if (platforms.length === 1) {
                      return (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleConnect(platforms[0].name, platforms[0].url)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {platforms[0].name}
                        </Button>
                      );
                    }
                    
                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Conectar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background border z-50">
                          {platforms.map((platform) => (
                            <DropdownMenuItem
                              key={platform.name}
                              onClick={() => handleConnect(platform.name, platform.url)}
                              className="cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3 mr-2" />
                              {platform.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  })()}
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
