import { AnalysisState } from "@/hooks/useAnalysisOrchestrator";

export const downloadAnalysisAsJSON = (state: AnalysisState, projectName: string) => {
  const analysisData = {
    projectName,
    projectId: state.projectId,
    completedDate: new Date().toISOString(),
    clientReadiness: state.clientReadiness,
    budget: {
      level: state.budgetLevel,
      amount: state.budgetAmount,
    },
    phases: {
      phase1_marketAnalysis: state.phases.phase1,
      phase2_buyerPersona: state.phases.phase2,
      phase3_valueEquation: state.phases.phase3,
      phase4_discTranslator: state.phases.phase4,
      phase5_emotionalTriggers: state.phases.phase5,
      phase6_channelStrategy: state.phases.phase6,
      phase7_validationMap: state.phases.phase7,
    },
  };

  const blob = new Blob([JSON.stringify(analysisData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projectName.replace(/\s+/g, "-")}-analysis.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadAnalysisAsPDF = async (
  state: AnalysisState,
  projectName: string
): Promise<void> => {
  // Clone the analysis content for printing
  const element = document.getElementById('analysis-content');
  if (!element) {
    throw new Error('Elemento de análisis no encontrado');
  }

  // Create a new window optimized for PDF printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('No se pudo abrir ventana de impresión');
  }

  // Get computed styles from the main document
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');

  // Clone the content
  const clonedContent = element.cloneNode(true) as HTMLElement;

  // Create the print document
  const printDocument = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${projectName} - Análisis Completo GTM</title>
        <style>
          ${styles}
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            margin: 0;
            padding: 20px;
            background: white;
          }
          
          /* Hide elements not suitable for print */
          button, .no-print {
            display: none !important;
          }
          
          /* Optimize for printing */
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Ensure proper page breaks */
          .section {
            page-break-inside: avoid;
          }
          
          /* Add title page */
          .pdf-title-page {
            text-align: center;
            padding: 100px 20px;
            page-break-after: always;
          }
          
          .pdf-title-page h1 {
            font-size: 48px;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .pdf-title-page .subtitle {
            font-size: 24px;
            color: #64748b;
            margin-bottom: 40px;
          }
          
          .pdf-title-page .date {
            font-size: 16px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="pdf-title-page">
          <h1>${projectName}</h1>
          <div class="subtitle">Análisis Estratégico de Marketing y GTM</div>
          <div class="date">Generado el ${new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
        </div>
        ${clonedContent.innerHTML}
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printDocument);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
};
