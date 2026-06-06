import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { FolderOpen, LogOut, Globe, Settings, Download, Menu, Mail, Loader2, FileText, FileJson } from "lucide-react";
import { DownloadAnalysisButton } from "./DownloadAnalysisButton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadAnalysisAsJSON, downloadAnalysisAsPDF } from "@/utils/downloadAnalysis";
import { captureEmailLead } from "@/utils/emailCapture";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<"pdf" | "json" | null>(null);
  const { toast } = useToast();

  const triggerDownload = async (format: "pdf" | "json") => {
    if (!analysisState || analysisState.currentPhase < 1) {
      toast({ title: "Sin contenido", description: "Completa al menos la fase 1 para descargar.", variant: "destructive" });
      return;
    }
    try {
      if (format === "pdf") {
        await downloadAnalysisAsPDF(analysisState, projectName || "Analisis");
      } else {
        downloadAnalysisAsJSON(analysisState, projectName || "Analisis");
      }
      toast({ title: "Descarga completada", description: `Tu analisis se descargo en formato ${format.toUpperCase()}.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Error al generar", description: "No se pudo generar la descarga. Intentalo de nuevo.", variant: "destructive" });
    }
  };

  const handleAnonDownloadClick = (format: "pdf" | "json") => {
    setPendingFormat(format);
    setEmailDialogOpen(true);
  };

  const handleEmailSubmit = async (skipEmail: boolean) => {
    if (!skipEmail && !emailValue) {
      toast({ title: "Email requerido", description: "Introduce tu email para continuar.", variant: "destructive" });
      return;
    }
    setEmailSubmitting(true);
    try {
      if (!skipEmail) {
        const result = await captureEmailLead({
          email: emailValue,
          projectId: analysisState?.projectId || null,
          source: pendingFormat === "pdf" ? "pdf_download" : "json_download",
          language: language,
        });
        if (!result.ok) {
          toast({ title: "Error", description: result.error || "No se pudo registrar el email.", variant: "destructive" });
          return;
        }
      }
      const fmt = pendingFormat || "pdf";
      setEmailDialogOpen(false);
      setEmailValue("");
      setPendingFormat(null);
      await triggerDownload(fmt);
    } finally {
      setEmailSubmitting(false);
    }
  };
  
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
      <div className="w-full max-w-full px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-2">
        <Link to="/" className="flex flex-col hover:opacity-80 transition-opacity flex-shrink-0">
          <h1 className="text-base md:text-xl font-bold whitespace-nowrap">{t('nav.title')}</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">{t('nav.subtitle')}</p>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-4">
          <ThemeSwitcher />
          {user ? (
            <DownloadAnalysisButton
              state={analysisState || emptyState} 
              projectName={projectName || "Análisis Completo"} 
            />
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!hasContent} className="gap-2 hover-scale transition-all">
                    <Download className="h-4 w-4" />
                    Descargar Análisis
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleAnonDownloadClick("pdf")} disabled={!hasContent || analysisState?.isRunning} className="gap-2">
                    <FileText className="h-4 w-4" /> Descargar como PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAnonDownloadClick("json")} disabled={!hasContent || analysisState?.isRunning} className="gap-2">
                    <FileJson className="h-4 w-4" /> Descargar como JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                onClick={() => navigate("/auth")}
                size="sm"
                className="gap-2 hover-scale transition-all"
              >
                <LogOut className="h-4 w-4" />
                Iniciar Sesión
              </Button>
            </>
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
              <span className="text-sm text-muted-foreground hidden xl:inline">{user.email}</span>
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

        {/* Mobile Navigation */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeSwitcher />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="flex flex-col gap-4 mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                  className="justify-start gap-2"
                >
                  <Globe className="h-4 w-4" />
                  {language === 'es' ? '🇪🇸 Español' : '🇺🇸 English'}
                </Button>
                
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-muted-foreground border-b">
                      {user.email}
                    </div>
                    <DownloadAnalysisButton
                      state={analysisState || emptyState} 
                      projectName={projectName || "Análisis Completo"} 
                    />
                    <Button
                      variant="outline"
                      onClick={() => navigate("/projects")}
                      className="justify-start"
                    >
                      <FolderOpen className="mr-2 h-4 w-4" />
                      {t('nav.projects')}
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="justify-start"
                    >
                      <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('nav.settings')}
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={signOut} className="justify-start">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.signout')}
                    </Button>
                  </>
                ) : (
                  <>
                    {hasContent ? (
                      <div className="space-y-4 border-b pb-4">
                        <p className="text-sm text-muted-foreground px-3">
                          Loguéate para descargar tu análisis completo
                        </p>
                        <div className="flex flex-col gap-2">
                          <Button onClick={() => navigate("/auth")} className="w-full">
                            Crear Cuenta
                          </Button>
                          <Button onClick={() => navigate("/auth")} variant="outline" className="w-full">
                            Iniciar Sesión
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => navigate("/auth")}
                        className="justify-start gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Iniciar Sesión
                      </Button>
                    )}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Recibe tu análisis completo
            </DialogTitle>
            <DialogDescription>
              Déjanos tu email para enviarte también una copia y mantenerte al tanto de las próximas mejoras. O descárgalo directamente sin registrarte.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="email-capture">Email (opcional)</Label>
              <Input
                id="email-capture"
                type="email"
                placeholder="tu@email.com"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                disabled={emailSubmitting}
                onKeyDown={(e) => { if (e.key === "Enter") handleEmailSubmit(false); }}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => handleEmailSubmit(true)} disabled={emailSubmitting} className="w-full sm:w-auto">
              {emailSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Descargar sin email
            </Button>
            <Button onClick={() => handleEmailSubmit(false)} disabled={emailSubmitting || !emailValue} className="w-full sm:w-auto">
              {emailSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enviar y descargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};
