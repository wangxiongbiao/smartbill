import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Invoice, Language } from '../types';
import { translations } from '../i18n';
import ShareDialog from './ShareDialog';
import EmailDialog from './EmailDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { calculateInvoiceTotal } from '@/lib/invoice';
import { getInvoiceDisplayStatus } from '@/lib/invoice-status';
import { getLocaleForLanguage } from '@/lib/language';
import type { RecordsViewState } from '@/components/app/app-shell.types';
import { buildPaginationItems } from '@/lib/pagination';

interface RecordsViewProps {
  records: Invoice[];
  totalCount?: number;
  paginationMode?: 'client' | 'server';
  isPageLoading?: boolean;
  viewState: RecordsViewState;
  onViewStateChange: React.Dispatch<React.SetStateAction<RecordsViewState>>;
  onEdit: (record: Invoice) => void;
  onDuplicate: (record: Invoice) => void | Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDeleteMany?: (ids: string[]) => Promise<void>;
  onUpdateStatus: (id: string, status: Invoice['status']) => Promise<void>;
  onExport: (record: Invoice) => void;
  lang: Language;
  onNewDoc: () => void;
  isDeletingId?: string | null;
}

const RecordsView: React.FC<RecordsViewProps> = ({ records, totalCount, paginationMode = 'client', isPageLoading = false, viewState, onViewStateChange, onEdit, onDuplicate, onDelete, onDeleteMany, onUpdateStatus, onExport, lang, onNewDoc, isDeletingId }) => {
  const t = translations[lang] || translations['en'];
  const [shareInvoice, setShareInvoice] = useState<Invoice | null>(null);
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
  const [deleteInvoice, setDeleteInvoice] = useState<Invoice | null>(null);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(viewState.currentPage);
  const [pageJumpValue, setPageJumpValue] = useState(String(viewState.currentPage));
  const [pageSize, setPageSize] = useState(viewState.pageSize);
  const [searchQuery, setSearchQuery] = useState(viewState.searchQuery);
  const [selectedMonth, setSelectedMonth] = useState<'all' | number>(viewState.selectedMonth);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const scrollTopRef = useRef(viewState.scrollTop);
  const tableScrollCommitTimerRef = useRef<number | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isServerPaginated = paginationMode === 'server';

  const copyByLang = {
    en: {
      createNew: 'Create New',
      untitledClient: 'Untitled Client',
      edit: 'Edit',
      duplicate: 'Duplicate',
      export: 'Export',
      processing: 'Processing...',
      syncing: 'Syncing with cloud...',
      pageLoading: 'Loading invoices...',
      monthFilter: 'Month',
      allMonths: 'All months',
      emptyFilteredTitle: 'No matching invoices',
      emptyFilteredDesc: 'Try another month or clear the search keyword.',
      idLabel: 'ID',
      statusLabel: 'Status',
      actionsLabel: 'Actions',
      pending: 'Pending',
      overdue: 'Overdue',
      paid: 'Paid',
      markPaid: 'Mark as paid',
      cancelPaid: 'Cancel paid',
      share: 'Share',
      email: 'Email',
      editAction: 'Edit',
      exportAction: 'Export',
      deleteAction: 'Delete',
      chooseStatus: 'Choose status',
      statusPendingHint: 'Waiting for payment',
      statusPaidHint: 'Payment received',
      selectAll: 'Select all invoices on this page',
      selectInvoice: 'Select invoice',
      clearSelection: 'Clear selection',
      selectedCount: (count: number) => `${count} selected`,
      deleteSelected: 'Delete selected',
      deleteSelectedTitle: 'Delete selected invoices?',
      deleteSelectedDescription: 'Are you sure you want to delete {item} selected invoices? This action cannot be undone.',
      selectedForDelete: (count: number) => `${count} invoices`,
      pageSizeLabel: 'Rows per page',
      perPage: 'per page',
      jumpToLabel: 'Jump to',
      jumpToPlaceholder: 'Page',
      jumpGo: 'Go',
    },
    'zh-CN': {
      createNew: '创建新发票',
      untitledClient: '未命名客户',
      edit: '编辑',
      duplicate: '复制',
      export: '导出',
      processing: '处理中...',
      syncing: '正在与云端同步...',
      pageLoading: '正在加载发票...',
      monthFilter: '月份',
      allMonths: '全部月份',
      emptyFilteredTitle: '没有符合条件的发票',
      emptyFilteredDesc: '试试其他月份，或清空搜索关键词。',
      idLabel: '编号',
      statusLabel: '状态',
      actionsLabel: '操作',
      pending: '待付',
      overdue: '逾期',
      paid: '已付',
      markPaid: '标记为已付',
      cancelPaid: '取消已付',
      share: '分享',
      email: '邮件',
      editAction: '编辑',
      exportAction: '导出',
      deleteAction: '删除',
      chooseStatus: '选择状态',
      statusPendingHint: '等待收款',
      statusPaidHint: '已收到款项',
      selectAll: '选择当前页全部发票',
      selectInvoice: '选择发票',
      clearSelection: '清空选择',
      selectedCount: (count: number) => `已选 ${count} 项`,
      deleteSelected: '删除选中',
      deleteSelectedTitle: '确定删除选中的发票？',
      deleteSelectedDescription: '确定要删除已选发票 {item} 吗？此操作无法恢复。',
      selectedForDelete: (count: number) => `${count} 张`,
      pageSizeLabel: '每页条数',
      perPage: '条/页',
      jumpToLabel: '跳转到',
      jumpToPlaceholder: '页码',
      jumpGo: '跳转',
    },
    'zh-TW': {
      createNew: '建立新發票',
      untitledClient: '未命名客戶',
      edit: '編輯',
      duplicate: '複製',
      export: '匯出',
      processing: '處理中...',
      syncing: '正在與雲端同步...',
      pageLoading: '正在載入發票...',
      monthFilter: '月份',
      allMonths: '全部月份',
      emptyFilteredTitle: '沒有符合條件的發票',
      emptyFilteredDesc: '試試其他月份，或清空搜尋關鍵字。',
      idLabel: '編號',
      statusLabel: '狀態',
      actionsLabel: '操作',
      pending: '待付',
      overdue: '逾期',
      paid: '已付',
      markPaid: '標記為已付',
      cancelPaid: '取消已付',
      share: '分享',
      email: '郵件',
      editAction: '編輯',
      exportAction: '匯出',
      deleteAction: '刪除',
      chooseStatus: '選擇狀態',
      statusPendingHint: '等待收款',
      statusPaidHint: '已收到款項',
      selectAll: '選擇本頁全部發票',
      selectInvoice: '選擇發票',
      clearSelection: '清空選擇',
      selectedCount: (count: number) => `已選 ${count} 項`,
      deleteSelected: '刪除已選',
      deleteSelectedTitle: '確定刪除已選發票？',
      deleteSelectedDescription: '確定要刪除已選發票 {item} 嗎？此操作無法復原。',
      selectedForDelete: (count: number) => `${count} 張`,
      pageSizeLabel: '每頁條數',
      perPage: '條/頁',
      jumpToLabel: '跳轉到',
      jumpToPlaceholder: '頁碼',
      jumpGo: '跳轉',
    },
    th: {
      createNew: 'สร้างใหม่',
      untitledClient: 'ลูกค้าไม่มีชื่อ',
      edit: 'แก้ไข',
      duplicate: 'ทำซ้ำ',
      export: 'ส่งออก',
      processing: 'กำลังประมวลผล...',
      syncing: 'กำลังซิงก์กับคลาวด์...',
      pageLoading: 'กำลังโหลดใบแจ้งหนี้...',
      monthFilter: 'เดือน',
      allMonths: 'ทุกเดือน',
      emptyFilteredTitle: 'ไม่พบใบแจ้งหนี้ที่ตรงเงื่อนไข',
      emptyFilteredDesc: 'ลองเลือกเดือนอื่น หรือล้างคำค้นหา',
      idLabel: 'รหัส',
      statusLabel: 'สถานะ',
      actionsLabel: 'การทำงาน',
      pending: 'ค้างชำระ',
      overdue: 'เกินกำหนด',
      paid: 'ชำระแล้ว',
      markPaid: 'ทำเครื่องหมายว่าชำระแล้ว',
      cancelPaid: 'ยกเลิกสถานะชำระแล้ว',
      share: 'แชร์',
      email: 'อีเมล',
      editAction: 'แก้ไข',
      exportAction: 'ส่งออก',
      deleteAction: 'ลบ',
      chooseStatus: 'เลือกสถานะ',
      statusPendingHint: 'รอการชำระเงิน',
      statusPaidHint: 'ได้รับชำระแล้ว',
      selectAll: 'เลือกใบแจ้งหนี้ทั้งหมดในหน้านี้',
      selectInvoice: 'เลือกใบแจ้งหนี้',
      clearSelection: 'ล้างการเลือก',
      selectedCount: (count: number) => `เลือกแล้ว ${count} รายการ`,
      deleteSelected: 'ลบที่เลือก',
      deleteSelectedTitle: 'ลบใบแจ้งหนี้ที่เลือก?',
      deleteSelectedDescription: 'คุณแน่ใจหรือไม่ว่าต้องการลบใบแจ้งหนี้ที่เลือก {item} การดำเนินการนี้ไม่สามารถยกเลิกได้',
      selectedForDelete: (count: number) => `${count} รายการ`,
      pageSizeLabel: 'จำนวนต่อหน้า',
      perPage: 'รายการ/หน้า',
      jumpToLabel: 'ไปที่หน้า',
      jumpToPlaceholder: 'หน้า',
      jumpGo: 'ไป',
    },
    id: {
      createNew: 'Buat baru',
      untitledClient: 'Klien tanpa nama',
      edit: 'Edit',
      duplicate: 'Duplikat',
      export: 'Ekspor',
      processing: 'Memproses...',
      syncing: 'Menyinkronkan dengan cloud...',
      pageLoading: 'Memuat invoice...',
      monthFilter: 'Bulan',
      allMonths: 'Semua bulan',
      emptyFilteredTitle: 'Tidak ada invoice yang cocok',
      emptyFilteredDesc: 'Coba bulan lain atau hapus kata kunci pencarian.',
      idLabel: 'ID',
      statusLabel: 'Status',
      actionsLabel: 'Aksi',
      pending: 'Belum bayar',
      overdue: 'Terlambat',
      paid: 'Lunas',
      markPaid: 'Tandai lunas',
      cancelPaid: 'Batalkan lunas',
      share: 'Bagikan',
      email: 'Email',
      editAction: 'Edit',
      exportAction: 'Ekspor',
      deleteAction: 'Hapus',
      chooseStatus: 'Pilih status',
      statusPendingHint: 'Menunggu pembayaran',
      statusPaidHint: 'Pembayaran diterima',
      selectAll: 'Pilih semua invoice di halaman ini',
      selectInvoice: 'Pilih invoice',
      clearSelection: 'Bersihkan pilihan',
      selectedCount: (count: number) => `${count} dipilih`,
      deleteSelected: 'Hapus terpilih',
      deleteSelectedTitle: 'Hapus invoice terpilih?',
      deleteSelectedDescription: 'Anda yakin ingin menghapus {item} invoice terpilih? Tindakan ini tidak dapat dibatalkan.',
      selectedForDelete: (count: number) => `${count} invoice`,
      pageSizeLabel: 'Baris per halaman',
      perPage: 'per halaman',
      jumpToLabel: 'Loncat ke',
      jumpToPlaceholder: 'Halaman',
      jumpGo: 'Pergi',
    },
  } satisfies Record<Language, {
    createNew: string;
    untitledClient: string;
    edit: string;
    duplicate: string;
    export: string;
    processing: string;
    syncing: string;
    pageLoading: string;
    monthFilter: string;
    allMonths: string;
    emptyFilteredTitle: string;
    emptyFilteredDesc: string;
    idLabel: string;
    statusLabel: string;
    actionsLabel: string;
    pending: string;
    overdue: string;
    paid: string;
    markPaid: string;
    cancelPaid: string;
    share: string;
    email: string;
    editAction: string;
    exportAction: string;
    deleteAction: string;
    chooseStatus: string;
    statusPendingHint: string;
    statusPaidHint: string;
    selectAll: string;
    selectInvoice: string;
    clearSelection: string;
    selectedCount: (count: number) => string;
    deleteSelected: string;
    deleteSelectedTitle: string;
    deleteSelectedDescription: string;
    selectedForDelete: (count: number) => string;
    pageSizeLabel: string;
    perPage: string;
    jumpToLabel: string;
    jumpToPlaceholder: string;
    jumpGo: string;
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
    if (isServerPaginated) return records;

    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        !normalizedQuery ||
        record.invoiceNumber.toLowerCase().includes(normalizedQuery) ||
        record.client.name.toLowerCase().includes(normalizedQuery);

      const parsedDate = new Date(record.date);
      const recordMonth = Number.isNaN(parsedDate.getTime()) ? null : parsedDate.getMonth() + 1;
      const matchesMonth = selectedMonth === 'all' || recordMonth === selectedMonth;

      return matchesSearch && matchesMonth;
    });
  }, [deferredSearchQuery, isServerPaginated, records, selectedMonth]);

  const pageSizeOptions = [6, 12, 24, 48];
  const effectivePageSize = Math.max(1, pageSize);
  const effectiveTotalCount = isServerPaginated ? (totalCount ?? records.length) : filteredRecords.length;
  const totalPages = Math.ceil(effectiveTotalCount / effectivePageSize);
  const page = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const currentRecords = isServerPaginated
    ? records
    : filteredRecords.slice(
      (page - 1) * effectivePageSize,
      page * effectivePageSize
    );

  const startRecord = effectiveTotalCount === 0 ? 0 : (page - 1) * effectivePageSize + 1;
  const endRecord = Math.min(page * effectivePageSize, effectiveTotalCount);
  const paginationItems = useMemo(
    () => buildPaginationItems({ totalPages, currentPage: page, siblingCount: 1, boundaryCount: 1 }),
    [page, totalPages]
  );
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedMonth !== 'all';
  const currentRecordIds = useMemo(() => currentRecords.map((record) => record.id), [currentRecords]);
  const selectedRecordIdSet = useMemo(() => new Set(selectedRecordIds), [selectedRecordIds]);
  const allCurrentPageSelected = currentRecords.length > 0 && currentRecords.every((record) => selectedRecordIdSet.has(record.id));
  const someCurrentPageSelected = currentRecords.some((record) => selectedRecordIdSet.has(record.id)) && !allCurrentPageSelected;

  const handleDeleteConfirm = async () => {
    if (!deleteInvoice || isDeletingId === deleteInvoice.id) return;

    try {
      await onDelete(deleteInvoice.id);
      setSelectedRecordIds((prev) => prev.filter((id) => id !== deleteInvoice.id));
      setDeleteInvoice(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleBatchDeleteConfirm = async () => {
    if (selectedRecordIds.length === 0 || isBatchDeleting) return;

    setIsBatchDeleting(true);
    try {
      if (onDeleteMany) {
        await onDeleteMany(selectedRecordIds);
      } else {
        for (const id of selectedRecordIds) {
          await onDelete(id);
        }
      }
      setSelectedRecordIds([]);
      setIsBatchDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting selected invoices:', error);
    } finally {
      setIsBatchDeleting(false);
    }
  };

  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecordIds((prev) => (
      prev.includes(recordId)
        ? prev.filter((id) => id !== recordId)
        : [...prev, recordId]
    ));
  };

  const handleToggleSelectAllCurrentPage = () => {
    if (allCurrentPageSelected) {
      setSelectedRecordIds([]);
      return;
    }

    setSelectedRecordIds(currentRecordIds);
  };

  const goToPage = (value: number) => {
    if (!Number.isFinite(value)) return;
    const maxPage = Math.max(totalPages, 1);
    const nextPage = Math.min(Math.max(Math.trunc(value), 1), maxPage);
    setCurrentPage(nextPage);
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

  const getStatusMeta = (record: Invoice) => {
    const displayStatus = getInvoiceDisplayStatus(record);

    switch (displayStatus) {
      case 'paid':
        return {
          key: displayStatus,
          label: copy.paid,
          className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
        };
      case 'overdue':
        return {
          key: displayStatus,
          label: copy.overdue,
          className: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
        };
      default:
        return {
          key: displayStatus,
          label: copy.pending,
          className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
        };
    }
  };

  const handleStatusUpdate = async (record: Invoice, nextStatus: Invoice['status']) => {
    if (statusUpdatingId === record.id) return;

    setStatusUpdatingId(record.id);
    setOpenStatusMenuId(null);
    try {
      await onUpdateStatus(record.id, nextStatus);
    } catch (error) {
      console.error('Error updating invoice status:', error);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  useEffect(() => {
    setCurrentPage((prevPage) => {
      const maxPage = Math.max(totalPages, 1);
      return prevPage > maxPage ? maxPage : prevPage;
    });
  }, [totalPages]);

  useEffect(() => {
    setPageJumpValue(String(page));
  }, [page]);

  useEffect(() => {
    setSearchQuery((prev) => (prev === viewState.searchQuery ? prev : viewState.searchQuery));
    setSelectedMonth((prev) => (prev === viewState.selectedMonth ? prev : viewState.selectedMonth));
    setCurrentPage((prev) => (prev === viewState.currentPage ? prev : viewState.currentPage));
    setPageSize((prev) => (prev === viewState.pageSize ? prev : viewState.pageSize));
    scrollTopRef.current = viewState.scrollTop;
  }, [viewState]);

  useEffect(() => {
    if (!openStatusMenuId) return;

    const handleClose = () => setOpenStatusMenuId(null);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenStatusMenuId(null);
    };

    document.addEventListener('click', handleClose);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClose);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openStatusMenuId]);

  useEffect(() => {
    if (!selectAllCheckboxRef.current) return;
    selectAllCheckboxRef.current.indeterminate = someCurrentPageSelected;
  }, [someCurrentPageSelected]);

  useEffect(() => {
    const currentIdSet = new Set(currentRecordIds);
    setSelectedRecordIds((prev) => {
      const next = prev.filter((id) => currentIdSet.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [currentRecordIds]);

  useEffect(() => {
    if (isBatchDeleting) return;
    if (selectedRecordIds.length > 0) return;
    if (!isBatchDeleteDialogOpen) return;
    setIsBatchDeleteDialogOpen(false);
  }, [isBatchDeleteDialogOpen, isBatchDeleting, selectedRecordIds.length]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (!tableScrollRef.current) return;
      if (Math.abs(tableScrollRef.current.scrollTop - viewState.scrollTop) < 1) return;
      tableScrollRef.current.scrollTop = viewState.scrollTop;
    });
  }, [viewState.scrollTop]);

  useEffect(() => () => {
    if (tableScrollCommitTimerRef.current !== null) {
      window.clearTimeout(tableScrollCommitTimerRef.current);
      tableScrollCommitTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    onViewStateChange((prev) => {
      if (
        prev.searchQuery === searchQuery &&
        prev.selectedMonth === selectedMonth &&
        prev.currentPage === page &&
        prev.pageSize === pageSize &&
        prev.scrollTop === scrollTopRef.current
      ) {
        return prev;
      }

      return {
        searchQuery,
        selectedMonth,
        currentPage: page,
        pageSize,
        scrollTop: scrollTopRef.current,
        shellScrollTop: prev.shellScrollTop,
      };
    });
  }, [onViewStateChange, page, pageSize, searchQuery, selectedMonth]);

  if (effectiveTotalCount === 0 && !hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <div className="bg-slate-100 w-28 h-28 rounded-[2rem] flex items-center justify-center text-slate-300 text-5xl mb-8 shadow-inner rotate-3">
          <i className="fas fa-folder-open"></i>
        </div>
        <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">{t.emptyTitle}</h2>
        <p className="text-slate-500 mt-3 text-lg font-medium">{t.emptySub}</p>
        <button
          className="mt-10 bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-[0_1.125rem_2.125rem_-1.25rem_rgba(37,99,235,0.52)] hover:bg-blue-700 transition-all active:scale-95"
          onClick={() => onNewDoc()}
        >
          {t.newInvoice || copy.createNew}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 py-6 md:px-8 md:py-8">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[86.25rem] flex-col">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <button
              onClick={() => onNewDoc()}
              className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_1.25rem_2.125rem_-1.375rem_rgba(37,99,235,0.62)] transition-all hover:bg-blue-700 sm:w-auto"
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
                  className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50"
                  aria-label={copy.monthFilter}
                >
                  <option value="all">{copy.allMonths}</option>
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[0.625rem] text-slate-400 pointer-events-none"></i>
              </div>
            </div>
          </div>

          {selectedRecordIds.length > 0 ? (
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold text-rose-700">{copy.selectedCount(selectedRecordIds.length)}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecordIds([])}
                  className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50"
                >
                  {copy.clearSelection}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBatchDeleteDialogOpen(true)}
                  disabled={isBatchDeleting}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <i className={`fas ${isBatchDeleting ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                  <span>{copy.deleteSelected}</span>
                </button>
              </div>
            </div>
          ) : null}

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white shadow-[0_1.375rem_3.125rem_-2.25rem_rgba(15,23,42,0.28)]">
            {effectiveTotalCount === 0 ? (
              <div className="px-8 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <i className="fas fa-calendar-days text-lg"></i>
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">{copy.emptyFilteredTitle}</h3>
                <p className="mt-2 text-sm font-medium text-slate-500">{copy.emptyFilteredDesc}</p>
              </div>
            ) : (
              <div className="flex h-full min-h-0 flex-col overflow-hidden">
                <div
                  ref={tableScrollRef}
                  onScroll={() => {
                    const nextScrollTop = tableScrollRef.current?.scrollTop ?? 0;
                    scrollTopRef.current = nextScrollTop;
                    if (tableScrollCommitTimerRef.current !== null) {
                      window.clearTimeout(tableScrollCommitTimerRef.current);
                    }
                    tableScrollCommitTimerRef.current = window.setTimeout(() => {
                      tableScrollCommitTimerRef.current = null;
                      onViewStateChange((prev) => (
                        prev.scrollTop === scrollTopRef.current ? prev : { ...prev, scrollTop: scrollTopRef.current }
                      ));
                    }, 120);
                  }}
                  className="min-h-0 flex-1 overflow-auto"
                >
                  <table className="min-w-[64rem] w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80">
                        <th className="px-4 py-5 text-center">
                          <input
                            ref={selectAllCheckboxRef}
                            type="checkbox"
                            checked={allCurrentPageSelected}
                            onChange={handleToggleSelectAllCurrentPage}
                            disabled={currentRecords.length === 0 || isBatchDeleting || isPageLoading}
                            aria-label={copy.selectAll}
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </th>
                        <th className="px-7 py-5 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {t.colClient || 'CLIENT'}
                        </th>
                        <th className="px-6 py-5 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {t.colAmount || 'TOTAL AMOUNT'}
                        </th>
                        <th className="px-6 py-5 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {copy.idLabel}
                        </th>
                        <th className="px-6 py-5 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {t.colDate || 'ISSUE DATE'}
                        </th>
                        <th className="px-6 py-5 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {copy.statusLabel}
                        </th>
                        <th className="px-7 py-5 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {copy.actionsLabel}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((record) => {
                        const statusMeta = getStatusMeta(record);
                        const isStatusMenuOpen = openStatusMenuId === record.id;
                        const isStatusUpdating = statusUpdatingId === record.id;
                        const statusOptions = [
                          {
                            key: 'pending',
                            label: copy.pending,
                            hint: copy.statusPendingHint,
                            nextStatus: 'Pending' as Invoice['status'],
                            icon: 'fa-clock',
                            className: 'border-amber-200 bg-amber-50/80 text-amber-700',
                            active: statusMeta.key === 'pending' || statusMeta.key === 'overdue',
                          },
                          {
                            key: 'paid',
                            label: copy.paid,
                            hint: copy.statusPaidHint,
                            nextStatus: 'Paid' as Invoice['status'],
                            icon: 'fa-circle-check',
                            className: 'border-emerald-200 bg-emerald-50/80 text-emerald-700',
                            active: statusMeta.key === 'paid',
                          },
                        ];

                        return (
                          <tr key={record.id} className="transition-colors hover:bg-slate-50/70">
                            <td className="border-t border-slate-100 px-4 py-6 text-center">
                              <input
                                type="checkbox"
                                checked={selectedRecordIdSet.has(record.id)}
                                onChange={() => toggleRecordSelection(record.id)}
                                disabled={isBatchDeleting || isPageLoading}
                                aria-label={`${copy.selectInvoice}: ${record.invoiceNumber}`}
                                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                              />
                            </td>
                            <td className="border-t border-slate-100 px-7 py-6">
                              <div className="max-w-[22rem] truncate text-[0.9375rem] font-semibold text-slate-900">
                                {record.client.name || copy.untitledClient}
                              </div>
                            </td>
                            <td className="border-t border-slate-100 px-6 py-6 text-center">
                              <span className="text-[0.9375rem] font-semibold tracking-tight text-slate-900">
                                {formatAmount(record)}
                              </span>
                            </td>
                            <td className="border-t border-slate-100 px-6 py-6 text-center">
                              <span className="text-[0.9375rem] font-semibold tracking-tight text-slate-800">
                                {record.invoiceNumber}
                              </span>
                            </td>
                            <td className="border-t border-slate-100 px-6 py-6 text-center">
                              <span className="text-sm font-semibold text-slate-500">
                                {formatDate(record.date)}
                              </span>
                            </td>
                            <td className="border-t border-slate-100 px-6 py-6 text-center align-top">
                              <div className="relative inline-flex flex-col items-center" onClick={(event) => event.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    if (isStatusUpdating) return;
                                    setOpenStatusMenuId((prev) => (prev === record.id ? null : record.id));
                                  }}
                                  disabled={isStatusUpdating}
                                  aria-haspopup="menu"
                                  aria-expanded={isStatusMenuOpen}
                                  className={`group inline-flex min-w-[8.75rem] items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-70 ${statusMeta.className}`}
                                >
                                  <span className="flex items-center gap-2">
                                    {isStatusUpdating ? <i className="fas fa-spinner animate-spin text-[0.6875rem]"></i> : <span className="h-2 w-2 rounded-full bg-current opacity-80"></span>}
                                    <span>{statusMeta.label}</span>
                                  </span>
                                  <i className={`fas fa-chevron-down text-[0.5625rem] transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`}></i>
                                </button>

                                {isStatusMenuOpen ? (
                                  <div
                                    role="menu"
                                    className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-2 text-left shadow-[0_1.375rem_2.625rem_-1.5rem_rgba(15,23,42,0.28)]"
                                  >
                                    <div className="px-2 pb-2 pt-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                      {copy.chooseStatus}
                                    </div>
                                    <div className="space-y-1">
                                      {statusOptions.map((option) => (
                                        <button
                                          key={option.key}
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            void handleStatusUpdate(record, option.nextStatus);
                                          }}
                                          role="menuitem"
                                          className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 transition-all ${option.active ? option.className : 'border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-slate-100'}`}
                                        >
                                          <span className="flex items-center gap-3">
                                            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${option.active ? 'bg-white/80' : 'bg-white'} shadow-sm`}>
                                              <i className={`fas ${option.icon} text-[0.8125rem]`}></i>
                                            </span>
                                            <span className="flex flex-col items-start">
                                              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]">{option.label}</span>
                                              <span className="text-[0.6875rem] font-medium normal-case tracking-normal opacity-70">{option.hint}</span>
                                            </span>
                                          </span>
                                          {option.active ? <i className="fas fa-check text-[0.6875rem]"></i> : null}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </td>
                            <td className="border-t border-slate-100 px-7 py-6">
                              <div className="flex items-center justify-center gap-1.5">
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
              </div>
            )}

            {isPageLoading ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/72 backdrop-blur-[2px]">
                <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-600 shadow-[0_1rem_2.25rem_-1.75rem_rgba(15,23,42,0.35)]">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></span>
                  <span>{copy.pageLoading}</span>
                </div>
              </div>
            ) : null}
          </div>

          {effectiveTotalCount > 0 && (
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-[1rem] text-slate-500 whitespace-nowrap">
                {t.showingRecords
                  .replace('{start}', startRecord.toString())
                  .replace('{end}', endRecord.toString())
                  .replace('{count}', effectiveTotalCount.toString())
                }
              </span>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 whitespace-nowrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isPageLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>

                {paginationItems.map((item, index) => (
                  item === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-10 w-10 items-center justify-center text-sm font-semibold text-slate-300"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      disabled={isPageLoading}
                      aria-current={page === item ? 'page' : undefined}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-2 text-sm font-semibold transition-all ${
                        page === item
                          ? 'border-blue-600 bg-blue-600 text-white shadow-[0_0.875rem_1.625rem_-1.125rem_rgba(37,99,235,0.52)]'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {item}
                    </button>
                  )
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isPageLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>

                <span className="mx-1 h-5 w-px bg-slate-200"></span>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!pageJumpValue.trim()) return;
                    goToPage(Number(pageJumpValue));
                  }}
                  className="flex items-center gap-2"
                >
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {copy.jumpToLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(totalPages, 1)}
                    value={pageJumpValue}
                    onChange={(e) => setPageJumpValue(e.target.value)}
                    disabled={isPageLoading}
                    placeholder={copy.jumpToPlaceholder}
                    className="h-9 w-[5.5rem] rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isPageLoading}
                    className="h-9 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copy.jumpGo}
                  </button>
                </form>

                <span className="mx-1 h-5 w-px bg-slate-200"></span>

                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {copy.pageSizeLabel}
                </label>
                <select
                  value={effectivePageSize}
                  onChange={(e) => {
                    const nextPageSize = Number(e.target.value);
                    if (!Number.isFinite(nextPageSize)) return;
                    setPageSize(nextPageSize);
                    setCurrentPage(1);
                  }}
                  disabled={isPageLoading}
                  className="h-9 min-w-[7.25rem] rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size} {copy.perPage}
                    </option>
                  ))}
                </select>
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

      {isBatchDeleteDialogOpen && (
        <DeleteConfirmDialog
          isOpen={true}
          onClose={() => {
            if (isBatchDeleting) return;
            setIsBatchDeleteDialogOpen(false);
          }}
          onConfirm={handleBatchDeleteConfirm}
          title={copy.deleteSelectedTitle}
          description={copy.deleteSelectedDescription}
          confirmText={t.deleteDialogConfirm}
          cancelText={t.deleteDialogCancel}
          isDeleting={isBatchDeleting}
          itemName={copy.selectedForDelete(selectedRecordIds.length)}
        />
      )}
    </>
  );
};

export default RecordsView;
