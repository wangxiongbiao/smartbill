import React, { useMemo, useState } from 'react';
import { Invoice, Language } from '../types';

interface HomeViewProps {
  records: Invoice[];
  lang: Language;
  onCreateEmpty: () => void;
  onOpenRecords: () => void;
  onOpenTemplates: () => void;
  onOpenAI: () => void;
  onExportLatest: () => void;
}

function getInvoiceTotal(invoice: Invoice) {
  const subtotal = invoice.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0), 0);
  return subtotal * (1 + Number(invoice.taxRate || 0) / 100);
}

function formatCurrency(amount: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

const HomeView: React.FC<HomeViewProps> = ({ records, lang, onCreateEmpty, onOpenRecords, onOpenTemplates, onOpenAI, onExportLatest }) => {
  const [activeTrendIndex, setActiveTrendIndex] = useState<number | null>(null);

  const dashboard = useMemo(() => {
    const now = new Date();
    const totalAmount = records.reduce((sum, invoice) => sum + getInvoiceTotal(invoice), 0);
    const unpaid = records.filter(invoice => invoice.status !== 'Paid');
    const unpaidAmount = unpaid.reduce((sum, invoice) => sum + getInvoiceTotal(invoice), 0);
    const paidInvoices = records.filter(invoice => invoice.status === 'Paid');
    const paidAmount = paidInvoices.reduce((sum, invoice) => sum + getInvoiceTotal(invoice), 0);
    const overdue = records.filter(invoice => invoice.status !== 'Paid' && invoice.dueDate && new Date(invoice.dueDate) < now);
    const overdueAmount = overdue.reduce((sum, invoice) => sum + getInvoiceTotal(invoice), 0);
    const latestCurrency = records[0]?.currency || 'USD';

    const trend = Array.from({ length: 7 }).map((_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));
      const key = day.toISOString().split('T')[0];
      const value = records
        .filter(invoice => invoice.date === key)
        .reduce((sum, invoice) => sum + getInvoiceTotal(invoice), 0);
      return { label: day.toLocaleDateString(lang === 'zh-TW' ? 'zh-TW' : 'en-US', { weekday: 'short' }), value };
    });

    const maxTrend = Math.max(...trend.map(item => item.value), 1);

    const recentActivity = [...records]
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 5)
      .map((invoice) => ({
        id: invoice.id,
        title: invoice.invoiceNumber,
        subtitle: invoice.client.name || 'Unnamed client',
        status: invoice.status || 'Draft',
        amount: formatCurrency(getInvoiceTotal(invoice), invoice.currency),
        date: invoice.date
      }));

    const monthlyPerformance = [...records]
      .reduce((acc, invoice) => {
        const key = invoice.client.name || 'Unknown client';
        acc.set(key, (acc.get(key) || 0) + getInvoiceTotal(invoice));
        return acc;
      }, new Map<string, number>())
      .entries();

    const topClients = Array.from(monthlyPerformance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, amount]) => ({ name, amount: formatCurrency(amount, latestCurrency) }));

    return {
      latestCurrency,
      summary: {
        totalAmount,
        unpaidAmount,
        paidAmount,
        overdueAmount,
        paidCount: paidInvoices.length
      },
      trend,
      maxTrend,
      recentActivity,
      topClients
    };
  }, [records, lang]);

  const summaryCards = [
    { label: '总账单金额', value: formatCurrency(dashboard.summary.totalAmount, dashboard.latestCurrency), icon: 'fa-wallet', color: 'bg-blue-50 text-blue-600' },
    { label: '待付款金额', value: formatCurrency(dashboard.summary.unpaidAmount, dashboard.latestCurrency), icon: 'fa-hourglass-half', color: 'bg-amber-50 text-amber-600' },
    { label: '已付款金额', value: formatCurrency(dashboard.summary.paidAmount, dashboard.latestCurrency), sub: `${dashboard.summary.paidCount} 笔`, icon: 'fa-circle-check', color: 'bg-emerald-50 text-emerald-600' },
    { label: '逾期金额', value: formatCurrency(dashboard.summary.overdueAmount, dashboard.latestCurrency), icon: 'fa-triangle-exclamation', color: 'bg-rose-50 text-rose-600' },
  ];

  const chartWidth = 640;
  const chartHeight = 240;
  const chartPadding = { top: 20, right: 16, bottom: 28, left: 16 };
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const pointGap = dashboard.trend.length > 1 ? innerWidth / (dashboard.trend.length - 1) : innerWidth;

  const trendPoints = dashboard.trend.map((item, index) => {
    const x = chartPadding.left + pointGap * index;
    const y = chartPadding.top + innerHeight - (item.value / dashboard.maxTrend) * innerHeight;

    return {
      ...item,
      x,
      y,
      amount: formatCurrency(item.value, dashboard.latestCurrency)
    };
  });

  const linePath = trendPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath = trendPoints.length
    ? `${linePath} L ${trendPoints[trendPoints.length - 1].x} ${chartHeight - chartPadding.bottom} L ${trendPoints[0].x} ${chartHeight - chartPadding.bottom} Z`
    : '';

  const activePoint = activeTrendIndex !== null ? trendPoints[activeTrendIndex] : null;

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-6 space-y-5">
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-white rounded-[28px] border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.color}`}><i className={`fas ${card.icon}`}></i></div>
              {card.sub && <span className="text-xs font-bold text-slate-400">{card.sub}</span>}
            </div>
            <div className="text-sm font-bold text-slate-500">{card.label}</div>
            <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">{card.value}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">营收趋势</h2>
              <p className="text-sm text-slate-500">最近 7 天开票金额</p>
            </div>
          </div>
          <div className="mt-8 bg-slate-50/70 rounded-[28px] p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-black text-slate-900">{formatCurrency(dashboard.summary.totalAmount, dashboard.latestCurrency)}</div>
                <div className="text-xs font-bold text-slate-400 mt-1">近 7 天累计开票金额</div>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black">本周</div>
            </div>
            <div
              className="relative h-56"
              onMouseLeave={() => setActiveTrendIndex(null)}
            >
              {activePoint && (
                <div
                  className="absolute z-10 -translate-x-1/2 -translate-y-full rounded-2xl bg-slate-950 px-3 py-2 text-white shadow-2xl pointer-events-none"
                  style={{
                    left: `${(activePoint.x / chartWidth) * 100}%`,
                    top: `${Math.max(((activePoint.y - 14) / chartHeight) * 100, 8)}%`
                  }}
                >
                  <div className="text-[11px] font-bold text-white/60">{activePoint.label}</div>
                  <div className="text-sm font-black leading-none mt-1">{activePoint.amount}</div>
                </div>
              )}

              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="trendAreaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
                  </linearGradient>
                </defs>

                {[0, 1, 2, 3].map((step) => {
                  const y = chartPadding.top + (innerHeight / 3) * step;
                  return (
                    <line
                      key={step}
                      x1={chartPadding.left}
                      x2={chartWidth - chartPadding.right}
                      y1={y}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 6"
                    />
                  );
                })}

                {areaPath && <path d={areaPath} fill="url(#trendAreaGradient)" />}
                {linePath && <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />}

                {trendPoints.map((point, index) => (
                  <g key={`${point.label}-${index}`}>
                    <line
                      x1={point.x}
                      x2={point.x}
                      y1={chartPadding.top}
                      y2={chartHeight - chartPadding.bottom}
                      stroke={activeTrendIndex === index ? '#93c5fd' : 'transparent'}
                      strokeDasharray="4 6"
                      strokeWidth="1.5"
                    />
                    <line
                      x1={chartPadding.left}
                      x2={chartWidth - chartPadding.right}
                      y1={point.y}
                      y2={point.y}
                      stroke={activeTrendIndex === index ? '#cbd5e1' : 'transparent'}
                      strokeDasharray="4 6"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={activeTrendIndex === index ? 7 : 5}
                      fill="#ffffff"
                      stroke="#2563eb"
                      strokeWidth="3"
                      className="transition-all duration-150"
                    />
                    <text
                      x={point.x}
                      y={Math.max(point.y - 14, chartPadding.top + 12)}
                      textAnchor="middle"
                      className={`fill-slate-500 text-[11px] font-bold ${activeTrendIndex === index ? 'fill-blue-600' : ''}`}
                    >
                      {point.value > 0 ? point.amount : '0'}
                    </text>
                    <rect
                      x={index === 0 ? chartPadding.left : point.x - pointGap / 2}
                      y={chartPadding.top}
                      width={index === 0 || index === trendPoints.length - 1 ? pointGap / 2 : pointGap}
                      height={innerHeight}
                      fill="transparent"
                      className="cursor-crosshair"
                      onMouseEnter={() => setActiveTrendIndex(index)}
                      onFocus={() => setActiveTrendIndex(index)}
                    />
                  </g>
                ))}
              </svg>

              <div className="mt-3 grid grid-cols-7 gap-2">
                {trendPoints.map((point, index) => (
                  <button
                    key={`${point.label}-label`}
                    type="button"
                    onMouseEnter={() => setActiveTrendIndex(index)}
                    onMouseLeave={() => setActiveTrendIndex(current => (current === index ? null : current))}
                    onFocus={() => setActiveTrendIndex(index)}
                    onBlur={() => setActiveTrendIndex(current => (current === index ? null : current))}
                    className={`rounded-xl px-2 py-1.5 text-xs font-bold transition-colors ${activeTrendIndex === index ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
                    aria-label={`${point.label} ${point.amount}`}
                  >
                    {point.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-1">快捷操作</h2>
          <p className="text-sm text-slate-500 mb-6">高频动作直接进入</p>
          <div className="space-y-3">
            <button onClick={onCreateEmpty} className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"><span>快速创建</span><i className="fas fa-plus"></i></button>
            <button onClick={onExportLatest} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 transition-colors"><span>导出 PDF</span><i className="fas fa-file-pdf"></i></button>
            <button onClick={onOpenRecords} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 transition-colors"><span>查看发票列表</span><i className="fas fa-file-invoice"></i></button>
            <button onClick={onOpenTemplates} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 transition-colors"><span>模板中心</span><i className="fas fa-layer-group"></i></button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-1">核心表现</h2>
          <p className="text-sm text-slate-500 mb-5">按客户汇总的月度表现</p>
          <div className="space-y-4">
            {dashboard.topClients.length > 0 ? dashboard.topClients.map(client => (
              <div key={client.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <div className="font-bold text-slate-900">{client.name}</div>
                  <div className="text-xs text-slate-400">本月累计</div>
                </div>
                <div className="font-black text-slate-900">{client.amount}</div>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center"><div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400"><i className="fas fa-chart-line"></i></div><div className="text-sm font-bold text-slate-500">暂无客户表现数据</div><div className="text-xs text-slate-400 mt-1">创建并保存账单后，这里会展示核心客户表现。</div></div>}
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm xl:col-span-1">
          <h2 className="text-xl font-black text-slate-900 mb-1">最近动态</h2>
          <p className="text-sm text-slate-500 mb-5">最近创建和更新的账单</p>
          <div className="space-y-4">
            {dashboard.recentActivity.length > 0 ? dashboard.recentActivity.map(item => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><i className="fas fa-file-lines"></i></div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{item.title}</div>
                  <div className="text-sm text-slate-500 truncate">{item.subtitle}</div>
                  <div className="text-xs text-slate-400 mt-1">{item.status} · {item.date}</div>
                </div>
                <div className="text-sm font-black text-slate-700">{item.amount}</div>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center"><div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400"><i className="fas fa-clock-rotate-left"></i></div><div className="text-sm font-bold text-slate-500">暂无最近动态</div><div className="text-xs text-slate-400 mt-1">账单创建、分享、付款后，这里会自动出现记录。</div></div>}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[32px] p-6 shadow-sm text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4"><i className="fas fa-wand-magic-sparkles"></i></div>
          <h2 className="text-2xl font-black mb-2">AI 助手</h2>
          <p className="text-white/70 text-sm leading-relaxed mb-6">让 AI 帮你生成条目、润色描述、快速整理账单内容。</p>
          <button onClick={onOpenAI} className="w-full rounded-2xl bg-white text-slate-900 py-3 font-black hover:bg-slate-100 transition-colors shadow-[0_12px_24px_-16px_rgba(255,255,255,0.9)]">打开 AI 助手</button>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
