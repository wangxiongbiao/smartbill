import React, { useMemo } from 'react';
import RevenueTrendChart from '@/components/charts/RevenueTrendChart';
import { Invoice, Language } from '../types';
import { calculateInvoiceTotal } from '@/lib/invoice';
import { getLocaleForLanguage } from '@/lib/language';

interface HomeViewProps {
  records: Invoice[];
  lang: Language;
  onCreateEmpty: () => void;
  onOpenRecords: () => void;
  onOpenTemplates: () => void;
  onOpenAI: () => void;
  onExportLatest: () => void;
}

function formatCurrency(amount: number, currency = 'USD', lang: Language = 'en') {
  try {
    return new Intl.NumberFormat(getLocaleForLanguage(lang), { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

const HomeView: React.FC<HomeViewProps> = ({ records, lang, onCreateEmpty, onOpenRecords, onOpenTemplates, onOpenAI, onExportLatest }) => {
  const copyByLang: Record<Language, {
    unnamedClient: string;
    unknownClient: string;
    draft: string;
    summaryTotal: string;
    summaryUnpaid: string;
    summaryPaid: string;
    summaryOverdue: string;
    paidCount: (count: number) => string;
    trendTitle: string;
    trendDesc: string;
    last7Days: string;
    trendTotalDesc: string;
    thisWeek: string;
    quickActions: string;
    quickActionsDesc: string;
    createFast: string;
    exportPdf: string;
    openRecords: string;
    openTemplates: string;
    performanceTitle: string;
    performanceDesc: string;
    thisMonth: string;
    noPerformance: string;
    noPerformanceDesc: string;
    recentTitle: string;
    recentDesc: string;
    noRecent: string;
    noRecentDesc: string;
    aiBadge: string;
    aiTitle: string;
    aiDesc: string;
    aiCta: string;
  }> = {
    en: {
      unnamedClient: 'Unnamed client',
      unknownClient: 'Unknown client',
      draft: 'Draft',
      summaryTotal: 'Total billed',
      summaryUnpaid: 'Unpaid amount',
      summaryPaid: 'Paid amount',
      summaryOverdue: 'Overdue amount',
      paidCount: (count: number) => `${count} paid`,
      trendTitle: 'Revenue trend',
      trendDesc: 'See both quiet periods and busy weeks clearly',
      last7Days: 'Last 7 days',
      trendTotalDesc: 'Total invoiced over the last 7 days',
      thisWeek: 'This week',
      quickActions: 'Quick actions',
      quickActionsDesc: 'Jump into the most common tasks',
      createFast: 'Create quickly',
      exportPdf: 'Export PDF',
      openRecords: 'Open invoice list',
      openTemplates: 'Template center',
      performanceTitle: 'Top performance',
      performanceDesc: 'Monthly performance grouped by client',
      thisMonth: 'This month',
      noPerformance: 'No client performance data yet',
      noPerformanceDesc: 'Once you create and save invoices, top client performance will appear here.',
      recentTitle: 'Recent activity',
      recentDesc: 'Recently created and updated invoices',
      noRecent: 'No recent activity yet',
      noRecentDesc: 'Invoice creation, sharing, and payments will show up here automatically.',
      aiBadge: 'AI POWERED WORKFLOW',
      aiTitle: 'Smart AI assistant',
      aiDesc: 'Generate line items, organize payment info, and polish descriptions to speed up invoice editing.',
      aiCta: 'Try it now',
    },
    'zh-CN': {
      unnamedClient: '未命名客户',
      unknownClient: '未知客户',
      draft: '草稿',
      summaryTotal: '总账单金额',
      summaryUnpaid: '待付款金额',
      summaryPaid: '已付款金额',
      summaryOverdue: '逾期金额',
      paidCount: (count: number) => `${count} 笔`,
      trendTitle: '营收趋势',
      trendDesc: '淡季或旺季都能看',
      last7Days: '最近 7 天',
      trendTotalDesc: '近 7 天累计开票金额',
      thisWeek: '本周',
      quickActions: '快捷操作',
      quickActionsDesc: '高频动作直接进入',
      createFast: '快速创建',
      exportPdf: '导出 PDF',
      openRecords: '查看发票列表',
      openTemplates: '模板中心',
      performanceTitle: '核心表现',
      performanceDesc: '按客户汇总的月度表现',
      thisMonth: '本月累计',
      noPerformance: '暂无客户表现数据',
      noPerformanceDesc: '创建并保存账单后，这里会展示核心客户表现。',
      recentTitle: '最近动态',
      recentDesc: '最近创建和更新的账单',
      noRecent: '暂无最近动态',
      noRecentDesc: '账单创建、分享、付款后，这里会自动出现记录。',
      aiBadge: 'AI 驱动工作流',
      aiTitle: '专业 AI 助手',
      aiDesc: '帮你生成条目、整理收款信息、润饰描述，让账单编辑更快更顺手。',
      aiCta: '立即体验',
    },
    'zh-TW': {
      unnamedClient: '未命名客戶',
      unknownClient: '未知客戶',
      draft: '草稿',
      summaryTotal: '總帳單金額',
      summaryUnpaid: '待付款金額',
      summaryPaid: '已付款金額',
      summaryOverdue: '逾期金額',
      paidCount: (count: number) => `${count} 筆`,
      trendTitle: '營收趨勢',
      trendDesc: '冷清期或旺季都能看',
      last7Days: '最近 7 天',
      trendTotalDesc: '近 7 天累計開票金額',
      thisWeek: '本週',
      quickActions: '快捷操作',
      quickActionsDesc: '高頻動作直接進入',
      createFast: '快速建立',
      exportPdf: '匯出 PDF',
      openRecords: '查看發票列表',
      openTemplates: '模板中心',
      performanceTitle: '核心表現',
      performanceDesc: '按客戶匯總的月度表現',
      thisMonth: '本月累計',
      noPerformance: '暫無客戶表現數據',
      noPerformanceDesc: '建立並保存帳單後，這裡會展示核心客戶表現。',
      recentTitle: '最近動態',
      recentDesc: '最近建立和更新的帳單',
      noRecent: '暫無最近動態',
      noRecentDesc: '帳單建立、分享、付款後，這裡會自動出現記錄。',
      aiBadge: 'AI 驅動工作流',
      aiTitle: '專業 AI 助手',
      aiDesc: '幫你生成條目、整理收款資訊、潤飾描述，讓帳單編輯更快更順手。',
      aiCta: '立即體驗',
    },
    th: {
      unnamedClient: 'ลูกค้าไม่มีชื่อ',
      unknownClient: 'ลูกค้าไม่ทราบชื่อ',
      draft: 'ฉบับร่าง',
      summaryTotal: 'ยอดบิลรวม',
      summaryUnpaid: 'ยอดค้างชำระ',
      summaryPaid: 'ยอดที่ชำระแล้ว',
      summaryOverdue: 'ยอดเกินกำหนด',
      paidCount: (count: number) => `${count} รายการ`,
      trendTitle: 'แนวโน้มรายได้',
      trendDesc: 'มองเห็นทั้งช่วงเงียบและช่วงพีคได้ชัดเจน',
      last7Days: '7 วันที่ผ่านมา',
      trendTotalDesc: 'ยอดออกบิลรวมใน 7 วันที่ผ่านมา',
      thisWeek: 'สัปดาห์นี้',
      quickActions: 'การดำเนินการด่วน',
      quickActionsDesc: 'เข้าสู่งานที่ใช้บ่อยได้ทันที',
      createFast: 'สร้างอย่างรวดเร็ว',
      exportPdf: 'ส่งออก PDF',
      openRecords: 'เปิดรายการใบแจ้งหนี้',
      openTemplates: 'ศูนย์เทมเพลต',
      performanceTitle: 'ผลงานหลัก',
      performanceDesc: 'ผลการดำเนินงานรายเดือนแยกตามลูกค้า',
      thisMonth: 'เดือนนี้',
      noPerformance: 'ยังไม่มีข้อมูลผลงานลูกค้า',
      noPerformanceDesc: 'เมื่อคุณสร้างและบันทึกใบแจ้งหนี้แล้ว ผลงานลูกค้าหลักจะแสดงที่นี่',
      recentTitle: 'กิจกรรมล่าสุด',
      recentDesc: 'ใบแจ้งหนี้ที่สร้างและอัปเดตล่าสุด',
      noRecent: 'ยังไม่มีกิจกรรมล่าสุด',
      noRecentDesc: 'การสร้าง การแชร์ และการชำระเงินของใบแจ้งหนี้จะแสดงที่นี่โดยอัตโนมัติ',
      aiBadge: 'AI POWERED WORKFLOW',
      aiTitle: 'ผู้ช่วย AI อัจฉริยะ',
      aiDesc: 'ช่วยสร้างรายการ จัดข้อมูลการชำระเงิน และปรับคำอธิบายให้คมขึ้น เพื่อให้การแก้ไขใบแจ้งหนี้เร็วขึ้น',
      aiCta: 'ลองตอนนี้',
    },
    id: {
      unnamedClient: 'Klien tanpa nama',
      unknownClient: 'Klien tidak dikenal',
      draft: 'Draf',
      summaryTotal: 'Total ditagih',
      summaryUnpaid: 'Jumlah belum dibayar',
      summaryPaid: 'Jumlah sudah dibayar',
      summaryOverdue: 'Jumlah jatuh tempo',
      paidCount: (count: number) => `${count} dibayar`,
      trendTitle: 'Tren pendapatan',
      trendDesc: 'Lihat periode sepi dan minggu sibuk dengan jelas',
      last7Days: '7 hari terakhir',
      trendTotalDesc: 'Total invoice dalam 7 hari terakhir',
      thisWeek: 'Minggu ini',
      quickActions: 'Aksi cepat',
      quickActionsDesc: 'Masuk ke tugas yang paling sering dipakai',
      createFast: 'Buat cepat',
      exportPdf: 'Ekspor PDF',
      openRecords: 'Buka daftar invoice',
      openTemplates: 'Pusat template',
      performanceTitle: 'Performa utama',
      performanceDesc: 'Performa bulanan yang dikelompokkan per klien',
      thisMonth: 'Bulan ini',
      noPerformance: 'Belum ada data performa klien',
      noPerformanceDesc: 'Setelah Anda membuat dan menyimpan invoice, performa klien utama akan tampil di sini.',
      recentTitle: 'Aktivitas terbaru',
      recentDesc: 'Invoice yang baru dibuat dan diperbarui',
      noRecent: 'Belum ada aktivitas terbaru',
      noRecentDesc: 'Pembuatan invoice, pembagian, dan pembayaran akan muncul di sini secara otomatis.',
      aiBadge: 'AI POWERED WORKFLOW',
      aiTitle: 'Asisten AI cerdas',
      aiDesc: 'Buat item baris, rapikan info pembayaran, dan poles deskripsi untuk mempercepat pengeditan invoice.',
      aiCta: 'Coba sekarang',
    },
  };
  const copy = copyByLang[lang];

  const dashboard = useMemo(() => {
    const now = new Date();
    const totalAmount = records.reduce((sum, invoice) => sum + calculateInvoiceTotal(invoice), 0);
    const unpaid = records.filter(invoice => invoice.status !== 'Paid');
    const unpaidAmount = unpaid.reduce((sum, invoice) => sum + calculateInvoiceTotal(invoice), 0);
    const paidInvoices = records.filter(invoice => invoice.status === 'Paid');
    const paidAmount = paidInvoices.reduce((sum, invoice) => sum + calculateInvoiceTotal(invoice), 0);
    const overdue = records.filter(invoice => invoice.status !== 'Paid' && invoice.dueDate && new Date(invoice.dueDate) < now);
    const overdueAmount = overdue.reduce((sum, invoice) => sum + calculateInvoiceTotal(invoice), 0);
    const latestCurrency = records[0]?.currency || 'USD';

    const trend = Array.from({ length: 7 }).map((_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));
      const key = day.toISOString().split('T')[0];
      const value = records
        .filter(invoice => invoice.date === key)
        .reduce((sum, invoice) => sum + calculateInvoiceTotal(invoice), 0);
      return { label: day.toLocaleDateString(getLocaleForLanguage(lang), { weekday: 'short' }), value };
    });

    const recentActivity = [...records]
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 3)
      .map((invoice) => ({
        id: invoice.id,
        title: invoice.invoiceNumber,
        subtitle: invoice.client.name || copy.unnamedClient,
        status: invoice.status || copy.draft,
        amount: formatCurrency(calculateInvoiceTotal(invoice), invoice.currency, lang),
        date: invoice.date
      }));

    const monthlyPerformance = [...records]
      .reduce((acc, invoice) => {
        const key = invoice.client.name || copy.unknownClient;
        acc.set(key, (acc.get(key) || 0) + calculateInvoiceTotal(invoice));
        return acc;
      }, new Map<string, number>())
      .entries();

    const topClients = Array.from(monthlyPerformance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, amount]) => ({ name, amount: formatCurrency(amount, latestCurrency, lang) }));

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
      recentActivity,
      topClients
    };
  }, [records, lang, copy.unnamedClient, copy.unknownClient, copy.draft]);

  const summaryCards = [
    { label: copy.summaryTotal, value: formatCurrency(dashboard.summary.totalAmount, dashboard.latestCurrency, lang), icon: 'fa-chart-line', color: 'bg-blue-600 text-white' },
    { label: copy.summaryUnpaid, value: formatCurrency(dashboard.summary.unpaidAmount, dashboard.latestCurrency, lang), icon: 'fa-clock', color: 'bg-amber-500 text-white' },
    { label: copy.summaryPaid, value: formatCurrency(dashboard.summary.paidAmount, dashboard.latestCurrency, lang), sub: copy.paidCount(dashboard.summary.paidCount), icon: 'fa-check', color: 'bg-emerald-500 text-white' },
    { label: copy.summaryOverdue, value: formatCurrency(dashboard.summary.overdueAmount, dashboard.latestCurrency, lang), icon: 'fa-triangle-exclamation', color: 'bg-rose-500 text-white' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-5 md:px-8 md:py-6 space-y-3.5">
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-white rounded-[24px] border border-slate-200 px-4 py-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shadow-sm ${card.color}`}><i className={`fas ${card.icon} text-[11px]`}></i></div>
              {card.sub && <span className="text-[10px] font-semibold text-slate-400 tracking-normal">{card.sub}</span>}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 tracking-normal">{card.label}</div>
            <div className="mt-1.5 text-[24px] leading-none font-medium text-slate-900 tracking-[-0.02em]">{card.value}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-3.5">
        <div className="xl:col-span-2 bg-white rounded-[24px] border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[16px] font-bold tracking-[-0.02em] text-slate-900">{copy.trendTitle}</h2>
              <p className="text-[11px] text-slate-500">{copy.trendDesc}</p>
            </div>
            <div className="text-[10px] font-semibold text-slate-400">{copy.last7Days}</div>
          </div>
          <div className="mt-4 bg-slate-50/70 rounded-[22px] p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[24px] leading-none font-medium tracking-[-0.015em] text-slate-900">{formatCurrency(dashboard.summary.totalAmount, dashboard.latestCurrency, lang)}</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-1">{copy.trendTotalDesc}</div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">{copy.thisWeek}</div>
            </div>

            <RevenueTrendChart data={dashboard.trend} lang={lang} currency={dashboard.latestCurrency} />
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-200 p-4 shadow-sm">
          <h2 className="text-[16px] font-bold tracking-[-0.02em] text-slate-900 mb-1">{copy.quickActions}</h2>
          <p className="text-[11px] text-slate-500 mb-4">{copy.quickActionsDesc}</p>
          <div className="space-y-2">
            <button onClick={onCreateEmpty} className="w-full flex items-center justify-between px-4 h-11 rounded-2xl bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 transition-colors shadow-[0_14px_26px_-18px_rgba(37,99,235,0.52)]"><span>{copy.createFast}</span><i className="fas fa-plus text-[11px]"></i></button>
            <button onClick={onExportLatest} className="w-full flex items-center justify-between px-4 h-11 rounded-2xl bg-slate-50 text-slate-700 text-[12px] font-semibold hover:bg-slate-100 transition-colors"><span>{copy.exportPdf}</span><i className="fas fa-file-arrow-down text-[11px]"></i></button>
            <button onClick={onOpenRecords} className="w-full flex items-center justify-between px-4 h-11 rounded-2xl bg-slate-50 text-slate-700 text-[12px] font-semibold hover:bg-slate-100 transition-colors"><span>{copy.openRecords}</span><i className="fas fa-folder-open text-[11px]"></i></button>
            <button onClick={onOpenTemplates} className="w-full flex items-center justify-between px-4 h-11 rounded-2xl bg-slate-50 text-slate-700 text-[12px] font-semibold hover:bg-slate-100 transition-colors"><span>{copy.openTemplates}</span><i className="fas fa-layer-group text-[11px]"></i></button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-[24px] border border-slate-200 p-4 shadow-sm">
          <h2 className="text-[16px] font-bold tracking-[-0.02em] text-slate-900 mb-1">{copy.performanceTitle}</h2>
          <p className="text-[11px] text-slate-500 mb-4">{copy.performanceDesc}</p>
          <div className="space-y-3.5">
            {dashboard.topClients.length > 0 ? dashboard.topClients.map(client => (
              <div key={client.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-[12px] font-semibold text-slate-900 leading-none">{client.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{copy.thisMonth}</div>
                </div>
                <div className="text-[12px] font-medium tracking-normal text-slate-900">{client.amount}</div>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center"><div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400"><i className="fas fa-chart-line text-[12px]"></i></div><div className="text-[12px] font-semibold text-slate-500">{copy.noPerformance}</div><div className="text-[10px] text-slate-400 mt-1">{copy.noPerformanceDesc}</div></div>}
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-200 p-4 shadow-sm xl:col-span-1">
          <h2 className="text-[16px] font-bold tracking-[-0.02em] text-slate-900 mb-1">{copy.recentTitle}</h2>
          <p className="text-[11px] text-slate-500 mb-4">{copy.recentDesc}</p>
          <div className="space-y-3.5">
            {dashboard.recentActivity.length > 0 ? dashboard.recentActivity.map(item => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center"><i className="fas fa-file-lines text-[12px]"></i></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-slate-900 truncate leading-none">{item.title}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-1">{item.subtitle}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{item.status} · {item.date}</div>
                </div>
                <div className="text-[11px] font-medium tracking-normal text-slate-700">{item.amount}</div>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center"><div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400"><i className="fas fa-clock-rotate-left text-[12px]"></i></div><div className="text-[12px] font-semibold text-slate-500">{copy.noRecent}</div><div className="text-[10px] text-slate-400 mt-1">{copy.noRecentDesc}</div></div>}
          </div>
        </div>

        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.24),_transparent_35%),linear-gradient(135deg,#1d4ed8_0%,#3b82f6_55%,#93c5fd_100%)] rounded-[24px] p-5 shadow-sm text-white border border-blue-200">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/15 blur-2xl"></div>
          <div className="absolute right-6 bottom-6 text-white/10 text-6xl"><i className="fas fa-sparkles"></i></div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80 ring-1 ring-white/10 mb-4">
              <i className="fas fa-wand-magic-sparkles text-[10px]"></i>
              {copy.aiBadge}
            </div>
            <h2 className="text-[20px] leading-none font-bold tracking-[-0.025em] mb-2.5">{copy.aiTitle}</h2>
            <p className="max-w-[240px] text-white/72 text-[12px] leading-5 mb-5">{copy.aiDesc}</p>
            <button onClick={onOpenAI} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 h-11 text-[12px] font-semibold text-slate-900 hover:bg-slate-100 transition-colors shadow-[0_12px_24px_-16px_rgba(255,255,255,0.9)]">
              <span>{copy.aiCta}</span>
              <i className="fas fa-arrow-up-right-from-square text-[11px]"></i>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
