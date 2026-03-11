import React, { useMemo, useState } from 'react';
import { InvoiceTemplate, Language } from '../types';
import { translations } from '../i18n';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import InvoicePreview from './InvoicePreview';
import ScalableInvoiceContainer from './ScalableInvoiceContainer';
import { buildPublicTemplatePreviewInvoice } from '@/lib/public-templates';

interface TemplatesViewProps {
  lang: Language;
  templates: InvoiceTemplate[];
  loading?: boolean;
  onUseTemplate: (template: InvoiceTemplate) => void | Promise<void>;
  onViewDetail: (template: InvoiceTemplate) => void;
  onDeleteTemplate?: (template: InvoiceTemplate) => Promise<void>;
  onNewDoc: () => void | Promise<void>;
  onRefresh?: () => Promise<void>;
}

type TemplateCategoryKey =
  | 'business'
  | 'commercial'
  | 'service'
  | 'freelance'
  | 'contractor'
  | 'catering'
  | 'consultation';

const TEMPLATE_CATEGORIES: Array<{ key: TemplateCategoryKey; label: string }> = [
  { key: 'business', label: 'Business' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'service', label: 'Service' },
  { key: 'freelance', label: 'Freelance' },
  { key: 'contractor', label: 'Contractor' },
  { key: 'catering', label: 'Catering' },
  { key: 'consultation', label: 'Consultation' },
];

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return 'SB';
  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

function getTemplateCategory(template: InvoiceTemplate): TemplateCategoryKey {
  const lookup = [
    template.name,
    template.description,
    template.template_data.sender?.name,
    template.template_data.client?.name,
    template.template_data.notes,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/(contract|contractor|construction|build|site|milestone|renovat)/.test(lookup)) {
    return 'contractor';
  }

  if (/(cater|kitchen|food|restaurant|event|banquet|menu)/.test(lookup)) {
    return 'catering';
  }

  if (/(consult|advis|strategy|coach|therapy|legal|finance)/.test(lookup)) {
    return 'consultation';
  }

  if (/(freelance|developer|design|designer|creator|creative|studio|portfolio)/.test(lookup)) {
    return 'freelance';
  }

  if (/(service|support|maintenance|repair|subscription|retainer|monthly)/.test(lookup)) {
    return 'service';
  }

  if (/(commercial|campaign|marketing|brand|sales|agency)/.test(lookup)) {
    return 'commercial';
  }

  return 'business';
}

function TemplatePreviewCard({
  template,
  lang,
  using,
  deleting,
  useLabel,
  deleteLabel,
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
      <div className="relative">
        <div className="overflow-hidden rounded-[28px]">
          <ScalableInvoiceContainer baseWidth={794} className="pointer-events-none select-none">
            <div className="w-[794px]">
              <InvoicePreview
                invoice={previewInvoice}
                template={previewInvoice.template || 'minimalist'}
                isHeaderReversed={previewInvoice.isHeaderReversed}
                lang={lang}
              />
            </div>
          </ScalableInvoiceContainer>
        </div>

        <div className="pointer-events-none absolute inset-x-5 bottom-5 flex justify-end gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onUse();
            }}
            disabled={using}
            className="pointer-events-auto rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-slate-900 shadow-[0_16px_30px_-22px_rgba(15,23,42,0.5)] backdrop-blur disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-2">
              {using ? <i className="fas fa-spinner animate-spin text-[11px]"></i> : <i className="fas fa-plus text-[11px]"></i>}
              <span>{useLabel}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            disabled={deleting}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-[0_16px_30px_-22px_rgba(15,23,42,0.5)] backdrop-blur disabled:cursor-not-allowed disabled:opacity-60"
            title={deleteLabel}
          >
            {deleting ? <i className="fas fa-spinner animate-spin text-[11px]"></i> : <i className="fas fa-trash text-[11px]"></i>}
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 px-1">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 via-white to-slate-200 text-xs font-semibold text-slate-700">
          {getInitials(creatorName)}
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold tracking-tight text-slate-900">{template.name}</div>
          <div className="truncate text-sm font-medium text-slate-400">Template by {creatorName}</div>
        </div>
      </div>
    </article>
  );
}

const TemplatesView: React.FC<TemplatesViewProps> = ({
  lang,
  templates,
  loading = false,
  onUseTemplate,
  onViewDetail,
  onDeleteTemplate,
  onNewDoc,
}) => {
  const t = translations[lang] || translations.en;
  const [activeCategory, setActiveCategory] = useState<TemplateCategoryKey>('business');
  const [currentPage, setCurrentPage] = useState(1);
  const [usingId, setUsingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTemplateItem, setDeleteTemplateItem] = useState<InvoiceTemplate | null>(null);
  const itemsPerPage = 5;

  const copyByLang = {
    en: {
      loading: 'Loading templates...',
      prev: 'Prev',
      next: 'Next',
      use: 'Use',
      deleteTitle: 'Delete Template?',
      deleteDesc: 'Are you sure you want to delete template {item}? This action cannot be undone.',
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
      emptyFilteredDesc: string;
    }
  >;
  const copy = copyByLang[lang];

  const filteredTemplates = useMemo(
    () => templates.filter((template) => getTemplateCategory(template) === activeCategory),
    [activeCategory, templates]
  );

  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * itemsPerPage;
  const currentTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

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

  if (templates.length === 0) {
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
          className="mt-10 flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-[0_18px_34px_-20px_rgba(37,99,235,0.52)] transition-all hover:bg-blue-700 active:scale-95"
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
        <div className="mx-auto max-w-[1520px]">
          <div className="mt-2 flex justify-center overflow-x-auto pb-2">
            <div className="inline-flex items-center gap-9 border-b border-slate-200">
              {TEMPLATE_CATEGORIES.map((category) => {
                const isActive = activeCategory === category.key;

                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category.key);
                      setCurrentPage(1);
                    }}
                    className={`whitespace-nowrap border-b-2 pb-4 text-[15px] font-semibold transition-colors ${isActive
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

          {currentTemplates.length === 0 ? (
            <div className="mt-12 rounded-[28px] border border-dashed border-slate-300 bg-white px-8 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
                <i className="fas fa-layer-group"></i>
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-slate-900">{copy.emptyFilteredTitle}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">{copy.emptyFilteredDesc}</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {currentTemplates.map((template) => (
                <TemplatePreviewCard
                  key={template.id}
                  template={template}
                  lang={lang}
                  using={usingId === template.id}
                  deleting={deletingId === template.id}
                  useLabel={copy.use}
                  deleteLabel={t.deleteTemplate}
                  onOpen={() => onViewDetail(template)}
                  onUse={() => handleUseTemplate(template)}
                  onDelete={() => setDeleteTemplateItem(template)}
                />
              ))}

            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.prev}
              </button>
              <span className="min-w-[60px] text-center text-sm font-semibold text-slate-500">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                disabled={page === totalPages}
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
