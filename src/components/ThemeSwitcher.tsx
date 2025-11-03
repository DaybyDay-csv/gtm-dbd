import { Sun, Moon, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, Theme } from "@/hooks/useTheme";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'red'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'red':
        return <Flame className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'red':
        return 'Red';
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={cycleTheme}
      className="gap-2"
    >
      {getIcon()}
      {getLabel()}
    </Button>
  );
};
