import React, { useEffect, useMemo, useState } from 'react';
import { Invoice, Language } from '../types';
import { translations } from '../i18n';
import ShareDialog from './ShareDialog';
import EmailDialog from './EmailDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { calculateInvoiceTotal } from '@/lib/invoice';
import { getLocaleForLanguage } from '@/lib/language';

interface RecordsViewProps {
  records: Invoice[];
  onEdit: (record: Invoice) => void;
  onDuplicate: (record: Invoice) => void | Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onExport: (record: Invoice) => void;
  lang: Language;
  onNewDoc: () => void;
  isDeletingId?: string | null;
}

const RecordsView: React.FC<RecordsViewProps> = ({ records, onEdit, onDuplicate, onDelete, onExport, lang, onNewDoc, isDeletingId }) => {
  const t = translations[lang] || translations['en'];
  const [shareInvoice, setShareInvoice] = useState<Invoice | null>(null);
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
  const [deleteInvoice, setDeleteInvoice] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<'all' | number>('all');

  const copyByLang = {
    en: {
      createNew: 'Create New',
      untitledClient: 'Untitled Client',
      edit: 'Edit',
      duplicate: 'Duplicate',
      export: 'Export',
      processing: 'Processing...',
      syncing: 'Syncing with cloud...',
      monthFilter: 'Month',
      allMonths: 'All months',
      emptyFilteredTitle: 'No matching invoices',
      emptyFilteredDesc: 'Try another month or clear the search keyword.',
      idLabel: 'ID',
      statusLabel: 'Status',
      actionsLabel: 'Actions',
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      share: 'Share',
      email: 'Email',
      editAction: 'Edit',
      exportAction: 'Export',
      deleteAction: 'Delete',
    },
    'zh-CN': {
      createNew: '创建新发票',
      untitledClient: '未命名客户',
      edit: '编辑',
      duplicate: '复制',
      export: '导出',
      processing: '处理中...',
      syncing: '正在与云端同步...',
      monthFilter: '月份',
      allMonths: '全部月份',
      emptyFilteredTitle: '没有符合条件的发票',
      emptyFilteredDesc: '试试其他月份，或清空搜索关键词。',
      idLabel: '编号',
      statusLabel: '状态',
      actionsLabel: '操作',
      draft: '草稿',
      sent: '已发送',
      paid: '已支付',
      share: '分享',
      email: '邮件',
      editAction: '编辑',
      exportAction: '导出',
      deleteAction: '删除',
    },
    'zh-TW': {
      createNew: '建立新發票',
      untitledClient: '未命名客戶',
      edit: '編輯',
      duplicate: '複製',
      export: '匯出',
      processing: '處理中...',
      syncing: '正在與雲端同步...',
      monthFilter: '月份',
      allMonths: '全部月份',
      emptyFilteredTitle: '沒有符合條件的發票',
      emptyFilteredDesc: '試試其他月份，或清空搜尋關鍵字。',
      idLabel: '編號',
      statusLabel: '狀態',
      actionsLabel: '操作',
      draft: '草稿',
      sent: '已發送',
      paid: '已支付',
      share: '分享',
      email: '郵件',
      editAction: '編輯',
      exportAction: '匯出',
      deleteAction: '刪除',
    },
    th: {
      createNew: 'สร้างใหม่',
      untitledClient: 'ลูกค้าไม่มีชื่อ',
      edit: 'แก้ไข',
      duplicate: 'ทำซ้ำ',
      export: 'ส่งออก',
      processing: 'กำลังประมวลผล...',
      syncing: 'กำลังซิงก์กับคลาวด์...',
      monthFilter: 'เดือน',
      allMonths: 'ทุกเดือน',
      emptyFilteredTitle: 'ไม่พบใบแจ้งหนี้ที่ตรงเงื่อนไข',
      emptyFilteredDesc: 'ลองเลือกเดือนอื่น หรือล้างคำค้นหา',
      idLabel: 'รหัส',
      statusLabel: 'สถานะ',
      actionsLabel: 'การทำงาน',
      draft: 'ฉบับร่าง',
      sent: 'ส่งแล้ว',
      paid: 'ชำระแล้ว',
      share: 'แชร์',
      email: 'อีเมล',
      editAction: 'แก้ไข',
      exportAction: 'ส่งออก',
      deleteAction: 'ลบ',
    },
    id: {
      createNew: 'Buat baru',
      untitledClient: 'Klien tanpa nama',
      edit: 'Edit',
      duplicate: 'Duplikat',
      export: 'Ekspor',
      processing: 'Memproses...',
      syncing: 'Menyinkronkan dengan cloud...',
      monthFilter: 'Bulan',
      allMonths: 'Semua bulan',
      emptyFilteredTitle: 'Tidak ada invoice yang cocok',
      emptyFilteredDesc: 'Coba bulan lain atau hapus kata kunci pencarian.',
      idLabel: 'ID',
      statusLabel: 'Status',
      actionsLabel: 'Aksi',
      draft: 'Draft',
      sent: 'Terkirim',
      paid: 'Lunas',
      share: 'Bagikan',
      email: 'Email',
      editAction: 'Edit',
      exportAction: 'Ekspor',
      deleteAction: 'Hapus',
    },
  } satisfies Record<Language, {
    createNew: string;
    untitledClient: string;
    edit: string;
    duplicate: string;
    export: string;
    processing: string;
    syncing: string;
    monthFilter: string;
    allMonths: string;
    emptyFilteredTitle: string;
    emptyFilteredDesc: string;
    idLabel: string;
    statusLabel: string;
    actionsLabel: string;
    draft: string;
    sent: string;
    paid: string;
    share: string;
    email: string;
    editAction: string;
    exportAction: string;
    deleteAction: string;
  }>;
  const copy = copyByLang[lang];

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const label = new Intl.DateTimeFormat(getLocaleForLanguage(lang), { month: 'short' }).format(
          new Date(2026, index, 1)
        );

        return { value: month, label };
      }),
    [lang]
  );

  const filteredRecords = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        !searchQuery ||
        record.invoiceNumber.toLowerCase().includes(lowerQuery) ||
        record.client.name.toLowerCase().includes(lowerQuery);

      const parsedDate = new Date(record.date);
      const recordMonth = Number.isNaN(parsedDate.getTime()) ? null : parsedDate.getMonth() + 1;
      const matchesMonth = selectedMonth === 'all' || recordMonth === selectedMonth;

      return matchesSearch && matchesMonth;
    });
  }, [records, searchQuery, selectedMonth]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, filteredRecords.length);

  const handleDeleteConfirm = async () => {
    if (!deleteInvoice || isDeletingId === deleteInvoice.id) return;

    try {
      await onDelete(deleteInvoice.id);
      setDeleteInvoice(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const formatAmount = (record: Invoice) => {
    try {
      return new Intl.NumberFormat(getLocaleForLanguage(lang), {
        style: 'currency',
        currency: record.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(calculateInvoiceTotal(record));
    } catch {
      return `${record.currency} ${calculateInvoiceTotal(record).toFixed(2)}`;
    }
  };

  const formatDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) return dateString;

    return parsedDate.toLocaleDateString('en-CA');
  };

  const getStatusMeta = (status?: Invoice['status']) => {
    switch (status) {
      case 'Paid':
        return {
          label: copy.paid,
          className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
        };
      case 'Sent':
        return {
          label: copy.sent,
          className: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
        };
      default:
        return {
          label: copy.draft,
          className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
        };
    }
  };

  useEffect(() => {
    setCurrentPage((prevPage) => {
      const maxPage = Math.max(totalPages, 1);
      return prevPage > maxPage ? maxPage : prevPage;
    });
  }, [totalPages]);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <div className="bg-slate-100 w-28 h-28 rounded-[2rem] flex items-center justify-center text-slate-300 text-5xl mb-8 shadow-inner rotate-3">
          <i className="fas fa-folder-open"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.emptyTitle}</h2>
        <p className="text-slate-500 mt-3 text-lg font-medium">{t.emptySub}</p>
        <button
          className="mt-10 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-[0_18px_34px_-20px_rgba(37,99,235,0.52)] hover:bg-blue-700 transition-all active:scale-95"
          onClick={() => onNewDoc()}
        >
          {t.newInvoice || copy.createNew}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-[1380px]">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <button
              onClick={() => onNewDoc()}
              className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-[0_20px_34px_-22px_rgba(37,99,235,0.62)] transition-all hover:bg-blue-700 sm:w-auto"
            >
              <i className="fas fa-plus mr-2 text-xs"></i>
              <span>{t.newInvoice || copy.createNew}</span>
            </button>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
              <div className="relative w-full sm:w-80">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50"
                />
              </div>
              <div className="relative w-full shrink-0 sm:w-[11rem]">
                <i className="fas fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    const nextValue = e.target.value === 'all' ? 'all' : Number(e.target.value);
                    setSelectedMonth(nextValue);
                    setCurrentPage(1);
                  }}
                  className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-bold text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50"
                  aria-label={copy.monthFilter}
                >
                  <option value="all">{copy.allMonths}</option>
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none"></i>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white shadow-[0_22px_50px_-36px_rgba(15,23,42,0.28)]">
            {filteredRecords.length === 0 ? (
              <div className="px-8 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <i className="fas fa-calendar-days text-lg"></i>
                </div>
                <h3 className="mt-5 text-xl font-black tracking-tight text-slate-900">{copy.emptyFilteredTitle}</h3>
                <p className="mt-2 text-sm font-medium text-slate-500">{copy.emptyFilteredDesc}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-slate-50/90">
                      <th className="px-7 py-5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {t.colClient || 'CLIENT'}
                      </th>
                      <th className="px-6 py-5 text-right text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {t.colAmount || 'TOTAL AMOUNT'}
                      </th>
                      <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {copy.idLabel}
                      </th>
                      <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {t.colDate || 'ISSUE DATE'}
                      </th>
                      <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {copy.statusLabel}
                      </th>
                      <th className="px-7 py-5 text-right text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {copy.actionsLabel}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record) => {
                      const statusMeta = getStatusMeta(record.status);

                      return (
                        <tr key={record.id} className="transition-colors hover:bg-slate-50/70">
                          <td className="border-t border-slate-100 px-7 py-6">
                            <div className="max-w-[22rem] truncate text-[15px] font-bold text-slate-900">
                              {record.client.name || copy.untitledClient}
                            </div>
                          </td>
                          <td className="border-t border-slate-100 px-6 py-6 text-right">
                            <span className="text-[15px] font-black tracking-tight text-slate-900">
                              {formatAmount(record)}
                            </span>
                          </td>
                          <td className="border-t border-slate-100 px-6 py-6">
                            <span className="text-[15px] font-black tracking-tight text-slate-800">
                              {record.invoiceNumber}
                            </span>
                          </td>
                          <td className="border-t border-slate-100 px-6 py-6">
                            <span className="text-sm font-bold text-slate-500">
                              {formatDate(record.date)}
                            </span>
                          </td>
                          <td className="border-t border-slate-100 px-6 py-6">
                            <span className={`inline-flex min-w-[4.75rem] items-center justify-center rounded-md px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${statusMeta.className}`}>
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="border-t border-slate-100 px-7 py-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setShareInvoice(record)}
                                title={copy.share}
                                aria-label={copy.share}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                              >
                                <i className="fas fa-share-alt text-xs"></i>
                              </button>
                              <button
                                onClick={() => setEmailInvoice(record)}
                                title={copy.email}
                                aria-label={copy.email}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                              >
                                <i className="fas fa-envelope text-xs"></i>
                              </button>
                              <button
                                onClick={() => onEdit(record)}
                                title={copy.editAction}
                                aria-label={copy.editAction}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                              >
                                <i className="fas fa-pen-to-square text-xs"></i>
                              </button>
                              <button
                                onClick={() => onDuplicate(record)}
                                title={copy.duplicate}
                                aria-label={copy.duplicate}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                              >
                                <i className="fas fa-copy text-xs"></i>
                              </button>
                              <button
                                onClick={() => onExport(record)}
                                title={copy.exportAction}
                                aria-label={copy.exportAction}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                              >
                                <i className="fas fa-download text-xs"></i>
                              </button>
                              <button
                                onClick={() => {
                                  if (isDeletingId === record.id) return;
                                  setDeleteInvoice(record);
                                }}
                                disabled={isDeletingId === record.id}
                                title={copy.deleteAction}
                                aria-label={copy.deleteAction}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                  isDeletingId === record.id
                                    ? 'text-rose-400'
                                    : 'text-rose-300 hover:bg-rose-50 hover:text-rose-600'
                                }`}
                              >
                                <i className={`fas ${isDeletingId === record.id ? 'fa-spinner fa-spin' : 'fa-trash'} text-xs`}></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {filteredRecords.length > 0 && (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[16px] text-slate-500">
                {t.showingRecords
                  .replace('{start}', startRecord.toString())
                  .replace('{end}', endRecord.toString())
                  .replace('{count}', filteredRecords.length.toString())
                }
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                      currentPage === page
                        ? 'border-blue-600 bg-blue-600 text-white shadow-[0_14px_26px_-18px_rgba(37,99,235,0.52)]'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {shareInvoice && (
        <ShareDialog
          invoice={shareInvoice}
          isOpen={true}
          onClose={() => setShareInvoice(null)}
          lang={lang}
        />
      )}

      {emailInvoice && (
        <EmailDialog
          invoice={emailInvoice}
          isOpen={true}
          onClose={() => setEmailInvoice(null)}
          lang={lang}
        />
      )}

      {deleteInvoice && (
        <DeleteConfirmDialog
          isOpen={true}
          onClose={() => {
            if (isDeletingId === deleteInvoice.id) return;
            setDeleteInvoice(null);
          }}
          onConfirm={handleDeleteConfirm}
          title={t.deleteDialogTitle}
          description={t.deleteDialogDescription}
          confirmText={t.deleteDialogConfirm}
          cancelText={t.deleteDialogCancel}
          isDeleting={isDeletingId === deleteInvoice.id}
          itemName={deleteInvoice.invoiceNumber}
        />
      )}
    </>
  );
};

export default RecordsView;
