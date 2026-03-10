'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ThemeToggle - Dark mode toggle with smooth spring animation.
 * Syncs with system preference and localStorage persistence.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Detect current theme
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const currentTheme = storedTheme || 'system';

    setTheme(currentTheme);

    // Apply theme
    const root = document.documentElement;
    if (currentTheme === 'system') {
      root.classList.toggle('dark', systemPreference === 'dark');
    } else {
      root.classList.toggle('dark', currentTheme === 'dark');
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;

    if (newTheme === 'system') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemPreference === 'dark');
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }

    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/40 border border-border/50">
      <button
        onClick={() => handleThemeChange('light')}
        className={cn(
          'p-2 rounded-md transition-all duration-200 motion-safe:hover:scale-105',
          theme === 'light'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="Light mode"
        title="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleThemeChange('dark')}
        className={cn(
          'p-2 rounded-md transition-all duration-200 motion-safe:hover:scale-105',
          theme === 'dark'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>

      <div className="w-px h-4 bg-border/50 mx-0.5" />

      <button
        onClick={() => handleThemeChange('system')}
        className={cn(
          'px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 motion-safe:hover:scale-105',
          theme === 'system'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="System preference"
        title="Use system preference"
      >
        System
      </button>
    </div>
  );
}
