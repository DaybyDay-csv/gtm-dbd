import { AnalysisState } from "@/hooks/useAnalysisOrchestrator";
import { supabase } from "@/integrations/supabase/client";

const phaseNames: Record<string, string> = {
  phase1: "Análisis de Mercado",
  phase2: "Buyer Persona",
  phase3: "Ecuación de Valor",
  phase4: "Traductor DISC",
  phase5: "Gatillos Emocionales",
  phase6: "Estrategia de Canales",
  phase7: "Mapa de Validación",
};

// Function to generate an impactful, executive title
const generateImpactfulTitle = (
  state: AnalysisState,
  companyName: string,
  projectName: string
): string => {
  // Extract product/service type with better fallbacks
  let productType = "Solución";
  if (state.phases.phase1?.productUnderstanding) {
    const pu = state.phases.phase1.productUnderstanding;
    productType = pu.productName || pu.category || pu.type || pu.description?.split(' ').slice(0, 3).join(' ') || productType;
  }
  
  // Extract niche/market with context
  let niche = "Mercado Especializado";
  if (state.phases.phase2?.positioningMap) {
    const pm = state.phases.phase2.positioningMap;
    niche = pm.targetNiche || pm.market || pm.segment || niche;
  }
  
  // Extract key opportunity/differentiator
  let opportunity = "Oportunidad Estratégica";
  if (state.phases.phase3?.clientReadiness?.reasoning) {
    const reasoning = state.phases.phase3.clientReadiness.reasoning;
    const firstSentence = reasoning.split(/[.!?]/)[0].trim();
    if (firstSentence.length > 10 && firstSentence.length < 80) {
      opportunity = firstSentence;
    }
  } else if (state.phases.phase2?.positioningMap?.differentiation) {
    opportunity = state.phases.phase2.positioningMap.differentiation.split(/[.!?]/)[0].trim();
  }

  // Create an impactful executive title
  return `${companyName}: ${productType} en ${niche} - ${opportunity}`;
};

// Function to create professional cover page HTML optimized for html2pdf
const createCoverPageHTML = (
  projectName: string,
  companyName: string,
  date: string,
  impactfulTitle: string
): string => {
  return `
    <div class="pdf-cover-page" style="
      page-break-after: always;
      min-height: 297mm;
      width: 210mm;
      padding: 80px 60px;
      background-color: #1a1a1a;
      color: white;
      border-top: 8px solid #ef4444;
      border-bottom: 8px solid #b91c1c;
      border-left: 6px solid #ef4444;
      border-right: 6px solid #ef4444;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    ">
      <div style="max-width: 80%; width: 100%;">
        <div style="
          font-size: 14px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #ef4444;
          margin-bottom: 40px;
          font-weight: 600;
        ">
          AI GTM FACTORY BY DAYBYDAY
        </div>
        
        <h1 style="
          font-size: 36px;
          font-weight: 700;
          line-height: 1.3;
          margin: 0 0 50px 0;
          color: white;
        ">
          ${impactfulTitle}
        </h1>
        
        <div style="
          background-color: rgba(239, 68, 68, 0.15);
          border: 2px solid #ef4444;
          border-radius: 8px;
          padding: 30px;
          margin: 50px auto;
          max-width: 70%;
        ">
          <div style="
            font-size: 12px;
            color: #ef4444;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 12px;
            font-weight: 600;
          ">
            PROYECTO
          </div>
          <div style="
            font-size: 24px;
            font-weight: 700;
            color: white;
          ">
            ${projectName}
          </div>
        </div>
        
        <div style="
          font-size: 14px;
          color: #a3a3a3;
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid rgba(255,255,255,0.2);
        ">
          <div style="margin-bottom: 10px;">
            <strong style="color: white;">Empresa:</strong> ${companyName}
          </div>
          <div>
            <strong style="color: white;">Fecha:</strong> ${date}
          </div>
        </div>
        
        <div style="
          margin-top: 40px;
          font-size: 12px;
          color: #737373;
          font-style: italic;
        ">
          Análisis Go-to-Market Completo
        </div>
      </div>
    </div>
  `;
};

// Function to create section divider HTML optimized for html2pdf
const createSectionDividerHTML = (phaseNumber: number, phaseName: string): string => {
  return `
    <div class="pdf-section-divider" style="
      page-break-before: always;
      page-break-after: avoid;
      min-height: 200px;
      width: 100%;
      padding: 80px 60px;
      background-color: #1a1a1a;
      border-left: 6px solid #ef4444;
      color: white;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
    ">
      <div style="max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: #ef4444;
          margin-bottom: 20px;
          font-weight: 600;
        ">
          FASE ${phaseNumber}
        </div>
        
        <h2 style="
          font-size: 42px;
          font-weight: 700;
          color: white;
          margin: 0 0 30px 0;
          line-height: 1.2;
        ">
          ${phaseName}
        </h2>
        
        <div style="
          height: 4px;
          width: 120px;
          background-color: #ef4444;
        "></div>
      </div>
    </div>
  `;
};

const prepareContentForPDF = (element: HTMLElement, projectName: string, companyName: string, impactfulTitle: string): HTMLElement => {
  // Clone the element
  const clonedElement = element.cloneNode(true) as HTMLElement;
  
  // Create cover page
  const date = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const coverPageHTML = createCoverPageHTML(projectName, companyName, date, impactfulTitle);
  const coverDiv = document.createElement('div');
  coverDiv.innerHTML = coverPageHTML;
  
  console.log('✅ Cover page created');
  
  // Insert at beginning
  if (clonedElement.firstChild) {
    clonedElement.insertBefore(coverDiv.firstChild!, clonedElement.firstChild);
    console.log('✅ Cover page inserted at beginning');
  }
  
  // Remove interactive elements
  const buttons = clonedElement.querySelectorAll('button');
  buttons.forEach(btn => btn.remove());
  
  const tooltips = clonedElement.querySelectorAll('[role="tooltip"]');
  tooltips.forEach(tooltip => tooltip.remove());
  
  const noPdfElements = clonedElement.querySelectorAll('.no-pdf');
  noPdfElements.forEach(el => el.remove());
  
  // Add section dividers before phase sections
  const phaseSections = clonedElement.querySelectorAll('[data-phase]');
  console.log(`📑 Phase sections found: ${phaseSections.length}`);
  
  phaseSections.forEach((section, idx) => {
    const phaseKey = section.getAttribute('data-phase');
    console.log(`  Section ${idx}: ${phaseKey}`);
    
    if (phaseKey && phaseNames[phaseKey]) {
      const phaseNumber = parseInt(phaseKey.replace('phase', ''));
      const dividerHTML = createSectionDividerHTML(phaseNumber, phaseNames[phaseKey]);
      const dividerDiv = document.createElement('div');
      dividerDiv.innerHTML = dividerHTML;
      
      section.parentNode?.insertBefore(dividerDiv.firstChild!, section);
      console.log(`  ✅ Divider inserted for ${phaseKey}`);
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

  // Generate impactful title from analysis data
  const impactfulTitle = generateImpactfulTitle(state, companyName, projectName);

  // Prepare content with cover page, dividers, and PDF optimizations
  const preparedElement = prepareContentForPDF(element, projectName, companyName, impactfulTitle);
  
  // Wait for React renders to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  // Add element to DOM temporarily so html2canvas can capture it
  const tempContainer = document.createElement('div');
  tempContainer.id = 'pdf-temp-container';
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '210mm'; // A4 width
  tempContainer.style.backgroundColor = 'white';
  tempContainer.appendChild(preparedElement);
  document.body.appendChild(tempContainer);

  console.log('📄 Temporary DOM container created for PDF generation');

  // Wait for the DOM to fully render the new content
  await new Promise(resolve => setTimeout(resolve, 300));

  // Configure html2pdf options for high-quality executive document
  const dateForFilename = new Date().toISOString().split('T')[0];
  const options = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `${sanitizedCompany}_Analisis_GTM_Completo_${dateForFilename}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: true,
      windowWidth: 1400,
      backgroundColor: null,
      removeContainer: false // Don't remove container automatically
    },
    jsPDF: { 
      unit: 'mm' as const, 
      format: 'a4' as const, 
      orientation: 'portrait' as const,
      compress: true,
      precision: 16
    },
    pagebreak: { 
      mode: ['css', 'legacy'],
      before: ['.pdf-section-divider'],
      after: ['.pdf-cover-page'],
      avoid: ['h1', 'h2', 'h3', '.card', 'table']
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

  // Clean up temporary DOM container
  console.log('🧹 Cleaning up temporary DOM container');
  document.body.removeChild(tempContainer);
};
