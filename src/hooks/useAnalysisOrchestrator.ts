import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveUnclaimedProject, getOrCreateSessionToken } from "@/utils/claimProjects";

export interface AnalysisState {
  projectId: string | null;
  currentPhase: number;
  isRunning: boolean;
  awaitingBudgetInput?: boolean;
  budgetLevel?: string;
  budgetAmount?: number;
  channelPreference?: string;
  clientReadiness?: {
    score: number;
    maturity: string;
    recommendation: string;
    reasoning: string;
  };
  phases: {
    phase1: any | null;
    phase2: any | null;
    phase3: any | null;
    phase4: any | null;
    phase5: any | null;
    phase6: any | null;
    phase7: any | null;
  };
}

export const useAnalysisOrchestrator = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [state, setState] = useState<AnalysisState>({
    projectId: null,
    currentPhase: 0,
    isRunning: false,
    awaitingBudgetInput: false,
    phases: {
      phase1: null,
      phase2: null,
      phase3: null,
      phase4: null,
      phase5: null,
      phase6: null,
      phase7: null,
    },
  });

  const runAnalysis = async (
    projectName: string,
    url: string,
    productDescription: string,
    competitors?: string,
    docs?: string,
    context?: string,
    vision?: string,
    mission?: string,
    values?: string
  ) => {
    try {
      // Reset state for fresh analysis
      setState({
        projectId: null,
        currentPhase: 0,
        isRunning: true,
        awaitingBudgetInput: false,
        phases: {
          phase1: null,
          phase2: null,
          phase3: null,
          phase4: null,
          phase5: null,
          phase6: null,
          phase7: null,
        },
      });

      // Get current user session (can be null for unauthenticated users)
      const { data: { session } } = await supabase.auth.getSession();

      // Get or create session token for unauthenticated access
      const sessionToken = !session?.user?.id ? getOrCreateSessionToken() : null;

      // Always create a new project for each analysis
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({ 
          name: projectName, 
          url, 
          user_id: session?.user?.id || null,
          session_token: sessionToken,
          product_name: productDescription.split(' ').slice(0, 3).join(' ') // First 3 words as product name
        })
        .select()
        .single();

      if (projectError) throw projectError;
      const project = newProject;

      // Save to localStorage if user is not logged in
      if (!session?.user?.id) {
        saveUnclaimedProject(project.id);
      }

      setState(prev => ({ ...prev, projectId: project.id }));

      // Phase 1: Market Analysis
      setState(prev => ({ ...prev, currentPhase: 1 }));
      const phase1Response = await supabase.functions.invoke(
        "phase-1-market-analysis",
        { body: { projectId: project.id, url, productDescription, competitors, docs, context, vision, mission, values, outputLanguage: language } }
      );
      
      if (phase1Response.error) {
        const errorMessage = phase1Response.error.message || 'Error desconocido';
        if (errorMessage.includes('402') || errorMessage.includes('Payment required') || errorMessage.includes('credits')) {
          throw new Error('No tienes suficientes créditos de Lovable AI. Ve a Settings → Workspace → Usage para añadir créditos.');
        }
        throw phase1Response.error;
      }
      
      const phase1Data = phase1Response.data;

      // Extract company name from phase 1 analysis
      const companyName = phase1Data?.summary?.brandName || phase1Data?.brandInfo?.name || projectName;
      
      // Update project with extracted info
      await supabase
        .from("projects")
        .update({ 
          company_name: companyName
        })
        .eq("id", project.id);

      await supabase.from("phase_outputs").insert({
        project_id: project.id,
        phase: 1,
        payload: phase1Data,
      });

      setState(prev => ({
        ...prev,
        clientReadiness: phase1Data.clientReadiness,
        phases: { ...prev.phases, phase1: phase1Data },
      }));

      // Phase 2: Buyer Persona
      setState(prev => ({ ...prev, currentPhase: 2 }));
      const { data: phase2Data, error: phase2Error } = await supabase.functions.invoke(
        "phase-2-buyer-persona",
        { body: { projectId: project.id, brandInfo: phase1Data.summary, marketData: phase1Data, outputLanguage: language } }
      );
      if (phase2Error) throw phase2Error;

      await supabase.from("phase_outputs").insert({
        project_id: project.id,
        phase: 2,
        payload: phase2Data,
      });

      setState(prev => ({
        ...prev,
        phases: { ...prev.phases, phase2: phase2Data },
      }));

      // Phase 3: Value Equation
      setState(prev => ({ ...prev, currentPhase: 3 }));
      const { data: phase3Data, error: phase3Error } = await supabase.functions.invoke(
        "phase-3-value-equation",
        { body: { projectId: project.id, persona: phase2Data, brandInfo: phase1Data, outputLanguage: language } }
      );
      if (phase3Error) throw phase3Error;

      await supabase.from("phase_outputs").insert({
        project_id: project.id,
        phase: 3,
        payload: phase3Data,
      });

      setState(prev => ({
        ...prev,
        phases: { ...prev.phases, phase3: phase3Data },
      }));

      // Phase 4: DISC Translator
      setState(prev => ({ ...prev, currentPhase: 4 }));
      const { data: phase4Data, error: phase4Error } = await supabase.functions.invoke(
        "phase-4-disc-translator",
        { body: { projectId: project.id, offers: phase3Data.offers, persona: phase2Data, outputLanguage: language } }
      );
      if (phase4Error) throw phase4Error;

      await supabase.from("phase_outputs").insert({
        project_id: project.id,
        phase: 4,
        payload: phase4Data,
      });

      setState(prev => ({
        ...prev,
        phases: { ...prev.phases, phase4: phase4Data },
      }));

      // Phase 5: Emotional Triggers
      setState(prev => ({ ...prev, currentPhase: 5 }));
      const { data: phase5Data, error: phase5Error } = await supabase.functions.invoke(
        "phase-5-emotional-triggers",
        {
          body: {
            projectId: project.id,
            persona: phase2Data,
            discData: phase4Data,
            valueData: phase3Data,
            outputLanguage: language,
          },
        }
      );
      if (phase5Error) throw phase5Error;

      await supabase.from("phase_outputs").insert({
        project_id: project.id,
        phase: 5,
        payload: phase5Data,
      });

      setState(prev => ({
        ...prev,
        phases: { ...prev.phases, phase5: phase5Data },
      }));

      // Pause for budget input - this will be handled by the UI
      // The UI will call continueToPhaseSix when budget is submitted
      setState(prev => ({ 
        ...prev, 
        currentPhase: 5,
        isRunning: false,
        awaitingBudgetInput: true 
      }));

      toast({
        title: "Fase 5 completada",
        description: "Define tu presupuesto para continuar con el análisis de canal",
      });

    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Error en el análisis",
        description: error.message || "Ha ocurrido un error durante el análisis",
        variant: "destructive",
      });
      setState(prev => ({ ...prev, isRunning: false, awaitingBudgetInput: false }));
    }
  };

  const continueToPhaseSix = async (budgetLevel: string, budgetAmount: number, channelPreference?: string) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isRunning: true, 
        awaitingBudgetInput: false,
        budgetLevel,
        budgetAmount,
        channelPreference
      }));

      if (!state.projectId) throw new Error("No project ID found");

      // Phase 6: Channel Strategy
      setState(prev => ({ ...prev, currentPhase: 6 }));
      const { data: phase6Data, error: phase6Error } = await supabase.functions.invoke(
        "phase-6-channel-strategy",
        {
          body: {
            projectId: state.projectId,
            allPhaseData: {
              phase1: state.phases.phase1,
              phase2: state.phases.phase2,
              phase3: state.phases.phase3,
              phase4: state.phases.phase4,
              phase5: state.phases.phase5,
            },
            budgetLevel,
            budgetAmount,
            channelPreference,
            outputLanguage: language,
          },
        }
      );
      if (phase6Error) throw phase6Error;

      await supabase.from("phase_outputs").insert({
        project_id: state.projectId,
        phase: 6,
        payload: phase6Data,
      });

      setState(prev => ({
        ...prev,
        phases: { ...prev.phases, phase6: phase6Data },
      }));

      // Phase 7: Creative Variations
      setState(prev => ({ ...prev, currentPhase: 7 }));
      const recommendedChannels = [
        phase6Data.recommendation?.primary,
        phase6Data.recommendation?.secondary,
        phase6Data.recommendation?.tertiary
      ].filter(Boolean);

      const { data: phase7Data, error: phase7Error } = await supabase.functions.invoke(
        "phase-7-creative-variations",
        {
          body: {
            projectId: state.projectId,
            allPhaseData: {
              phase1: state.phases.phase1,
              phase2: state.phases.phase2,
              phase3: state.phases.phase3,
              phase4: state.phases.phase4,
              phase5: state.phases.phase5,
              phase6: phase6Data,
            },
            recommendedChannels,
            generateFor: "all",
            outputLanguage: language,
          },
        }
      );
      if (phase7Error) throw phase7Error;

      await supabase.from("phase_outputs").insert({
        project_id: state.projectId,
        phase: 7,
        payload: phase7Data,
      });

      // Store variations in experiments table with new fields
      if (phase7Data.variations) {
        const experiments = phase7Data.variations.map((variation: any) => ({
          project_id: state.projectId,
          payload: variation,
          effect: variation.effect,
          objective: variation.objective,
          channel: variation.channel,
          headline: variation.headline,
          subheadline: variation.subheadline,
          cta: variation.cta,
          kpi: variation.kpi,
          cost: variation.estimatedCost,
          ttv: variation.ttv,
          state: variation.state,
          owner: variation.owner,
          disc_profile: variation.discProfile,
          emotional_trigger: variation.emotionalTrigger,
          buyer_field: variation.buyerField,
          offer: variation.offer,
          visual_suggestion: variation.visualSuggestion,
          reasoning: variation.reasoning,
        }));

        await supabase.from("experiments").insert(experiments);
      }

      // Generate key insights summary
      const keyInsights = [
        state.phases.phase2?.profile?.painPoints?.[0],
        state.phases.phase3?.offers?.[0]?.offer,
        phase6Data?.recommendation?.primary
      ].filter(Boolean).join(' • ');

      // Update project with key insights
      await supabase
        .from("projects")
        .update({ 
          key_insights: keyInsights
        })
        .eq("id", state.projectId);

      setState(prev => ({
        ...prev,
        phases: { ...prev.phases, phase7: phase7Data },
        currentPhase: 7,
        isRunning: false,
      }));

      toast({
        title: "¡Análisis completado!",
        description: "Todas las fases se han ejecutado con éxito",
      });
    } catch (error: any) {
      console.error("Phase 6-7 error:", error);
      toast({
        title: "Error en el análisis",
        description: error.message || "Ha ocurrido un error durante el análisis",
        variant: "destructive",
      });
      setState(prev => ({ ...prev, isRunning: false }));
    }
  };

  const loadMockData = () => {
    // Import mock data dynamically to avoid circular deps
    import("@/utils/mockData").then(({ mockAnalysisState }) => {
      setState(mockAnalysisState as AnalysisState);
      toast({
        title: "Datos mock cargados",
        description: "Vista de desarrollo lista con datos de ejemplo completos",
      });
    });
  };

  return { state, runAnalysis, continueToPhaseSix, loadMockData };
};
