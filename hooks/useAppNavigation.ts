"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTE_BY_VIEW } from '@/lib/routes';
import type { ViewType } from '@/types';

export function useAppNavigation(activeView: ViewType, pathname: string) {
  const router = useRouter();
  const [prevView, setPrevView] = useState<ViewType>('records');
  const previousViewRef = useRef<ViewType>(activeView);

  useEffect(() => {
    if (activeView !== previousViewRef.current) {
      setPrevView(previousViewRef.current);
      previousViewRef.current = activeView;
    }
  }, [activeView]);

  const navigateToView = useCallback((view: ViewType, options?: { templateId?: string; invoiceId?: string }) => {
    const targetPath = options?.templateId
      ? `/templates/${options.templateId}`
      : options?.invoiceId
        ? `/invoices/${options.invoiceId}`
        : ROUTE_BY_VIEW[view];

    if (!targetPath || targetPath === pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    router.push(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, router]);

  const setView = useCallback((view: ViewType) => {
    setPrevView(activeView);
    navigateToView(view);
  }, [activeView, navigateToView]);

  return {
    prevView,
    setView,
    navigateToView,
    router,
  };
}
