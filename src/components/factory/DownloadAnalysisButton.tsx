import { Download, FileJson, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnalysisState } from "@/hooks/useAnalysisOrchestrator";
import { downloadAnalysisAsJSON, downloadAnalysisAsPDF } from "@/utils/downloadAnalysis";
import { useToast } from "@/hooks/use-toast";

interface DownloadAnalysisButtonProps {
  state: AnalysisState;
  projectName: string;
}

export const DownloadAnalysisButton = ({
  state,
  projectName,
}: DownloadAnalysisButtonProps) => {
  const { toast } = useToast();

  const handleDownloadJSON = () => {
    try {
      downloadAnalysisAsJSON(state, projectName);
      toast({
        title: "Descarga completada",
        description: "El análisis se ha descargado en formato JSON",
      });
    } catch (error) {
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar el análisis",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadAnalysisAsPDF(state, projectName);
      toast({
        title: "PDF generado",
        description: "Usa 'Guardar como PDF' en el diálogo de impresión para descargar tu análisis completo",
      });
    } catch (error) {
      toast({
        title: "Error al generar PDF",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Descargar Análisis
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadJSON} className="gap-2">
          <FileJson className="h-4 w-4" />
          Descargar como JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          Descargar como PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
