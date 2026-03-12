'use client';

import { useEffect, useState } from 'react';

type DebugMetrics = {
  origin: string;
  innerSize: string;
  outerSize: string;
  screenSize: string;
  clientSize: string;
  visualViewport: string;
  dpr: string;
  htmlFontSize: string;
  bodyFontFamily: string;
  sidebarWidth: string;
  headerHeight: string;
  mainWidth: string;
};

function isDebugEnabled() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('ui-debug');
  return value === '1' || value === 'true';
}

function formatNumber(value: number | undefined, digits = 2) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '-';
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}

function sizeLabel(width: number | undefined, height: number | undefined) {
  return `${formatNumber(width)} x ${formatNumber(height)}`;
}

export default function UIDebugOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [metrics, setMetrics] = useState<DebugMetrics | null>(null);

  useEffect(() => {
    const nextEnabled = isDebugEnabled();
    setEnabled(nextEnabled);

    if (!nextEnabled) {
      return;
    }

    const update = () => {
      const html = document.documentElement;
      const body = document.body;
      const visualViewport = window.visualViewport;
      const sidebar = document.querySelector<HTMLElement>('[data-ui-sidebar]');
      const header = document.querySelector<HTMLElement>('[data-ui-header]');
      const main = document.querySelector<HTMLElement>('[data-ui-main]');
      const htmlStyle = getComputedStyle(html);
      const bodyStyle = getComputedStyle(body);

      setMetrics({
        origin: window.location.origin,
        innerSize: sizeLabel(window.innerWidth, window.innerHeight),
        outerSize: sizeLabel(window.outerWidth, window.outerHeight),
        screenSize: sizeLabel(window.screen.width, window.screen.height),
        clientSize: sizeLabel(html.clientWidth, html.clientHeight),
        visualViewport: `${sizeLabel(visualViewport?.width, visualViewport?.height)} @ ${formatNumber(visualViewport?.scale)}`,
        dpr: formatNumber(window.devicePixelRatio),
        htmlFontSize: htmlStyle.fontSize,
        bodyFontFamily: bodyStyle.fontFamily,
        sidebarWidth: formatNumber(sidebar?.getBoundingClientRect().width),
        headerHeight: formatNumber(header?.getBoundingClientRect().height),
        mainWidth: formatNumber(main?.getBoundingClientRect().width),
      });
    };

    update();
    document.fonts?.ready.then(update).catch(() => undefined);

    window.addEventListener('resize', update);
    visualViewport?.addEventListener('resize', update);

    return () => {
      window.removeEventListener('resize', update);
      visualViewport?.removeEventListener('resize', update);
    };
  }, []);

  if (!enabled || !metrics) {
    return null;
  }

  const rows: Array<[string, string]> = [
    ['origin', metrics.origin],
    ['inner', metrics.innerSize],
    ['outer', metrics.outerSize],
    ['screen', metrics.screenSize],
    ['client', metrics.clientSize],
    ['visualViewport', metrics.visualViewport],
    ['dpr', metrics.dpr],
    ['html font-size', metrics.htmlFontSize],
    ['body font', metrics.bodyFontFamily],
    ['sidebar width', metrics.sidebarWidth],
    ['header height', metrics.headerHeight],
    ['main width', metrics.mainWidth],
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[300] w-[21.25rem] rounded-2xl border border-white/20 bg-black p-4 text-[0.6875rem] text-white shadow-[0_1.5rem_3.125rem_-1.5rem_rgba(0,0,0,0.9)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-semibold tracking-[0.18em] text-white uppercase">
          UI Debug
        </span>
        <span className="rounded-full bg-white/10 px-2 py-1 text-[0.625rem] font-medium text-white">
          ?ui-debug=1
        </span>
      </div>
      <div className="space-y-1.5 font-mono">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-3">
            <span className="min-w-[6.75rem] text-white/70">{label}</span>
            <span className="break-all text-right text-white">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
