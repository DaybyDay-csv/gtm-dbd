import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AnalysisState } from "./useAnalysisOrchestrator";
import { getOrCreateSessionToken } from "@/utils/claimProjects";

export const useProjectLoader = (projectId: string | null) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState<AnalysisState | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  const loadProject = async (id: string) => {
    setLoading(true);
    try {
      // Get session token for unauthenticated access
      const sessionToken = getOrCreateSessionToken();
      
      // Load project details - verify access via session token or user_id
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .or(`user_id.eq.${(await supabase.auth.getUser()).data.user?.id},and(user_id.is.null,session_token.eq.${sessionToken})`)
        .single();

      if (projectError) throw projectError;

      // Load all phase outputs
      const { data: phaseOutputs, error: phaseError } = await supabase
        .from("phase_outputs")
        .select("*")
        .eq("project_id", id)
        .order("phase", { ascending: true });

      if (phaseError) throw phaseError;

      // Organize phase data
      const phases: any = {
        phase1: null,
        phase2: null,
        phase3: null,
        phase4: null,
        phase5: null,
        phase6: null,
      };

      let clientReadiness;

      phaseOutputs?.forEach((output) => {
        const payload = output.payload as any;
        phases[`phase${output.phase}`] = payload;
        if (output.phase === 1 && payload?.clientReadiness) {
          clientReadiness = payload.clientReadiness;
        }
      });

      const loadedState: AnalysisState = {
        projectId: id,
        currentPhase: phaseOutputs?.length || 0,
        isRunning: false,
        clientReadiness,
        phases,
      };

      setProjectData(loadedState);
    } catch (error: any) {
      toast({
        title: "Error cargando proyecto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { projectData, loading };
};
