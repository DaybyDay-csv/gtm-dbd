import { useEffect, useState } from "react";
import { Seo } from "@/components/Seo";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { claimUnclaimedProjects } from "@/utils/claimProjects";

interface Project {
  id: string;
  name: string;
  url: string | null;
  company_name: string | null;
  product_name: string | null;
  key_insights: string | null;
  created_at: string;
  updated_at: string;
}

interface EnrichedProject extends Project {
  phasesCompleted: number;
  lastPhase: number;
  summary: string;
  subtitle: string;
}

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<EnrichedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    loadProjects();
  }, [user, navigate]);

  const loadProjects = async () => {
    try {
      // First, claim any unclaimed projects from localStorage
      if (user?.id) {
        const claimed = await claimUnclaimedProjects(user.id);
        if (claimed > 0) {
          toast({
            title: "Proyectos recuperados",
            description: `Se han asociado ${claimed} proyecto(s) a tu cuenta`,
          });
        }
      }

      // Load all user projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user?.id)
        .order("updated_at", { ascending: false });

      if (projectsError) throw projectsError;
      
      if (!projectsData || projectsData.length === 0) {
        setProjects([]);
        return;
      }

      // Get all phase outputs for these projects
      const projectIds = projectsData.map((p) => p.id);
      const { data: phasesData, error: phasesError } = await supabase
        .from("phase_outputs")
        .select("project_id, phase, payload")
        .in("project_id", projectIds);

      if (phasesError) throw phasesError;

      // Map phases by project_id for O(1) access
      const phasesByProject = (phasesData || []).reduce((acc, phase) => {
        if (!acc[phase.project_id]) acc[phase.project_id] = [];
        acc[phase.project_id].push(phase);
        return acc;
      }, {} as Record<string, any[]>);

      // Enrich projects with phase data
      const enrichedProjects: EnrichedProject[] = projectsData.map((project) => {
        const phases = phasesByProject[project.id] || [];
        const phasesCompleted = new Set(phases.map((p) => p.phase)).size;
        const lastPhase = phases.length > 0 ? Math.max(...phases.map((p) => p.phase)) : 0;

        // Build subtitle from product_name or phase 1 data
        let subtitle = project.product_name || "";
        if (!subtitle && phases.length > 0) {
          const phase1 = phases.find((p) => p.phase === 1);
          if (phase1?.payload?.summary?.brandName) {
            subtitle = phase1.payload.summary.brandName;
          }
        }

        // Build summary from key_insights or derive from phases
        let summary = project.key_insights || "";
        if (!summary && phases.length > 0) {
          const summaryParts: string[] = [];
          
          const phase1 = phases.find((p) => p.phase === 1);
          if (phase1?.payload?.summary?.category) {
            summaryParts.push(`Mercado: ${phase1.payload.summary.category}`);
          }

          const phase2 = phases.find((p) => p.phase === 2);
          if (phase2?.payload?.profile?.painPoints?.[0]) {
            summaryParts.push(phase2.payload.profile.painPoints[0]);
          }

          summary = summaryParts.join(" • ");
        }

        return {
          ...project,
          phasesCompleted,
          lastPhase,
          summary,
          subtitle,
        };
      });

      setProjects(enrichedProjects);
    } catch (error: any) {
      toast({
        title: "Error cargando proyectos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/?project=${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
          <h1 className="text-4xl font-bold mb-2">Mis Proyectos</h1>
          <p className="text-muted-foreground">
            Accede a todos tus análisis anteriores
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                Aún no tienes proyectos guardados
              </p>
              <Button onClick={() => navigate("/")}>
                Crear primer análisis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex-1">
                      {project.company_name ? (
                        <div>
                          <div className="text-lg">{project.company_name}</div>
                          {project.subtitle && (
                            <div className="text-sm text-muted-foreground font-normal">
                              {project.subtitle}
                            </div>
                          )}
                        </div>
                      ) : (
                        project.name
                      )}
                    </div>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 ml-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {project.phasesCompleted} fase{project.phasesCompleted !== 1 ? 's' : ''}
                    </Badge>
                    {project.lastPhase === 6 ? (
                      <Badge variant="default" className="text-xs flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Completado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Fase {project.lastPhase}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-3">
                    {project.summary && (
                      <div className="mb-2 text-sm line-clamp-3">
                        {project.summary}
                      </div>
                    )}
                    <div className="text-xs">
                      Actualizado:{" "}
                      {new Date(project.updated_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleViewProject(project.id)}
                    className="w-full"
                  >
                    Ver análisis
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
