import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { FolderOpen, LogOut, Globe, Settings, Download } from "lucide-react";
import { DownloadAnalysisButton } from "./DownloadAnalysisButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AnalysisState } from "@/hooks/useAnalysisOrchestrator";
import { useState, useEffect } from "react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

interface AppHeaderProps {
  analysisState?: AnalysisState;
  projectName?: string;
  showDownloadButton?: boolean;
}

export const AppHeader = ({ analysisState, projectName, showDownloadButton = false }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [animateButton, setAnimateButton] = useState(false);
  
  const hasContent = analysisState && analysisState.currentPhase >= 1;
  const canDownload = hasContent && !analysisState.isRunning;
  
  useEffect(() => {
    if (showDownloadButton && !user) {
      setAnimateButton(true);
    }
  }, [showDownloadButton, user]);
  
  const emptyState: AnalysisState = {
    currentPhase: 0,
    phases: {
      phase1: null,
      phase2: null,
      phase3: null,
      phase4: null,
      phase5: null,
      phase6: null,
      phase7: null,
    },
    isRunning: false,
    projectId: null,
    clientReadiness: undefined,
    budgetLevel: undefined,
    budgetAmount: undefined,
    awaitingBudgetInput: false,
  };

  return (
    <header className="sticky top-0 z-50 border-b no-pdf bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-2">
        <Link to="/" className="flex flex-col hover:opacity-80 transition-opacity">
          <h1 className="text-base md:text-xl font-bold">{t('nav.title')}</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">{t('nav.subtitle')}</p>
        </Link>
        <div className="flex items-center gap-1 md:gap-4">
          <ThemeSwitcher />
          {user ? (
            <DownloadAnalysisButton
              state={analysisState || emptyState} 
              projectName={projectName || "Análisis Completo"} 
            />
          ) : (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!hasContent}
                    className="gap-1 md:gap-2 hover-scale transition-all text-xs md:text-sm"
                  >
                    <Download className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Descargar Análisis</span>
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
              <Button 
                onClick={() => navigate("/auth")}
                size="sm"
                className="gap-1 md:gap-2 hover-scale transition-all text-xs md:text-sm"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="gap-1 md:gap-2 text-xs md:text-sm"
          >
            <Globe className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">{language === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}</span>
            <span className="sm:hidden">{language === 'es' ? '🇪🇸' : '🇺🇸'}</span>
          </Button>
          {user && (
            <>
              <span className="text-xs md:text-sm text-muted-foreground hidden lg:inline">{user.email}</span>
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
