"use client";

import type { ReactNode } from 'react';
import DashboardShell from '@/components/app/DashboardShell';
import { AppShellContext } from '@/components/app/AppShellContext';
import { useAppShellState } from '@/hooks/useAppShellState';

export function AppShellClient({ children }: { children: ReactNode }) {
  const { contextValue, dashboardShellProps } = useAppShellState();

  return (
    <AppShellContext.Provider value={contextValue}>
      <DashboardShell {...dashboardShellProps}>
        {children}
      </DashboardShell>
    </AppShellContext.Provider>
  );
}

export { useAppShell } from '@/components/app/AppShellContext';
