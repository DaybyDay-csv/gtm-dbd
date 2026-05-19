import { useState, useEffect } from 'react';
import { Seo } from '@/components/Seo';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/factory/AppHeader';

export default function AccountSettings() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>(language);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const handleSave = async () => {
    await setLanguage(selectedLanguage);
    toast({
      title: t('settings.saved'),
      description: t('settings.language_updated'),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.title')}</CardTitle>
            <CardDescription>{t('settings.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t('settings.email')}</Label>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{t('settings.preferred_language')}</Label>
              <Select value={selectedLanguage} onValueChange={(val) => setSelectedLanguage(val as 'es' | 'en')}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.language_description')}
              </p>
            </div>

            <Button onClick={handleSave} disabled={selectedLanguage === language}>
              {t('settings.save_changes')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
