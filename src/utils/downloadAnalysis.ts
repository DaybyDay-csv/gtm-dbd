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

const createCoverPageHTML = (projectName: string, companyName: string, date: string): string => {
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
        <div style="margin-bottom: 3rem;">
          <div style="
            font-size: 2rem;
            font-weight: 700;
            color: white;
            margin-bottom: 0.5rem;
            letter-spacing: 0.15em;
            text-transform: uppercase;
          ">
            AI GTM Factory
          </div>
          <div style="
            font-size: 0.875rem;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.8);
            letter-spacing: 0.1em;
          ">
            by DaybyDay
          </div>
        </div>
        
        <h1 style="
          font-size: 3.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 2rem;
          line-height: 1.2;
        ">
          Análisis Go-to-Market<br/>Completo
        </h1>
        
        <div style="margin: 2rem 0;">
          <div style="
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.7);
            font-style: italic;
            margin-bottom: 0.5rem;
          ">
            for
          </div>
          <div style="
            font-size: 2rem;
            font-weight: 600;
            color: white;
            letter-spacing: 0.05em;
          ">
            ${companyName}
          </div>
        </div>
        
        <div style="
          font-size: 1.5rem;
          color: white;
          opacity: 0.95;
          padding: 1.5rem 2rem;
          border-top: 2px solid rgba(255, 255, 255, 0.3);
          border-bottom: 2px solid rgba(255, 255, 255, 0.3);
          margin: 2rem auto;
          max-width: 80%;
        ">
          ${projectName}
        </div>
        
        <div style="margin-top: 3rem;">
          <div style="
            font-size: 1.125rem;
            color: white;
            opacity: 0.85;
            margin-bottom: 0.5rem;
          ">
            Documento Ejecutivo
          </div>
          
          <div style="
            font-size: 0.875rem;
            color: white;
            opacity: 0.7;
          ">
            Generado el ${date}
          </div>
        </div>
      </div>
    </div>
  `;
};

const createSectionDividerHTML = (phaseNumber: number, phaseName: string): string => {
  return `
    <div class="pdf-section-divider" style="
      page-break-before: always;
      page-break-after: avoid;
      padding: 4rem 2rem 2rem;
      margin-bottom: 2rem;
      background: linear-gradient(135deg, hsl(0 70% 50% / 0.08) 0%, hsl(0 70% 60% / 0.03) 100%);
      border-left: 6px solid hsl(0 70% 50%);
    ">
      <div style="max-width: 1000px; margin: 0 auto;">
        <div style="
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        ">
          <span style="
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: hsl(0 70% 50%);
            font-weight: 600;
          ">
            Fase
          </span>
          <span style="
            font-size: 3rem;
            font-weight: 700;
            color: hsl(0 70% 50%);
            line-height: 1;
          ">
            ${phaseNumber}
          </span>
        </div>
        
        <div style="
          height: 2px;
          background: linear-gradient(to right, hsl(0 70% 50%), hsl(0 70% 50% / 0.3), transparent);
          margin: 1rem 0;
        "></div>
        
        <h2 style="
          font-size: 2.5rem;
          font-weight: 700;
          color: hsl(0 0% 10%);
          margin: 0;
        ">
          ${phaseName}
        </h2>
      </div>
    </div>
  `;
};

const prepareContentForPDF = (element: HTMLElement, projectName: string, companyName: string): HTMLElement => {
  // Clone the element
  const clonedElement = element.cloneNode(true) as HTMLElement;
  
  // Create cover page
  const date = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const coverPageHTML = createCoverPageHTML(projectName, companyName, date);
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
  console.log('Phase sections found:', phaseSections.length);
  
  phaseSections.forEach((section, idx) => {
    const phaseKey = section.getAttribute('data-phase');
    console.log(`Section ${idx}: ${phaseKey}`);
    
    if (phaseKey && phaseNames[phaseKey]) {
      const phaseNumber = parseInt(phaseKey.replace('phase', ''));
      const dividerHTML = createSectionDividerHTML(phaseNumber, phaseNames[phaseKey]);
      const dividerDiv = document.createElement('div');
      dividerDiv.innerHTML = dividerHTML;
      
      section.parentNode?.insertBefore(dividerDiv.firstChild!, section);
    }
  });
  
  // Simplify responsive grids for PDF
  const grids = clonedElement.querySelectorAll('.grid');
  grids.forEach(grid => {
    // Remove responsive grid classes
    grid.classList.remove('grid', 'grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'gap-6', 'gap-8');
    // Add simple layout class
    grid.classList.add('pdf-simple-layout');
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

// Función para extraer el nombre de la empresa del análisis
const extractCompanyName = (state: AnalysisState, projectName: string): string => {
  // Intentar extraer desde el análisis de Client Readiness (reasoning)
  if (state.clientReadiness?.reasoning) {
    const reasoning = state.clientReadiness.reasoning;
    // Buscar patrones como "La Universidad X", "X es una institución", etc.
    const universityMatch = reasoning.match(/Universidad\s+([A-Z][^\s,\.]+(?:\s+(?:de|Francisco|Complutense|Politécnica|Nacional|Autónoma)\s+[A-Z][^\s,\.]+)*)/i);
    if (universityMatch) return universityMatch[0];
    
    const companyMatch = reasoning.match(/(?:Empresa|Compañía|Corporación)\s+([A-Z][^\s,\.]+(?:\s+[A-Z][^\s,\.]+)*)/i);
    if (companyMatch) return companyMatch[0];
  }
  
  // Intentar desde productUnderstanding
  if (state.phases.phase1?.productUnderstanding) {
    const content = JSON.stringify(state.phases.phase1.productUnderstanding);
    const universityMatch = content.match(/Universidad\s+([A-Z][^\s,\.\"]+(?:\s+(?:de|Francisco|Complutense|Politécnica|Nacional|Autónoma)\s+[A-Z][^\s,\.\"]+)*)/i);
    if (universityMatch) return universityMatch[0].replace(/"/g, '');
    
    const companyMatch = content.match(/(?:Empresa|Compañía)\s+([A-Z][^\s,\.\"]+(?:\s+[A-Z][^\s,\.\"]+)*)/);
    if (companyMatch) return companyMatch[0].replace(/"/g, '');
  }
  
  // Default: usar el nombre del proyecto
  return projectName;
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

  // Extract company name from analysis
  const companyName = extractCompanyName(state, projectName);
  const sanitizedCompany = companyName.replace(/[^a-zA-Z0-9]/g, '_');

  // Prepare content with cover page, dividers, and PDF optimizations
  const preparedElement = prepareContentForPDF(element, projectName, companyName);
  
  // Wait for React renders to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  // Configure html2pdf options for high-quality executive document
  const dateForFilename = new Date().toISOString().split('T')[0];
  const options = {
    margin: [20, 15, 20, 15] as [number, number, number, number],
    filename: `${sanitizedCompany}_Analisis_GTM_Completo_${dateForFilename}.pdf`,
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
      before: '.pdf-section-divider',
      after: ['.pdf-cover-page', '.pdf-section-divider'],
      avoid: ['.pdf-section', 'table', '.buyer-persona', '.product-nucleus', '.disc-translator', '.card', 'section', '.product-understanding', '.positioning-map', '.offer-factory', '.channel-strategy', '.validation-map']
    }
  };

  // Generate and download PDF with metadata
  const worker = html2pdf()
    .set(options)
    .from(preparedElement);
  
  // Add PDF metadata
  const pdf = await worker.toPdf().get('pdf');
  pdf.setProperties({
    title: `Análisis GTM Completo - ${companyName} - ${projectName}`,
    subject: 'Documento Ejecutivo Go-to-Market',
    author: 'AI GTM Factory by DaybyDay',
    keywords: `GTM, Marketing, Estrategia, Go-to-Market, Análisis de Mercado, Buyer Persona, DISC, Canales, ${companyName}`,
    creator: 'AI GTM Factory by DaybyDay',
    producer: 'AI GTM Factory v1.0'
  });
  
  await worker.save();
};
