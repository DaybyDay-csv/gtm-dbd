import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, Theme } from "@/hooks/useTheme";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
      {getIcon()}
      {getLabel()}
    </Button>
  );
};
