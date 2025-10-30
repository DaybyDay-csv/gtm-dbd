import { Download, FileJson, FileText, Loader2 } from "lucide-react";
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
import { useState } from "react";

interface DownloadAnalysisButtonProps {
  state: AnalysisState;
  projectName: string;
}

export const DownloadAnalysisButton = ({
  state,
  projectName,
}: DownloadAnalysisButtonProps) => {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const hasContent = state.currentPhase >= 1;
  const isDisabled = !hasContent || state.isRunning || isGeneratingPDF;

  const handleDownloadJSON = () => {
    if (!hasContent) {
      toast({
        title: "Sin contenido",
        description: "Completa al menos la fase 1 para descargar el análisis",
        variant: "destructive",
      });
      return;
    }
    
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
    if (!hasContent) {
      toast({
        title: "Sin contenido",
        description: "Completa al menos la fase 1 para descargar el análisis",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGeneratingPDF(true);
      toast({
        title: "Generando PDF...",
        description: "Esto puede tomar unos segundos",
      });
      
      await downloadAnalysisAsPDF(state, projectName);
      
      toast({
        title: "PDF descargado",
        description: "Tu análisis completo se ha guardado en Descargas",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error al generar PDF",
        description: "No se pudo generar el PDF. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          disabled={isDisabled}
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Descargar Análisis
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadJSON} className="gap-2" disabled={isDisabled}>
          <FileJson className="h-4 w-4" />
          Descargar como JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2" disabled={isDisabled}>
          <FileText className="h-4 w-4" />
          Descargar como PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
