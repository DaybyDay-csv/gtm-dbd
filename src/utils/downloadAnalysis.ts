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

// Función para generar título impactante desde los datos del análisis
const generateImpactfulTitle = (state: AnalysisState, companyName: string, projectName: string): string => {
  try {
    // Extraer información clave del análisis
    const productUnderstanding = state.phases.phase1?.productUnderstanding;
    const positioning = state.phases.phase1?.positioningMap;
    
    // Extraer tipo de producto/servicio
    let productType = projectName;
    if (productUnderstanding?.category) {
      productType = productUnderstanding.category;
    } else if (projectName.toLowerCase().includes('máster') || projectName.toLowerCase().includes('master')) {
      productType = 'Máster';
    } else if (projectName.toLowerCase().includes('curso')) {
      productType = 'Curso';
    } else if (projectName.toLowerCase().includes('programa')) {
      productType = 'Programa';
    }
    
    // Extraer nicho de mercado
    let niche = '';
    if (positioning?.marketSegment) {
      niche = positioning.marketSegment;
    } else if (productUnderstanding?.targetMarket) {
      niche = productUnderstanding.targetMarket;
    } else if (projectName.toLowerCase().includes('rrhh') || projectName.toLowerCase().includes('recursos humanos')) {
      niche = 'Recursos Humanos';
    } else if (projectName.toLowerCase().includes('marketing')) {
      niche = 'Marketing';
    } else if (projectName.toLowerCase().includes('dirección')) {
      niche = 'Dirección y Gestión';
    }
    
    // Extraer oportunidad clave
    let opportunity = '';
    if (positioning?.opportunityGap) {
      opportunity = positioning.opportunityGap.split('.')[0]; // Primera frase
    } else if (state.clientReadiness?.recommendation) {
      opportunity = 'Estrategia de Crecimiento';
    } else {
      opportunity = 'Transformación Digital';
    }
    
    // Construir título ejecutivo
    if (niche && opportunity) {
      return `${companyName}: ${productType} en ${niche} - ${opportunity}`;
    } else if (niche) {
      return `${companyName}: ${productType} en ${niche} - Análisis Go-to-Market`;
    } else {
      return `${companyName}: ${projectName} - Estrategia Go-to-Market Completa`;
    }
  } catch (error) {
    console.error('Error generating title:', error);
    return `${companyName}: ${projectName} - Análisis Go-to-Market Completo`;
  }
};

const createCoverPageHTML = (projectName: string, companyName: string, date: string, impactfulTitle: string): string => {
  return `
    <div class="pdf-cover-page" style="
      position: relative;
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
      <!-- Barra superior -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 8px;
        background: linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.9) 100%);
      "></div>
      
      <!-- Barra lateral izquierda -->
      <div style="
        position: absolute;
        top: 8px;
        left: 0;
        bottom: 8px;
        width: 4px;
        background: linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.8) 100%);
      "></div>
      
      <!-- Barra lateral derecha -->
      <div style="
        position: absolute;
        top: 8px;
        right: 0;
        bottom: 8px;
        width: 4px;
        background: linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.8) 100%);
      "></div>
      
      <!-- Barra inferior -->
      <div style="
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 8px;
        background: linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.9) 100%);
      "></div>
      
      <div style="max-width: 850px; width: 100%; padding: 2rem;">
        <!-- Título Impactante Principal -->
        <h1 style="
          font-size: 2.75rem;
          font-weight: 800;
          color: white;
          margin-bottom: 2.5rem;
          line-height: 1.3;
          text-shadow: 0 2px 20px rgba(0,0,0,0.2);
          padding: 0 1rem;
        ">
          ${impactfulTitle}
        </h1>
        
        <!-- Branding y empresa -->
        <div style="margin-bottom: 2rem;">
          <div style="
            font-size: 1.25rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.75rem;
            letter-spacing: 0.1em;
          ">
            AI GTM Factory by DaybyDay
          </div>
          <div style="
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.85);
            font-style: italic;
          ">
            for ${companyName}
          </div>
        </div>
        
        <!-- Separador visual -->
        <div style="
          width: 200px;
          height: 2px;
          background: rgba(255, 255, 255, 0.5);
          margin: 2rem auto;
        "></div>
        
        <!-- Info del proyecto -->
        <div style="
          font-size: 1.125rem;
          color: white;
          opacity: 0.9;
          padding: 1.25rem 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          backdrop-filter: blur(10px);
          margin: 2rem auto;
          max-width: 600px;
        ">
          ${projectName}
        </div>
        
        <!-- Footer con fecha -->
        <div style="margin-top: 3rem;">
          <div style="
            font-size: 0.95rem;
            color: white;
            opacity: 0.75;
          ">
            Documento Ejecutivo • ${date}
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
      mode: ['css', 'legacy'],
      before: '.pdf-section-divider',
      after: ['.pdf-cover-page'],
      avoid: ['.buyer-persona', '.product-nucleus', '.disc-translator', '.card', '.product-understanding', '.positioning-map', '.offer-factory', '.channel-strategy', '.validation-map', '.client-readiness', 'section', 'table', 'h1', 'h2', 'h3', 'h4']
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
