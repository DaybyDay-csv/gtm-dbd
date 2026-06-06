import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Lightbulb, Unlock, Mail, Chrome, Zap, FileDown, Loader2 } from "lucide-react";
import { UnlockPreview } from "./UnlockPreview";
import { captureEmailLead } from "@/utils/emailCapture";
import { supabase } from "@/integrations/supabase/client";

interface SignupGateProps {
  onComplete: () => void;
}

export const SignupGate = ({ onComplete }: SignupGateProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [isEmailOnly, setIsEmailOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSoftEmail, setShowSoftEmail] = useState(false);
  const [softEmail, setSoftEmail] = useState("");
  const [softSubmitting, setSoftSubmitting] = useState(false);
  const [softDone, setSoftDone] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const { signIn, signUp, signInWithOtp, signInWithGoogle } = useAuth();
  const { t } = useLanguage();

  const handleSoftEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!softEmail) return;
    setSoftSubmitting(true);
    try {
      const result = await captureEmailLead({
        email: softEmail,
        projectId: projectId,
        source: "phase_5_email_only",
        language: (typeof window !== "undefined" && (localStorage.getItem("preferred_language") as "es" | "en")) || "es",
      });
      if (result.ok) {
        setSoftDone(true);
        toast.success(t("signup.softEmail.success") || "Listo. Te enviamos el PDF. Revisa tu email en los próximos minutos.");
      } else {
        toast.error(result.error || t("signup.softEmail.error") || "No se pudo registrar el email.");
      }
    } finally {
      setSoftSubmitting(false);
    }
  };


  // Resolve the current project id (from URL ?project= or localStorage)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("project");
    if (fromUrl) { setProjectId(fromUrl); return; }
    try {
      const raw = localStorage.getItem("unclaimedProjects");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length > 0) setProjectId(arr[arr.length - 1]);
      }
    } catch { /* ignore */ }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let error;
      
      if (isEmailOnly && isSignUp) {
        const result = await signInWithOtp(email);
        error = result.error;
        if (!error) {
          toast.success(t('signup.magicLinkSent'));
          return;
        }
      } else {
        const result = isSignUp
          ? await signUp(email, password)
          : await signIn(email, password);
        error = result.error;
      }

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(isSignUp ? t('signup.accountCreated') : t('signup.welcomeBack'));
        onComplete();
      }
    } catch (err) {
      toast.error(t('signup.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      toast.error(t('signup.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      {/* Value Preview */}
      <UnlockPreview />

      {/* Signup Form */}
      <Card className="w-full lg:w-96 p-6 space-y-5 border-2 border-primary/20 shadow-2xl bg-background flex-shrink-0">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
            <Unlock className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">
            {t('signup.unlockTitle')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isSignUp ? t('signup.registerSubtitle') : t('signup.loginSubtitle')}
          </p>
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <Chrome className="w-4 h-4" />
          {t('signup.continueWithGoogle')}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t('signup.orContinueWith')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('signup.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {!isEmailOnly && (
            <div className="space-y-2">
              <Label htmlFor="password">{t('signup.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('signup.processing') : (
              isEmailOnly ? (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {t('signup.sendMagicLink')}
                </>
              ) : (
                isSignUp ? t('signup.createAccount') : t('signup.signIn')
              )
            )}
          </Button>
        </form>

        {isSignUp && (
          <button
            type="button"
            onClick={() => setIsEmailOnly(!isEmailOnly)}
            className="w-full text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1"
            disabled={isLoading}
          >
            <Zap className="w-3 h-3" />
            {isEmailOnly ? t('signup.usePassword') : t('signup.quickSignup')}
          </button>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setIsEmailOnly(false);
            }}
            className="underline hover:text-primary"
            disabled={isLoading}
          >
            {isSignUp ? t('signup.haveAccount') : t('signup.newUser')}
          </button>
        </div>

        <div className="pt-2 border-t">
          {!showSoftEmail ? (
            <button
              type="button"
              onClick={() => setShowSoftEmail(true)}
              className="w-full text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1"
              disabled={isLoading}
            >
              <FileDown className="w-3 h-3" />
              {t("signup.softEmail.cta") || "¿Solo quieres el PDF? Déjanos tu email"}
            </button>
          ) : (
            <form onSubmit={handleSoftEmailSubmit} className="space-y-2">
              <Label htmlFor="soft-email" className="text-xs text-muted-foreground">
                {t("signup.softEmail.label") || "Email para enviarte el PDF"}
              </Label>
              <Input
                id="soft-email"
                type="email"
                placeholder="tu@email.com"
                value={softEmail}
                onChange={(e) => setSoftEmail(e.target.value)}
                required
                disabled={softSubmitting || softDone}
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={softSubmitting || softDone || !softEmail} className="flex-1">
                  {softSubmitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Mail className="w-3 h-3 mr-1" />}
                  {softDone ? (t("signup.softEmail.sent") || "Enviado ✓") : (t("signup.softEmail.send") || "Enviar PDF")}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowSoftEmail(false)} disabled={softSubmitting}>
                  ✕
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground pt-2 border-t flex items-center justify-center gap-2">
          <Lightbulb className="w-4 h-4" />
          <span>{t('signup.analysisRunning')}</span>
        </div>
      </Card>
    </div>
  );
};