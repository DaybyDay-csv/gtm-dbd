import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { FolderOpen, LogOut, Globe } from "lucide-react";

export const AppHeader = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('nav.title')}</h1>
        <div className="flex items-center gap-4">
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
