"use client";

import type { ReactNode } from 'react';
import DashboardShell from '@/components/app/DashboardShell';
import { AppShellContext } from '@/components/app/AppShellContext';
import AppShellPrintArea from '@/components/app/AppShellPrintArea';
import { useAppShellState } from '@/hooks/useAppShellState';

export function AppShellClient({ children }: { children: ReactNode }) {
  const {
    contextValue,
    dashboardShellProps,
    printAreaRef,
    invoice,
    template,
    isHeaderReversed,
    lang,
  } = useAppShellState();

  return (
    <AppShellContext.Provider value={contextValue}>
      <DashboardShell
        {...dashboardShellProps}
        printArea={(
          <AppShellPrintArea
            invoice={invoice}
            template={template}
            isHeaderReversed={isHeaderReversed}
            lang={lang}
            printAreaRef={printAreaRef}
          />
        )}
      >
        {children}
      </DashboardShell>
    </AppShellContext.Provider>
  );
}

export { useAppShell } from '@/components/app/AppShellContext';
