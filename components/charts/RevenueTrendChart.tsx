'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { Language } from '@/types';
import { getLocaleForLanguage } from '@/lib/language';

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

interface RevenueTrendPoint {
  label: string;
  value: number;
}

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[];
  lang: Language;
  currency: string;
}

function formatCurrency(value: number, currency: string, lang: Language) {
  try {
    return new Intl.NumberFormat(getLocaleForLanguage(lang), {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value || 0);
  } catch {
    return `${currency} ${value.toFixed(0)}`;
  }
}

export default function RevenueTrendChart({ data, lang, currency }: RevenueTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const chart = echarts.init(node);
    const option = {
      animationDuration: 450,
      animationDurationUpdate: 300,
      grid: {
        top: 12,
        right: 8,
        bottom: 12,
        left: 8,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(37,99,235,0.08)',
            borderRadius: 16,
          },
        },
        backgroundColor: '#2563eb',
        borderWidth: 0,
        padding: [10, 12],
        textStyle: {
          color: '#ffffff',
          fontFamily: 'inherit',
        },
        formatter: (params: Array<{ axisValueLabel: string; value: number }>) => {
          const point = params[0];
          return [
            `<div style="font-size:0.625rem;font-weight:600;color:rgba(255,255,255,0.7);text-align:center;">${point.axisValueLabel}</div>`,
            `<div style="font-size:0.75rem;font-weight:700;line-height:1.1;margin-top:0.25rem;text-align:center;">${formatCurrency(Number(point.value || 0), currency, lang)}</div>`,
          ].join('');
        },
      },
      xAxis: {
        type: 'category',
        data: data.map((point) => point.label),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 10,
          fontWeight: 600,
          margin: 14,
        },
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [
        {
          type: 'bar',
          data: data.map((point) => point.value),
          barWidth: 10,
          itemStyle: {
            color: '#3b82f6',
            borderRadius: [999, 999, 999, 999],
          },
          emphasis: {
            itemStyle: {
              color: '#1d4ed8',
              shadowBlur: 12,
              shadowColor: 'rgba(37,99,235,0.28)',
            },
          },
        },
      ],
    };

    chart.setOption(option);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [currency, data, lang]);

  const ariaLabelByLang: Record<Language, string> = {
    en: 'Revenue trend chart',
    'zh-CN': '营收趋势图表',
    'zh-TW': '營收趨勢圖表',
    th: 'กราฟแนวโน้มรายได้',
    id: 'Grafik tren pendapatan',
  };

  return <div ref={containerRef} className="h-[13.75rem] w-full" aria-label={ariaLabelByLang[lang]} />;
}
