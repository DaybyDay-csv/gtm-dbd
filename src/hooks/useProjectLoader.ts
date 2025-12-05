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
      const sessionToken = await getOrCreateSessionToken();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Build filter based on authentication status
      let query = supabase
        .from("projects")
        .select("*")
        .eq("id", id);
      
      if (user) {
        // Authenticated: check user_id or session token (for unclaimed projects)
        query = query.or(`user_id.eq.${user.id},session_token.eq.${sessionToken}`);
      } else {
        // Unauthenticated: only allow access via session token
        query = query.eq("session_token", sessionToken);
      }
      
      const { data: project, error: projectError } = await query.single();

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
