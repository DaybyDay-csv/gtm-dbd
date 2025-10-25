import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AnalysisState {
  projectId: string | null;
  currentPhase: number;
  isRunning: boolean;
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
  };
}

export const useAnalysisOrchestrator = () => {
  const { toast } = useToast();
  const [state, setState] = useState<AnalysisState>({
    projectId: null,
    currentPhase: 0,
    isRunning: false,
    phases: {
      phase1: null,
      phase2: null,
      phase3: null,
      phase4: null,
      phase5: null,
      phase6: null,
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
        phases: {
          phase1: null,
          phase2: null,
          phase3: null,
          phase4: null,
          phase5: null,
          phase6: null,
        },
      });

      // Get current user session (can be null for unauthenticated users)
      const { data: { session } } = await supabase.auth.getSession();

      // Always create a new project for each analysis
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({ 
          name: projectName, 
          url, 
          user_id: session?.user?.id || null,
          product_name: productDescription.split(' ').slice(0, 3).join(' ') // First 3 words as product name
        })
        .select()
        .single();

      if (projectError) throw projectError;
      const project = newProject;

      setState(prev => ({ ...prev, projectId: project.id }));

      // Phase 1: Market Analysis
      setState(prev => ({ ...prev, currentPhase: 1 }));
      const phase1Response = await supabase.functions.invoke(
        "phase-1-market-analysis",
        { body: { projectId: project.id, url, productDescription, competitors, docs, context, vision, mission, values } }
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
        { body: { projectId: project.id, brandInfo: phase1Data.summary, marketData: phase1Data } }
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
        { body: { projectId: project.id, persona: phase2Data, brandInfo: phase1Data } }
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
        { body: { projectId: project.id, offers: phase3Data.offers, persona: phase2Data } }
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

      // Phase 6: Validation Map
      setState(prev => ({ ...prev, currentPhase: 6 }));
      const { data: phase6Data, error: phase6Error } = await supabase.functions.invoke(
        "phase-6-validation-map",
        {
          body: {
            projectId: project.id,
            allPhaseData: {
              phase1: phase1Data,
              phase2: phase2Data,
              phase3: phase3Data,
              phase4: phase4Data,
              phase5: phase5Data,
            },
          },
        }
      );
      if (phase6Error) throw phase6Error;

      await supabase.from("phase_outputs").insert({
        project_id: project.id,
        phase: 6,
        payload: phase6Data,
      });

      // Store experiments in experiments table
      if (phase6Data.experiments) {
        const experiments = phase6Data.experiments.map((exp: any) => ({
          project_id: project.id,
          payload: exp,
          hypothesis: exp.hypothesis,
          channel: exp.channel,
          headline: exp.headline,
          cta: exp.cta,
          kpi: exp.kpi,
          cost: exp.cost,
          ttv: exp.ttv,
          state: exp.state,
          owner: exp.owner,
        }));

        await supabase.from("experiments").insert(experiments);
      }

      // Generate key insights summary
      const keyInsights = [
        phase2Data?.profile?.painPoints?.[0],
        phase3Data?.offers?.[0]?.offer,
        phase6Data?.experiments?.[0]?.hypothesis
      ].filter(Boolean).join(' • ');

      // Update project with key insights
      await supabase
        .from("projects")
        .update({ 
          key_insights: keyInsights
        })
        .eq("id", project.id);

      setState(prev => ({
        ...prev,
        phases: { ...prev.phases, phase6: phase6Data },
        currentPhase: 6,
        isRunning: false,
      }));

      toast({
        title: "¡Análisis completado!",
        description: "Todas las fases se han ejecutado con éxito",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Error en el análisis",
        description: error.message || "Ha ocurrido un error durante el análisis",
        variant: "destructive",
      });
      setState(prev => ({ ...prev, isRunning: false }));
    }
  };

  return { state, runAnalysis };
};
