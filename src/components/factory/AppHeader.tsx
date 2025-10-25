import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderOpen, LogOut, Globe } from "lucide-react";

export const AppHeader = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('header.title')}</h1>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Globe className="mr-2 h-4 w-4" />
                {language === 'es' ? 'ES' : 'EN'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage('es')}>
                🇪🇸 {t('language.spanish')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                🇬🇧 {t('language.english')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {user && (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/projects")}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                {t('header.projects')}
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('header.signOut')}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
