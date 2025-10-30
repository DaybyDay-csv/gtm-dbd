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
) => {
  // Helper to safely get nested values
  const phase1 = state.phases.phase1 as any;
  const phase2 = state.phases.phase2 as any;
  const phase3 = state.phases.phase3 as any;
  const phase4 = state.phases.phase4 as any;
  const phase5 = state.phases.phase5 as any;
  const phase6 = state.phases.phase6 as any;
  const phase7 = state.phases.phase7 as any;

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${projectName} - Análisis Completo</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 42px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          .header .subtitle {
            font-size: 18px;
            opacity: 0.95;
            font-weight: 300;
          }
          
          .meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            font-size: 14px;
          }
          
          .content {
            padding: 40px;
          }
          
          .section {
            margin-bottom: 50px;
            page-break-inside: avoid;
          }
          
          .section-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .section-header h2 {
            font-size: 28px;
            font-weight: 600;
          }
          
          .section-number {
            background: rgba(255,255,255,0.2);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
          }
          
          .card {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
          }
          
          .card h3 {
            color: #667eea;
            font-size: 20px;
            margin-bottom: 15px;
            font-weight: 600;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .metric-box {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          
          .metric-value {
            font-size: 36px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 8px;
          }
          
          .metric-label {
            font-size: 14px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .persona-card {
            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
            border: 2px solid #667eea;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
          }
          
          .persona-avatar {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: white;
          }
          
          .persona-name {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
          }
          
          .persona-details {
            color: #64748b;
            margin-bottom: 20px;
          }
          
          .thought-cloud {
            background: white;
            border: 2px dashed #667eea;
            border-radius: 20px;
            padding: 12px 20px;
            margin: 8px 0;
            font-size: 14px;
          }
          
          .offer-list {
            list-style: none;
          }
          
          .offer-item {
            background: white;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin-bottom: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          
          .disc-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          
          .disc-card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
          }
          
          .disc-card.d { border-color: #ef4444; }
          .disc-card.i { border-color: #f59e0b; }
          .disc-card.s { border-color: #10b981; }
          .disc-card.c { border-color: #3b82f6; }
          
          .disc-label {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .disc-card.d .disc-label { color: #ef4444; }
          .disc-card.i .disc-label { color: #f59e0b; }
          .disc-card.s .disc-label { color: #10b981; }
          .disc-card.c .disc-label { color: #3b82f6; }
          
          .channel-badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-right: 8px;
            margin-bottom: 8px;
          }
          
          .budget-box {
            background: linear-gradient(135deg, #10b98120 0%, #059669 20 100%);
            border: 2px solid #10b981;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
          }
          
          .budget-amount {
            font-size: 48px;
            font-weight: 700;
            color: #059669;
            margin-bottom: 10px;
          }
          
          .budget-level {
            font-size: 18px;
            color: #047857;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .experiment-card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
          }
          
          .experiment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .experiment-headline {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
          }
          
          .kpi-badge {
            background: #f1f5f9;
            color: #475569;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
          }
          
          .experiment-meta {
            display: flex;
            gap: 15px;
            font-size: 13px;
            color: #64748b;
            margin-top: 10px;
          }
          
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 2px solid #e2e8f0;
            color: #64748b;
          }
          
          .footer-logo {
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .container {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>${projectName}</h1>
            <div class="subtitle">Análisis Estratégico de Marketing y GTM</div>
            <div class="meta">
              <div>📅 ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              ${state.budgetAmount ? `<div>💰 Presupuesto: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(state.budgetAmount)}</div>` : ''}
            </div>
          </div>

          <div class="content">
            ${state.clientReadiness ? `
            <!-- Client Readiness -->
            <div class="section">
              <div class="section-header">
                <div class="section-number">📊</div>
                <h2>Client Readiness Assessment</h2>
              </div>
              <div class="grid">
                <div class="metric-box">
                  <div class="metric-value">${state.clientReadiness.score}/5</div>
                  <div class="metric-label">Readiness Score</div>
                </div>
                <div class="metric-box">
                  <div class="metric-value">${state.clientReadiness.maturity}</div>
                  <div class="metric-label">Madurez</div>
                </div>
              </div>
              <div class="card">
                <h3>Recomendación</h3>
                <p>${state.clientReadiness.recommendation}</p>
              </div>
              ${state.clientReadiness.reasoning ? `
              <div class="card">
                <h3>Análisis</h3>
                <p>${state.clientReadiness.reasoning}</p>
              </div>
              ` : ''}
            </div>
            ` : ''}

            ${phase1 ? `
            <!-- Phase 1: Market Analysis -->
            <div class="section">
              <div class="section-header">
                <div class="section-number">1</div>
                <h2>Análisis de Mercado</h2>
              </div>
              
              ${phase1.productNucleus ? `
              <div class="card">
                <h3>🎯 Producto Principal</h3>
                <div class="persona-name">${phase1.productNucleus.product || projectName}</div>
                ${phase1.productNucleus.value ? `<p style="font-style: italic; color: #64748b; margin-top: 10px;">${phase1.productNucleus.value}</p>` : ''}
                
                ${phase1.productNucleus.problemsSolved ? `
                <div style="margin-top: 20px;">
                  <strong style="color: #667eea;">Problemas que resuelve:</strong>
                  <ul style="margin-top: 10px; padding-left: 20px;">
                    ${phase1.productNucleus.problemsSolved.map((p: string) => `<li style="margin: 5px 0;">${p}</li>`).join('')}
                  </ul>
                </div>
                ` : ''}
                
                ${phase1.productNucleus.gaps?.length ? `
                <div style="margin-top: 15px;">
                  <strong style="color: #667eea;">Gaps que puede cubrir:</strong>
                  <ul style="margin-top: 10px; padding-left: 20px;">
                    ${phase1.productNucleus.gaps.map((g: string) => `<li style="margin: 5px 0;">${g}</li>`).join('')}
                  </ul>
                </div>
                ` : ''}
              </div>
              ` : ''}
              
              ${phase1.productUnderstanding ? `
              <div class="card">
                <h3>💡 Comprensión del Producto</h3>
                <p>${phase1.productUnderstanding}</p>
              </div>
              ` : ''}
            </div>
            ` : ''}

            ${phase2 ? `
            <!-- Phase 2: Buyer Persona -->
            <div class="section">
              <div class="section-header">
                <div class="section-number">2</div>
                <h2>Buyer Persona</h2>
              </div>
              
              ${phase2.avatar ? `
              <div class="persona-card">
                <div class="persona-avatar">👤</div>
                <div class="persona-name">${phase2.avatar.name}</div>
                <div class="persona-details">
                  ${phase2.avatar.age} años • ${phase2.avatar.city || ''} ${phase2.avatar.ses ? `• ${phase2.avatar.ses}` : ''}
                </div>
                ${phase2.intro ? `
                <div style="background: white; padding: 20px; border-radius: 12px; text-align: left; font-style: italic; margin-top: 20px;">
                  "${phase2.intro}"
                </div>
                ` : ''}
                
                ${phase2.clouds?.length ? `
                <div style="margin-top: 20px;">
                  ${phase2.clouds.map((cloud: string) => `<div class="thought-cloud">${cloud}</div>`).join('')}
                </div>
                ` : ''}
              </div>
              ` : ''}
              
              ${phase2.objections?.length ? `
              <div class="card">
                <h3>⚠️ Posibles Objeciones</h3>
                ${phase2.objections.map((obj: any) => `
                  <div style="background: #fee; border-left: 4px solid #ef4444; padding: 15px; margin: 10px 0; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: #ef4444;">${obj.objection}</strong>
                      <span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">${obj.likelihood}%</span>
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Fuente: ${obj.source}</div>
                  </div>
                `).join('')}
              </div>
              ` : ''}
            </div>
            ` : ''}

            ${state.budgetAmount || state.budgetLevel ? `
            <!-- Budget -->
            <div class="section">
              <div class="section-header">
                <div class="section-number">💰</div>
                <h2>Presupuesto</h2>
              </div>
              <div class="budget-box">
                <div class="budget-amount">${state.budgetAmount ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(state.budgetAmount) : 'N/A'}</div>
                <div class="budget-level">${state.budgetLevel || 'No especificado'}</div>
              </div>
            </div>
            ` : ''}

            ${phase3?.offers?.length ? `
            <!-- Phase 3: Value Equation -->
            <div class="section">
              <div class="section-header">
                <div class="section-number">3</div>
                <h2>Ecuación de Valor (Hormozi)</h2>
              </div>
              <div class="card">
                <h3>💎 Ofertas Principales</h3>
                <ul class="offer-list">
                  ${phase3.offers.map((o: any) => `
                    <li class="offer-item">
                      ${o.offer}
                      ${o.valueGauge?.value ? `<div style="margin-top: 8px;"><span style="background: #667eea20; color: #667eea; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">Valor: ${o.valueGauge.value}/100</span></div>` : ''}
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
            ` : ''}

            ${phase4?.discVariants ? `
            <!-- Phase 4: DISC Translator -->
            <div class="section">
              <div class="section-header">
                <div class="section-number">4</div>
                <h2>DISC Translator</h2>
              </div>
              <div class="disc-grid">
                ${phase4.discVariants.D ? `
                <div class="disc-card d">
                  <div class="disc-label">D - Dominance</div>
                  <p style="font-size: 14px; line-height: 1.6;">${phase4.discVariants.D.headline || phase4.discVariants.D.message || ''}</p>
                </div>
                ` : ''}
                ${phase4.discVariants.I ? `
                <div class="disc-card i">
                  <div class="disc-label">I - Influence</div>
                  <p style="font-size: 14px; line-height: 1.6;">${phase4.discVariants.I.headline || phase4.discVariants.I.message || ''}</p>
                </div>
                ` : ''}
                ${phase4.discVariants.S ? `
                <div class="disc-card s">
                  <div class="disc-label">S - Steadiness</div>
                  <p style="font-size: 14px; line-height: 1.6;">${phase4.discVariants.S.headline || phase4.discVariants.S.message || ''}</p>
                </div>
                ` : ''}
                ${phase4.discVariants.C ? `
                <div class="disc-card c">
                  <div class="disc-label">C - Conscientiousness</div>
                  <p style="font-size: 14px; line-height: 1.6;">${phase4.discVariants.C.headline || phase4.discVariants.C.message || ''}</p>
                </div>
                ` : ''}
              </div>
            </div>
            ` : ''}

            ${phase6?.channels?.length ? `
            <!-- Phase 6: Channel Strategy -->
            <div class="section">
              <div class="section-header">
                <div class="section-number">6</div>
                <h2>Estrategia de Canales</h2>
              </div>
              <div class="card">
                <h3>📱 Canales Recomendados</h3>
                <div>
                  ${phase6.channels.map((ch: any) => `<span class="channel-badge">${ch.name || ch}</span>`).join('')}
                </div>
              </div>
            </div>
            ` : ''}

            ${phase7?.variations?.length ? `
            <!-- Phase 7: Validation Map -->
            <div class="section">
              <div class="section-header">
                <div class="section-number">7</div>
                <h2>Mapa de Validación - Experimentos</h2>
              </div>
              ${phase7.variations.slice(0, 10).map((exp: any) => `
                <div class="experiment-card">
                  <div class="experiment-header">
                    <div class="experiment-headline">${exp.headline || exp.effect}</div>
                    <div class="kpi-badge">${exp.kpi || 'KPI'}</div>
                  </div>
                  <div style="color: #64748b; margin-bottom: 10px;">
                    <strong>CTA:</strong> ${exp.cta || 'N/A'}
                  </div>
                  ${exp.reasoning ? `<div style="font-size: 13px; color: #64748b;">${exp.reasoning}</div>` : ''}
                  <div class="experiment-meta">
                    ${exp.channel ? `<div>📱 ${exp.channel}</div>` : ''}
                    ${exp.cost ? `<div>💰 ${exp.cost}</div>` : ''}
                    ${exp.ttv ? `<div>⏱️ ${exp.ttv}</div>` : ''}
                    ${exp.state ? `<div>📊 ${exp.state}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-logo">AI GTM Factory</div>
            <div>Análisis generado el ${new Date().toLocaleString('es-ES')}</div>
            <div style="margin-top: 10px; font-size: 12px;">Built on evidence, not opinions.</div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Create a printable window
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};
