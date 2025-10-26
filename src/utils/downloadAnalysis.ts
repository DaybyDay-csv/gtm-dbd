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
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${projectName} - Análisis Completo</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
          }
          h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
          }
          h2 {
            color: #1e40af;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          h3 {
            color: #1e3a8a;
            margin-top: 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .metric {
            background: #f3f4f6;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
          }
          .persona, .offer, .variant {
            background: #f9fafb;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #2563eb;
          }
          pre {
            background: #1f2937;
            color: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <h1>Análisis Completo: ${projectName}</h1>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Project ID:</strong> ${state.projectId}</p>

        ${
          state.clientReadiness
            ? `
        <div class="section">
          <h2>Client Readiness</h2>
          <div class="metric">
            <strong>Score:</strong> ${state.clientReadiness.score}/10
          </div>
          <div class="metric">
            <strong>Maturity:</strong> ${state.clientReadiness.maturity}
          </div>
          <div class="metric">
            <strong>Recommendation:</strong> ${state.clientReadiness.recommendation}
          </div>
          ${
            state.clientReadiness.reasoning
              ? `<div class="metric"><strong>Reasoning:</strong><br>${state.clientReadiness.reasoning}</div>`
              : ""
          }
        </div>
        `
            : ""
        }

        ${
          state.phases.phase1
            ? `
        <div class="section">
          <h2>Phase 1: Market Analysis</h2>
          <pre>${JSON.stringify(state.phases.phase1, null, 2)}</pre>
        </div>
        `
            : ""
        }

        ${
          state.phases.phase2
            ? `
        <div class="section">
          <h2>Phase 2: Buyer Persona</h2>
          <pre>${JSON.stringify(state.phases.phase2, null, 2)}</pre>
        </div>
        `
            : ""
        }

        ${
          state.phases.phase3
            ? `
        <div class="section">
          <h2>Phase 3: Value Equation</h2>
          <pre>${JSON.stringify(state.phases.phase3, null, 2)}</pre>
        </div>
        `
            : ""
        }

        ${
          state.phases.phase4
            ? `
        <div class="section">
          <h2>Phase 4: DISC Translator</h2>
          <pre>${JSON.stringify(state.phases.phase4, null, 2)}</pre>
        </div>
        `
            : ""
        }

        ${
          state.phases.phase5
            ? `
        <div class="section">
          <h2>Phase 5: Emotional Triggers</h2>
          <pre>${JSON.stringify(state.phases.phase5, null, 2)}</pre>
        </div>
        `
            : ""
        }

        ${
          state.phases.phase6
            ? `
        <div class="section">
          <h2>Phase 6: Channel Strategy</h2>
          <pre>${JSON.stringify(state.phases.phase6, null, 2)}</pre>
        </div>
        `
            : ""
        }

        ${
          state.phases.phase7
            ? `
        <div class="section">
          <h2>Phase 7: Validation Map</h2>
          <pre>${JSON.stringify(state.phases.phase7, null, 2)}</pre>
        </div>
        `
            : ""
        }

        <div class="footer">
          <p>Análisis generado el ${new Date().toLocaleString()}</p>
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
