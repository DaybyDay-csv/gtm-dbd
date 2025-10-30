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
  const prefix = '#'.repeat(level);
  
  if (typeof data === 'string') {
    return data + '\n\n';
  }
  
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      text += formatDataToText(item, level);
    });
    return text;
  }
  
  if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      // Format key as header
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      if (typeof value === 'object' && value !== null) {
        text += `${prefix} ${formattedKey}\n\n`;
        text += formatDataToText(value, Math.min(level + 1, 3));
      } else {
        text += `${prefix} ${formattedKey}\n\n${value}\n\n`;
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
      const header = `# ${sectionName}\n\n`;
      const content = formatDataToText(data, 2);
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
