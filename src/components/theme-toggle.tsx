'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';
  const label = isDark ? 'Bright Mode' : 'Dark Mode';
  const ariaLabel = isDark ? 'Switch to bright light mode' : 'Switch to dark mode';
  const title = isDark ? 'Switch to bright light mode' : 'Switch to dark mode';

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={title}
      type="button"
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all duration-200 border shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 hover:border-slate-600'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 hover:border-slate-400'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in fade-in zoom-in duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 animate-in fade-in zoom-in duration-200" />
      )}
      {showLabel && <span className="truncate">{label}</span>}
    </button>
  );
}
