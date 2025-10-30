import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { FolderOpen, LogOut, Globe, Settings, Download } from "lucide-react";
import { DownloadAnalysisButton } from "./DownloadAnalysisButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AnalysisState } from "@/hooks/useAnalysisOrchestrator";

interface AppHeaderProps {
  analysisState?: AnalysisState;
  projectName?: string;
}

export const AppHeader = ({ analysisState, projectName }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const showDownloadButton = analysisState && (analysisState.phases.phase6 || analysisState.currentPhase >= 6) && !analysisState.isRunning;

  return (
    <header className="border-b no-pdf">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('nav.title')}</h1>
        <div className="flex items-center gap-4">
          {showDownloadButton && (
            user ? (
              <DownloadAnalysisButton 
                state={analysisState!} 
                projectName={projectName || "Análisis Completo"} 
              />
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" disabled className="gap-2 opacity-50 cursor-not-allowed">
                    <Download className="h-4 w-4" />
                    Descargar Análisis
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Loguéate para descargar tu análisis</h4>
                      <p className="text-sm text-muted-foreground">
                        Obtén tu análisis completo en PDF y JSON
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => navigate("/auth")} className="w-full">
                        Crear Cuenta
                      </Button>
                      <Button onClick={() => navigate("/auth")} variant="outline" className="w-full">
                        Iniciar Sesión
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}
          </Button>
          {user && (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/projects")}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                {t('nav.projects')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  {t('nav.settings')}
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('nav.signout')}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
