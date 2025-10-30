import { useState } from "react";
import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnalysisState } from "@/hooks/useAnalysisOrchestrator";
import { downloadAnalysisAsJSON, capturePageAsPDF } from "@/utils/downloadAnalysis";
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
  const [isCapturing, setIsCapturing] = useState(false);

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

  const handleCapturePageAsPDF = async () => {
    setIsCapturing(true);
    try {
      await capturePageAsPDF(projectName);
      toast({
        title: "PDF descargado",
        description: "El análisis completo se ha capturado como PDF",
      });
    } catch (error) {
      toast({
        title: "Error al capturar",
        description: "No se pudo generar el PDF de la página",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
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
        <DropdownMenuItem onClick={handleDownloadJSON} className="gap-2" disabled={isCapturing}>
          <FileJson className="h-4 w-4" />
          Descargar como JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCapturePageAsPDF} className="gap-2" disabled={isCapturing}>
          {isCapturing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Capturar como PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
