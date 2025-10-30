import { AnalysisState } from "@/hooks/useAnalysisOrchestrator";

const phaseNames: Record<string, string> = {
  phase1: "Análisis de Mercado",
  phase2: "Buyer Persona",
  phase3: "Ecuación de Valor",
  phase4: "Traductor DISC",
  phase5: "Gatillos Emocionales",
  phase6: "Estrategia de Canales",
  phase7: "Mapa de Validación",
};

const createCoverPageHTML = (projectName: string, date: string): string => {
  return `
    <div class="pdf-cover-page" style="
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, hsl(0 70% 50%) 0%, hsl(0 70% 60%) 100%);
      padding: 4rem 2rem;
      text-align: center;
      page-break-after: always;
    ">
      <div style="max-width: 800px; width: 100%;">
        <div style="
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          opacity: 0.9;
          margin-bottom: 2rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        ">
          AI GTM Factory
        </div>
        
        <h1 style="
          font-size: 3.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          line-height: 1.2;
        ">
          Análisis Go-to-Market Completo
        </h1>
        
        <div style="
          font-size: 2.5rem;
          font-weight: 600;
          color: white;
          opacity: 0.95;
          margin-bottom: 3rem;
          padding: 1rem 2rem;
          border-top: 2px solid rgba(255, 255, 255, 0.3);
          border-bottom: 2px solid rgba(255, 255, 255, 0.3);
        ">
          ${projectName}
        </div>
        
        <div style="
          font-size: 1.25rem;
          color: white;
          opacity: 0.85;
          margin-bottom: 1rem;
        ">
          Documento Ejecutivo
        </div>
        
        <div style="
          font-size: 1rem;
          color: white;
          opacity: 0.75;
        ">
          Generado el ${date}
        </div>
      </div>
    </div>
  `;
};

const createSectionDividerHTML = (phaseNumber: number, phaseName: string): string => {
  return `
    <div class="pdf-section-divider" style="
      page-break-before: always;
      padding: 3rem 2rem;
      margin-bottom: 2rem;
      background: linear-gradient(135deg, hsl(0 70% 50% / 0.1) 0%, hsl(0 70% 60% / 0.05) 100%);
      border-left: 4px solid hsl(0 70% 50%);
    ">
      <div style="
        font-size: 0.875rem;
        font-weight: 600;
        color: hsl(0 70% 50%);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 0.5rem;
      ">
        Fase ${phaseNumber}
      </div>
      <h2 style="
        font-size: 2rem;
        font-weight: 700;
        color: hsl(0 0% 15%);
        margin: 0;
      ">
        ${phaseName}
      </h2>
    </div>
  `;
};

const prepareContentForPDF = (element: HTMLElement, projectName: string): HTMLElement => {
  // Clone the element
  const clonedElement = element.cloneNode(true) as HTMLElement;
  
  // Create cover page
  const date = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const coverPageHTML = createCoverPageHTML(projectName, date);
  const coverDiv = document.createElement('div');
  coverDiv.innerHTML = coverPageHTML;
  
  // Insert at beginning
  clonedElement.insertBefore(coverDiv.firstChild!, clonedElement.firstChild);
  
  // Remove interactive elements
  const buttons = clonedElement.querySelectorAll('button');
  buttons.forEach(btn => btn.remove());
  
  const tooltips = clonedElement.querySelectorAll('[role="tooltip"]');
  tooltips.forEach(tooltip => tooltip.remove());
  
  const noPdfElements = clonedElement.querySelectorAll('.no-pdf');
  noPdfElements.forEach(el => el.remove());
  
  // Add section dividers before phase sections
  const phaseSections = clonedElement.querySelectorAll('[data-phase]');
  phaseSections.forEach((section) => {
    const phaseKey = section.getAttribute('data-phase');
    if (phaseKey && phaseNames[phaseKey]) {
      const phaseNumber = parseInt(phaseKey.replace('phase', ''));
      const dividerHTML = createSectionDividerHTML(phaseNumber, phaseNames[phaseKey]);
      const dividerDiv = document.createElement('div');
      dividerDiv.innerHTML = dividerHTML;
      
      section.parentNode?.insertBefore(dividerDiv.firstChild!, section);
    }
  });
  
  // Apply PDF-specific classes
  clonedElement.classList.add('pdf-content');
  
  return clonedElement;
};

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

  // Prepare content with cover page, dividers, and PDF optimizations
  const preparedElement = prepareContentForPDF(element, projectName);
  
  // Wait for React renders to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  // Configure html2pdf options for high-quality executive document
  const date = new Date().toISOString().split('T')[0];
  const options = {
    margin: [15, 15, 15, 15] as [number, number, number, number],
    filename: `${projectName || 'Análisis'}_Completo_GTM_${date}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 3,
      useCORS: true,
      logging: false,
      letterRendering: true,
      windowWidth: 1200,
      backgroundColor: '#ffffff',
    },
    jsPDF: { 
      unit: 'mm' as const, 
      format: 'a4' as const, 
      orientation: 'portrait' as const,
      compress: true,
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.pdf-page-break',
      after: '.pdf-section-divider',
      avoid: '.pdf-section'
    }
  };

  // Generate and download PDF with metadata
  const worker = html2pdf()
    .set(options)
    .from(preparedElement);
  
  // Add PDF metadata
  const pdf = await worker.toPdf().get('pdf');
  pdf.setProperties({
    title: `Análisis GTM Completo - ${projectName}`,
    subject: 'Documento Ejecutivo Go-to-Market',
    author: 'AI GTM Factory',
    keywords: 'GTM, Marketing, Estrategia, Análisis',
    creator: 'AI GTM Factory'
  });
  
  await worker.save();
};
