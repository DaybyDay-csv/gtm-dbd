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

// Function to create professional cover page HTML (without absolute positioning)
const createCoverPageHTML = (
  projectName: string,
  companyName: string,
  date: string,
  impactfulTitle: string
): string => {
  return `
    <div class="pdf-cover-page" style="
      page-break-after: always;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 60px 80px;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
      border-top: 8px solid #ef4444;
      border-bottom: 8px solid #b91c1c;
      border-left: 6px solid #ef4444;
      border-right: 6px solid #ef4444;
      box-sizing: border-box;
    ">
      <div style="max-width: 900px; width: 100%;">
        <div style="
          font-size: 16px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #ef4444;
          margin-bottom: 30px;
          font-weight: 600;
        ">
          AI GTM Factory by DaybyDay
        </div>
        
        <h1 style="
          font-size: 42px;
          font-weight: 700;
          line-height: 1.2;
          margin: 0 0 40px 0;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${impactfulTitle}
        </h1>
        
        <div style="
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid #ef4444;
          border-radius: 12px;
          padding: 24px 32px;
          margin: 40px auto;
          display: inline-block;
          max-width: 600px;
        ">
          <div style="
            font-size: 14px;
            color: #ef4444;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 8px;
            font-weight: 600;
          ">
            Proyecto
          </div>
          <div style="
            font-size: 28px;
            font-weight: 700;
            color: white;
          ">
            ${projectName}
          </div>
        </div>
        
        <div style="
          font-size: 16px;
          color: #a3a3a3;
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.1);
        ">
          <div style="margin-bottom: 8px;"><strong style="color: white;">Empresa:</strong> ${companyName}</div>
          <div><strong style="color: white;">Fecha:</strong> ${date}</div>
        </div>
        
        <div style="
          font-size: 13px;
          color: #737373;
          margin-top: 60px;
          font-style: italic;
        ">
          Análisis Go-to-Market Completo
        </div>
      </div>
    </div>
  `;
};

// Function to create section divider HTML (without absolute positioning for phase number)
const createSectionDividerHTML = (phaseNumber: number, phaseName: string): string => {
  return `
    <div class="pdf-section-divider" style="
      page-break-before: always;
      page-break-after: avoid;
      padding: 60px 40px;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
      border-left: 6px solid #ef4444;
      margin: 0;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    ">
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 40px;
      ">
        <div style="flex: 1;">
          <div style="
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #ef4444;
            margin-bottom: 16px;
            font-weight: 600;
          ">
            Fase ${phaseNumber}
          </div>
          
          <h2 style="
            font-size: 36px;
            font-weight: 700;
            color: white;
            margin: 0;
            line-height: 1.2;
          ">
            ${phaseName}
          </h2>
          
          <div style="
            height: 3px;
            width: 100px;
            background: linear-gradient(90deg, #ef4444 0%, transparent 100%);
            margin-top: 24px;
          "></div>
        </div>
        
        <div style="
          font-size: 120px;
          font-weight: 900;
          color: rgba(239, 68, 68, 0.2);
          line-height: 1;
          flex-shrink: 0;
        ">
          ${phaseNumber}
        </div>
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

  // Generate impactful title from analysis data
  const impactfulTitle = generateImpactfulTitle(state, companyName, projectName);

  // Prepare content with cover page, dividers, and PDF optimizations
  const preparedElement = prepareContentForPDF(element, projectName, companyName, impactfulTitle);
  
  // Wait for React renders to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  // Configure html2pdf options for high-quality executive document
  const dateForFilename = new Date().toISOString().split('T')[0];
  const options = {
    margin: [15, 12, 15, 12] as [number, number, number, number],
    filename: `${sanitizedCompany}_Analisis_GTM_Completo_${dateForFilename}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.95 },
    html2canvas: { 
      scale: 3, // Higher quality
      useCORS: true,
      letterRendering: true,
      logging: false,
      windowWidth: 1200, // Wider for better capture
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'mm' as const, 
      format: 'a4' as const, 
      orientation: 'portrait' as const,
      compress: true,
      precision: 16
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: ['.pdf-section-divider', '.page-break-before'],
      after: ['.pdf-cover-page', '.page-break-after'],
      avoid: [
        '.buyer-persona', '.product-nucleus', '.disc-translator', 
        '.positioning-map', '.validation-map', '.channel-strategy',
        'section', '.card', 'table', '.recharts-wrapper',
        'h1', 'h2', 'h3', 'h4'
      ]
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
