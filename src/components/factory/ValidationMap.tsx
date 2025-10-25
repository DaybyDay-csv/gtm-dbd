import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

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
