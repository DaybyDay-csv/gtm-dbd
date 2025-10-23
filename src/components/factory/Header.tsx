import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface HeaderProps {
  onRunAnalysis: (projectName: string, url: string, competitors?: string, docs?: string) => void;
  isRunning: boolean;
}

export const Header = ({ onRunAnalysis, isRunning }: HeaderProps) => {
  const [projectName, setProjectName] = useState("");
  const [url, setUrl] = useState("");
  const [competitors, setCompetitors] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName && url) {
      onRunAnalysis(projectName, url, competitors);
    }
  };

  return (
    <header className="border-b dotted-border-b">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            AI Marketing Factory
          </h1>
          <p className="text-muted-foreground">
            Descubre el potencial de tu negocio con análisis AI completo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium mb-2">
              Nombre del proyecto
            </label>
            <Input
              id="project-name"
              type="text"
              placeholder="Ej: Mi Startup 2025"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isRunning}
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="url-input" className="block text-sm font-medium mb-2">
              URL de tu web
            </label>
            <Input
              id="url-input"
              type="url"
              placeholder="https://www.tuempresa.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isRunning}
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="competitors" className="block text-sm font-medium mb-2">
              Competidores (opcional)
            </label>
            <Input
              id="competitors"
              type="text"
              placeholder="Ej: competidor1.com, competidor2.com"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              disabled={isRunning}
              className="w-full"
            />
          </div>

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isRunning || !projectName || !url}
              className="gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isRunning ? "Ejecutando análisis..." : "Ejecutar análisis completo"}
            </Button>
          </div>
        </form>
      </div>
    </header>
  );
};
