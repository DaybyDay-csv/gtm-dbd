import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Lightbulb, Unlock, Mail, Chrome, Zap, BarChart3, TestTube, FileText } from "lucide-react";
import { UnlockPreview } from "./UnlockPreview";

interface SignupGateProps {
  onComplete: () => void;
}

export const SignupGate = ({ onComplete }: SignupGateProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [isEmailOnly, setIsEmailOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithOtp, signInWithGoogle } = useAuth();
  const { t } = useLanguage();

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

        <div className="text-center text-xs text-muted-foreground pt-2 border-t flex items-center justify-center gap-2">
          <Lightbulb className="w-4 h-4" />
          <span>{t('signup.analysisRunning')}</span>
        </div>
      </Card>
    </div>
  );
};