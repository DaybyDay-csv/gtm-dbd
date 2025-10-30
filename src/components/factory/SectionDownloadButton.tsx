import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface SectionDownloadButtonProps {
  sectionName: string;
  data: any;
}

export const SectionDownloadButton = ({
  sectionName,
  data,
}: SectionDownloadButtonProps) => {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadJSON = () => {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sectionName.toLowerCase().replace(/\s+/g, "-")}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga completada",
        description: `${sectionName} descargado en formato JSON`,
      });
    } catch (error) {
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar la sección",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      toast({
        title: "Generando PDF...",
        description: "Esto puede tomar unos segundos",
      });

      // Dynamically import html2pdf.js
      const html2pdf = (await import("html2pdf.js")).default;

      // Create a temporary container with the section content
      const tempDiv = document.createElement("div");
      tempDiv.style.padding = "40px";
      tempDiv.style.fontFamily = "Arial, sans-serif";
      tempDiv.innerHTML = `
        <div style="margin-bottom: 30px;">
          <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">${sectionName}</h1>
          <hr style="border: 1px solid #ddd; margin: 20px 0;">
        </div>
        <pre style="white-space: pre-wrap; font-family: Arial; font-size: 12px; line-height: 1.6;">
          ${JSON.stringify(data, null, 2)}
        </pre>
      `;

      const options = {
        margin: 20,
        filename: `${sectionName.toLowerCase().replace(/\s+/g, "-")}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      };

      await html2pdf().from(tempDiv).set(options).save();

      toast({
        title: "PDF descargado",
        description: `${sectionName} guardado en Descargas`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
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
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadJSON} className="gap-2">
          <FileJson className="h-4 w-4" />
          Descargar JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          Descargar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
