'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * ThemeToggle - High-fidelity button to switch between light, dark, and system themes.
 * Enhanced with professional iconography and smooth transitions.
 */
export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-full border border-border/40 bg-background/50 backdrop-blur-sm shadow-sm hover:bg-accent/10 focus-visible:ring-offset-4" 
          aria-label="Toggle visual theme"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-accent" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 p-1">
        <DropdownMenuItem onClick={() => setTheme('light')} className="gap-3 py-2.5 font-bold uppercase text-[10px] tracking-widest cursor-pointer">
          <Sun className="h-4 w-4 text-amber-500" />
          <span>Light Mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-3 py-2.5 font-bold uppercase text-[10px] tracking-widest cursor-pointer">
          <Moon className="h-4 w-4 text-accent" />
          <span>Dark Mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="gap-3 py-2.5 font-bold uppercase text-[10px] tracking-widest cursor-pointer">
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <span>Sync System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}