"use client";

import { createContext, useContext } from 'react';
import type { AppShellContextValue } from '@/components/app/app-shell.types';

export const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) throw new Error('useAppShell must be used within AppShellClient');
  return context;
}
