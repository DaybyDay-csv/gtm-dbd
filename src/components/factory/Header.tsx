import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  const optionalDocs = [
    "Visión",
    "Misión",
    "Valores",
    "Vision Board",
    "Go-to-market"
  ];

  return (
    <header className="border-b dotted-border-b">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            AI Marketing Factory
          </h1>
          <p className="text-muted-foreground">
            Descubre el potencial de tu negocio introduciendo tu web
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <label htmlFor="url-input" className="block text-sm font-medium mb-2">
            URL de tu web
          </label>
          <Input
            id="url-input"
            type="url"
            placeholder="https://www.tuempresa.com"
            disabled
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2 italic">
            (Esta versión es una maqueta: aquí el cliente introducirá su página web.)
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Documentos opcionales:</span>
            {optionalDocs.map((doc) => (
              <Badge key={doc} variant="outline" className="cursor-pointer hover:bg-secondary transition-colors">
                {doc}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
