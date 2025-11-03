import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'red';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'red-theme');
    
    // Add the current theme class
    if (theme === 'red') {
      root.classList.add('red-theme');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    }
    
    // Store preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
