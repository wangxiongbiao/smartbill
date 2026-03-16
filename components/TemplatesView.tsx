import React, { useMemo, useState } from 'react';
import { TEMPLATE_TYPE_OPTIONS } from '@/lib/template-types';
import { translations } from '../i18n';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import InvoicePreview from './InvoicePreview';
import ScalableInvoiceContainer from './ScalableInvoiceContainer';
import { buildPublicTemplatePreviewInvoice } from '@/lib/public-templates';
import type { InvoiceTemplate, Language, TemplateCategory } from '../types';
import { buildPaginationItems, TEMPLATES_PAGE_SIZE } from '@/lib/pagination';

interface TemplatesViewProps {
  lang: Language;
  templates: InvoiceTemplate[];
  totalCount?: number;
  overallCount?: number;
  activeCategory: TemplateCategory;
  currentPage: number;
  loading?: boolean;
  isPageLoading?: boolean;
  onUseTemplate: (template: InvoiceTemplate) => void | Promise<void>;
  onViewDetail: (template: InvoiceTemplate) => void;
  onDeleteTemplate?: (template: InvoiceTemplate) => Promise<void>;
  onNewDoc: () => void | Promise<void>;
  onActiveCategoryChange: (category: TemplateCategory) => void;
  onCurrentPageChange: (page: number) => void;
}

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return 'SB';
  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

function TemplatePreviewCard({
  template,
  lang,
  using,
  deleting,
  useLabel,
  deleteLabel,
  viewLabel,
  onOpen,
  onUse,
  onDelete,
}: {
  template: InvoiceTemplate;
  lang: Language;
  using: boolean;
  deleting: boolean;
  useLabel: string;
  deleteLabel: string;
  viewLabel: string;
  onOpen: () => void;
  onUse: () => void;
  onDelete: () => void;
}) {
  const previewInvoice = useMemo(() => buildPublicTemplatePreviewInvoice(template), [template]);
  const creatorName =
    template.template_data.sender?.name ||
    template.template_data.client?.name ||
    'SmartBill';

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      className="group outline-none"
    >
      <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-100">
        <div className="overflow-hidden rounded-[1.75rem]">
          <ScalableInvoiceContainer baseWidth={794} className="pointer-events-none select-none">
            <div className="w-[49.625rem]">
              <InvoicePreview
                invoice={previewInvoice}
                template={previewInvoice.template || 'minimalist'}
                isHeaderReversed={previewInvoice.isHeaderReversed}
                lang={lang}
              />
            </div>
          </ScalableInvoiceContainer>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.26)_100%)] opacity-0 transition-all duration-250 group-hover:opacity-100" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 opacity-0 transition-all duration-250 group-hover:opacity-100">
          <div className="pointer-events-auto flex w-full max-w-[20rem] translate-y-2 flex-col gap-3 transition-transform duration-250 group-hover:translate-y-0">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onUse();
              }}
              disabled={using}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-semibold text-white shadow-[0_1.25rem_2.8125rem_-1.5rem_rgba(37,99,235,0.52)] transition-all hover:scale-[1.01] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {using ? <i className="fas fa-spinner animate-spin text-[0.75rem]"></i> : <i className="fas fa-plus text-[0.75rem]"></i>}
              <span>{useLabel}</span>
            </button>

            <div className="grid grid-cols-2 gap-3 rounded-[1.5rem] bg-slate-950/58 p-2 shadow-[0_1rem_2.5rem_-1.75rem_rgba(15,23,42,0.7)] backdrop-blur-md">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen();
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-slate-900 shadow-[0_0.875rem_2rem_-1.5rem_rgba(255,255,255,0.95)] transition-all hover:bg-white"
              >
                <i className="fas fa-eye text-[0.6875rem]"></i>
                <span>{viewLabel}</span>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
                disabled={deleting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 text-sm font-semibold text-white shadow-[0_1rem_2.25rem_-1.5rem_rgba(225,29,72,0.52)] transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                title={deleteLabel}
              >
                {deleting ? <i className="fas fa-spinner animate-spin text-[0.6875rem]"></i> : <i className="fas fa-trash text-[0.6875rem]"></i>}
                <span>{deleteLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 px-1">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 via-white to-slate-200 text-xs font-semibold text-slate-700">
          {getInitials(creatorName)}
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[0.9375rem] font-semibold tracking-tight text-slate-900">{template.name}</div>
          <div className="truncate text-sm font-medium text-slate-400">Template by {creatorName}</div>
        </div>
      </div>
    </article>
  );
}

const TemplatesView: React.FC<TemplatesViewProps> = ({
  lang,
  templates,
  totalCount = 0,
  overallCount = 0,
  activeCategory,
  currentPage,
  loading = false,
  isPageLoading = false,
  onUseTemplate,
  onViewDetail,
  onDeleteTemplate,
  onNewDoc,
  onActiveCategoryChange,
  onCurrentPageChange,
}) => {
  const t = translations[lang] || translations.en;
  const [usingId, setUsingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTemplateItem, setDeleteTemplateItem] = useState<InvoiceTemplate | null>(null);

  const copyByLang = {
    en: {
      loading: 'Loading templates...',
      prev: 'Prev',
      next: 'Next',
      use: 'Use',
      deleteTitle: 'Delete Template?',
      deleteDesc: 'Are you sure you want to delete template {item}? This action cannot be undone.',
      view: 'View',
      emptyFilteredTitle: 'No templates in this category',
      emptyFilteredDesc: 'Switch tabs or create a new blank canvas.',
    },
    'zh-CN': {
      loading: '正在加载模板...',
      prev: '上一页',
      next: '下一页',
      use: '使用',
      deleteTitle: '删除模板？',
      deleteDesc: '你确定要删除模板 {item} 吗？此操作无法恢复。',
      view: '查看',
      emptyFilteredTitle: '这个分类下还没有模板',
      emptyFilteredDesc: '切换其他分类，或者直接创建空白模板。',
    },
    'zh-TW': {
      loading: '正在載入模板...',
      prev: '上一頁',
      next: '下一頁',
      use: '使用',
      deleteTitle: '刪除模板？',
      deleteDesc: '你確定要刪除模板 {item} 嗎？此操作無法復原。',
      view: '查看',
      emptyFilteredTitle: '這個分類下還沒有模板',
      emptyFilteredDesc: '切換其他分類，或直接建立空白模板。',
    },
    th: {
      loading: 'กำลังโหลดเทมเพลต...',
      prev: 'ก่อนหน้า',
      next: 'ถัดไป',
      use: 'ใช้',
      deleteTitle: 'ลบเทมเพลต?',
      deleteDesc: 'คุณแน่ใจหรือไม่ว่าต้องการลบเทมเพลต {item} การกระทำนี้ไม่สามารถย้อนกลับได้',
      view: 'ดู',
      emptyFilteredTitle: 'ยังไม่มีเทมเพลตในหมวดนี้',
      emptyFilteredDesc: 'สลับหมวดอื่น หรือสร้าง Blank Canvas ใหม่',
    },
    id: {
      loading: 'Memuat template...',
      prev: 'Sebelumnya',
      next: 'Berikutnya',
      use: 'Pakai',
      deleteTitle: 'Hapus template?',
      deleteDesc: 'Apakah Anda yakin ingin menghapus template {item}? Tindakan ini tidak dapat dibatalkan.',
      view: 'Lihat',
      emptyFilteredTitle: 'Belum ada template di kategori ini',
      emptyFilteredDesc: 'Pindah kategori atau buat blank canvas baru.',
    },
  } satisfies Record<
    Language,
    {
      loading: string;
      prev: string;
      next: string;
      use: string;
      deleteTitle: string;
      deleteDesc: string;
      emptyFilteredTitle: string;
      view: string;
      emptyFilteredDesc: string;
    }
  >;
  const copy = copyByLang[lang];

  const totalPages = Math.max(1, Math.ceil(totalCount / TEMPLATES_PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const currentTemplates = templates;
  const paginationItems = useMemo(
    () => buildPaginationItems({ totalPages, currentPage: page, siblingCount: 1, boundaryCount: 1 }),
    [page, totalPages]
  );

  const handleUseTemplate = async (template: InvoiceTemplate) => {
    if (usingId === template.id) return;

    setUsingId(template.id);
    try {
      await onUseTemplate(template);
    } catch (error) {
      console.error('Error using template:', error);
    } finally {
      setUsingId(null);
    }
  };

  const handleDeleteTemplate = async (template: InvoiceTemplate) => {
    if (deletingId === template.id) return;

    setDeletingId(template.id);
    try {
      if (onDeleteTemplate) {
        await onDeleteTemplate(template);
      }
    } finally {
      setDeletingId(null);
      setDeleteTemplateItem(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="font-medium text-slate-400">{copy.loading}</p>
        </div>
      </div>
    );
  }

  if (overallCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-slate-100 text-5xl text-slate-300 shadow-inner -rotate-3">
          <i className="fas fa-file-contract"></i>
        </div>
        <h2 className="mb-3 text-3xl font-semibold text-slate-900">{t.noTemplates}</h2>
        <p className="mx-auto mt-3 max-w-md text-lg font-medium text-slate-500">{t.noTemplatesDesc}</p>
        <button
          type="button"
          onClick={onNewDoc}
          className="mt-10 flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-[0_1.125rem_2.125rem_-1.25rem_rgba(37,99,235,0.52)] transition-all hover:bg-blue-700 active:scale-95"
        >
          <i className="fas fa-plus"></i>
          <span>{t.newInvoice}</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-[95rem]">
          <div className="mt-2 flex justify-center overflow-x-auto pb-2">
            <div className="inline-flex items-center gap-9 border-b border-slate-200">
              {TEMPLATE_TYPE_OPTIONS.map((category) => {
                const isActive = activeCategory === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => {
                      onActiveCategoryChange(category.value);
                    }}
                    className={`whitespace-nowrap border-b-2 pb-4 text-[0.9375rem] font-semibold transition-colors ${isActive
                      ? 'border-blue-600 text-slate-900'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                      }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            {currentTemplates.length === 0 ? (
              <div className="mt-12 rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-8 py-20 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
                  <i className="fas fa-layer-group"></i>
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-slate-900">{copy.emptyFilteredTitle}</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">{copy.emptyFilteredDesc}</p>
              </div>
            ) : (
              <div className="mt-4 grid gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-5">
                {currentTemplates.map((template) => (
                  <TemplatePreviewCard
                    key={template.id}
                    template={template}
                    lang={lang}
                    using={usingId === template.id}
                    deleting={deletingId === template.id}
                    useLabel={copy.use}
                    deleteLabel={t.deleteTemplate}
                    viewLabel={copy.view}
                    onOpen={() => onViewDetail(template)}
                    onUse={() => handleUseTemplate(template)}
                    onDelete={() => setDeleteTemplateItem(template)}
                  />
                ))}
              </div>
            )}

            {isPageLoading ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.75rem] bg-white/68 backdrop-blur-[2px]">
                <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-600 shadow-[0_1rem_2.25rem_-1.75rem_rgba(15,23,42,0.35)]">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></span>
                  <span>{copy.loading}</span>
                </div>
              </div>
            ) : null}
          </div>

          {totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onCurrentPageChange(Math.max(1, page - 1))}
                disabled={page === 1 || isPageLoading}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.prev}
              </button>
              <div className="flex items-center gap-2">
                {paginationItems.map((item, index) => (
                  item === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-10 min-w-10 items-center justify-center text-sm font-semibold text-slate-300"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onCurrentPageChange(item)}
                      disabled={isPageLoading}
                      aria-current={page === item ? 'page' : undefined}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-2 text-sm font-semibold transition-colors ${
                        page === item
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {item}
                    </button>
                  )
                ))}
              </div>
              <button
                type="button"
                onClick={() => onCurrentPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || isPageLoading}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.next}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={!!deleteTemplateItem}
        onClose={() => setDeleteTemplateItem(null)}
        onConfirm={() => deleteTemplateItem && handleDeleteTemplate(deleteTemplateItem)}
        title={copy.deleteTitle}
        description={copy.deleteDesc}
        confirmText={t.deleteDialogConfirm || 'Delete'}
        cancelText={t.deleteDialogCancel || 'Cancel'}
        itemName={deleteTemplateItem?.name || ''}
        isDeleting={deletingId === deleteTemplateItem?.id}
      />
    </>
  );
};

export default TemplatesView;
