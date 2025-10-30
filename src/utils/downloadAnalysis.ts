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
  // Dynamic import to avoid bundling issues
  const html2pdf = (await import('html2pdf.js')).default;

  const element = document.getElementById('analysis-content');
  if (!element) {
    throw new Error('Elemento de análisis no encontrado');
  }

  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement;
  
  // Remove interactive elements that shouldn't be in PDF
  const buttons = clonedElement.querySelectorAll('button');
  buttons.forEach(btn => btn.remove());

  // Configure html2pdf options
  const options = {
    margin: 10,
    filename: `${projectName || 'Análisis'}_GTM_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
    },
    jsPDF: { 
      unit: 'mm' as const, 
      format: 'a4' as const, 
      orientation: 'portrait' as const
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  // Generate and download PDF
  await html2pdf().set(options).from(clonedElement).save();
};
