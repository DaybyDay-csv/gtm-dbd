import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface SectionDownloadButtonProps {
  sectionName: string;
  data: any;
}

const formatDataToText = (data: any, level: number = 1): string => {
  let text = '';
  
  if (typeof data === 'string') {
    return data + '\n\n';
  }
  
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      if (typeof item === 'object') {
        text += formatDataToText(item, level);
      } else {
        text += `• ${item}\n`;
      }
    });
    text += '\n';
    return text;
  }
  
  if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      // Format key as clean header
      const formattedKey = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .replace(/([A-Z])/g, ' $1')
        .trim();
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Section headers
        if (level === 1) {
          text += `\n${'='.repeat(60)}\n${formattedKey.toUpperCase()}\n${'='.repeat(60)}\n\n`;
        } else if (level === 2) {
          text += `\n${formattedKey}\n${'-'.repeat(formattedKey.length)}\n\n`;
        } else {
          text += `\n${formattedKey}:\n`;
        }
        text += formatDataToText(value, level + 1);
      } else if (Array.isArray(value)) {
        if (level === 1) {
          text += `\n${'='.repeat(60)}\n${formattedKey.toUpperCase()}\n${'='.repeat(60)}\n\n`;
        } else {
          text += `\n${formattedKey}:\n`;
        }
        text += formatDataToText(value, level + 1);
      } else {
        text += `${formattedKey}: ${value}\n\n`;
      }
    });
  }
  
  return text;
};

export const SectionDownloadButton = ({
  sectionName,
  data,
}: SectionDownloadButtonProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDownloadTXT = () => {
    try {
      const title = sectionName.toUpperCase();
      const titleBorder = '='.repeat(Math.max(60, title.length + 4));
      const header = `\n${titleBorder}\n  ${title}\n${titleBorder}\n\n`;
      const content = formatDataToText(data, 1);
      const fullContent = header + content;
      
      const blob = new Blob([fullContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sectionName.toLowerCase().replace(/\s+/g, "-")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga completada",
        description: `${sectionName} descargado en formato TXT`,
      });
    } catch (error) {
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar la sección",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover-scale"
          >
            <Download className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Loguéate para descargar</h4>
              <p className="text-sm text-muted-foreground">
                Descarga {sectionName} en formato TXT organizado
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate("/auth")} className="w-full">
                Crear Cuenta
              </Button>
              <Button onClick={() => navigate("/auth")} variant="outline" className="w-full">
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 hover-scale"
      onClick={handleDownloadTXT}
    >
      <FileText className="h-4 w-4" />
    </Button>
  );
};
