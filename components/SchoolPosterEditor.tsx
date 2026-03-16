"use client";

import React, { useId, useState } from 'react';
import dynamic from 'next/dynamic';
import ScalableInvoiceContainer from '@/components/ScalableInvoiceContainer';
import SchoolPosterPreview from '@/components/SchoolPosterPreview';
import type { Language, SchoolPoster } from '@/types';

interface SchoolPosterEditorProps {
  poster: SchoolPoster;
  lang: Language;
  onChange: (poster: SchoolPoster) => void;
  onBack: () => void;
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">

      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white ${props.className || ''}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white ${props.className || ''}`}
    />
  );
}

function hasRichTextValue(value?: string) {
  if (!value) return false;

  const plainText = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();

  return plainText.length > 0;
}

const QuillEditor = dynamic(
  () => import('react-quill-new'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-white/70 bg-white text-sm text-slate-400">
        Loading editor...
      </div>
    ),
  }
) as React.ComponentType<any>;

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true,
  },
};

const QUILL_FORMATS = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'script',
  'list',
  'bullet',
  'indent',
  'align',
  'blockquote',
  'code-block',
  'link',
  'image',
];

function RichTextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) {
  const normalizedValue = hasRichTextValue(value) ? value : '';

  return (
    <div className="relative w-full rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
      <div className="w-full aspect-[210/297]">
        <QuillEditor
          theme="snow"
          value={normalizedValue}
          modules={QUILL_MODULES}
          formats={QUILL_FORMATS}
          placeholder={placeholder}
          className="poster-rich-editor h-full"
          onChange={(nextValue: string) => {
            onChange(hasRichTextValue(nextValue) ? nextValue : '');
          }}
        />
      </div>
    </div>
  );
}

interface ImageOptimizeOptions {
  maxWidth: number;
  maxHeight: number;
  quality?: number;
}

async function readFileAsDataUrl(file: File, options?: ImageOptimizeOptions) {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  if (!options || typeof window === 'undefined') {
    return rawDataUrl;
  }

  try {
    const { maxWidth, maxHeight, quality = 0.86 } = options;

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error('Failed to decode image'));
      nextImage.src = rawDataUrl;
    });

    const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      return rawDataUrl;
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    return canvas.toDataURL('image/webp', quality);
  } catch {
    return rawDataUrl;
  }
}

function UploadField({
  label,
  value,
  hint,
  uploading,
  selectLabel,
  changeLabel,
  removeLabel,
  uploadingLabel,
  onUpload,
  onRemove,
  size = 'default',
  showHintInEmptyState = true,
  showHintInFilledState = true,
  variant = 'default',
  filledTitle,
}: {
  label: string;
  value?: string;
  hint: string;
  uploading: boolean;
  selectLabel: string;
  changeLabel: string;
  removeLabel: string;
  uploadingLabel: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  size?: 'default' | 'compact';
  showHintInEmptyState?: boolean;
  showHintInFilledState?: boolean;
  variant?: 'default' | 'summary';
  filledTitle?: string;
}) {
  const inputId = useId();
  const isCompact = size === 'compact';
  const isSummary = variant === 'summary';

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      {value ? (
        isSummary ? (
          <div className="flex h-28 items-center gap-4 rounded-[1.35rem] border border-slate-200 bg-slate-50 px-5">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img src={value} alt={label} className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-slate-700">{filledTitle || label}</p>
              {showHintInFilledState && (
                <p className="mt-1 text-sm leading-5 text-slate-400">{hint}</p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs font-semibold">
                <label htmlFor={inputId} className="cursor-pointer text-blue-600 transition hover:text-blue-700">
                  {uploading ? uploadingLabel : changeLabel}
                </label>
                <button type="button" onClick={onRemove} className="text-slate-500 transition hover:text-slate-700">
                  {removeLabel}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-slate-50">
            <div className={`flex items-center justify-center overflow-hidden bg-white ${isCompact ? 'h-32' : 'h-40'}`}>
              <img src={value} alt={label} className="h-full w-full object-contain" />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
              {showHintInFilledState ? (
                <p className="text-xs text-slate-500">{hint}</p>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <label htmlFor={inputId} className="inline-flex cursor-pointer items-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                  {uploading ? uploadingLabel : changeLabel}
                </label>
                <button type="button" onClick={onRemove} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500">
                  {removeLabel}
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        isSummary ? (
          <label htmlFor={inputId} className="flex h-28 cursor-pointer items-center gap-4 rounded-[1.35rem] border-2 border-dashed border-slate-300 bg-slate-50 px-5 transition hover:border-blue-300 hover:bg-blue-50">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400">
              <i className={`fas ${uploading ? 'fa-circle-notch fa-spin' : 'fa-image'} text-xl`} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-700">{uploading ? uploadingLabel : selectLabel}</p>
              {showHintInEmptyState && (
                <p className="mt-1 text-sm leading-5 text-slate-400">{hint}</p>
              )}
            </div>
          </label>
        ) : (
          <label htmlFor={inputId} className={`flex cursor-pointer flex-col items-center justify-center rounded-[1.35rem] border-2 border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-blue-300 hover:bg-blue-50 ${isCompact ? 'h-32 px-4' : 'h-32'}`}>
            <i className={`fas ${uploading ? 'fa-circle-notch fa-spin' : 'fa-image'} ${isCompact ? 'text-lg' : 'text-xl'} text-slate-400`} />
            <p className={`font-semibold text-slate-600 ${isCompact ? 'mt-2 text-xs' : 'mt-3 text-sm'}`}>{uploading ? uploadingLabel : selectLabel}</p>
            {showHintInEmptyState && (
              <p className={`text-slate-400 ${isCompact ? 'mt-1 text-[0.6875rem] leading-4' : 'mt-1 text-xs'}`}>{hint}</p>
            )}
          </label>
        )
      )}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = '';
          if (!file) return;
          await onUpload(file);
        }}
      />
    </div>
  );
}

export default function SchoolPosterEditor({ poster, lang, onChange, onBack }: SchoolPosterEditorProps) {
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const isZh = lang === 'zh-CN' || lang === 'zh-TW';
  const copy = isZh
    ? {
      back: '返回院校海报',
      brandCard: '顶部品牌',
      brandHint: '对应文书顶部的品牌模块，可上传 logo，并填写中文标题和英文标题。',
      basicCard: '基础信息',
      basicHint: '只保留学校标题和学生信息，空字段会在海报中自动隐藏。',
      assetsCard: '素材上传',
      assetsHint: '上传主图和二维码，文书卡暂时只保留白色占位框。',
      footerCard: '底部文案',
      footerHint: '三条底部文案独立控制，留空即自动隐藏。',
      richCard: '白色文书卡',
      richCardHint: '输入富文本后会在海报中生成一张 A4 比例白色卡片，位于背景图之上、蓝色底层之下。',
      richContent: '富文本内容',
      brandLogo: '品牌 Logo',
      brandTitle: '中文标题',
      brandSubtitle: '英文标题',
      schoolCn: '学校中文名',
      schoolEn: '学校英文名',
      studentName: '姓名',
      studentAge: '年龄 / 年级',
      studentCity: '地区 / 标签',
      applicationPeriod: '申请周期 / 入学时间',
      transferPath: '路径说明',
      heroImage: '校园主图',
      qrImage: '二维码图片',
      tuition: '学费文案',
      pathway: '路径文案',
      highlights: '补充文案',
      heroHint: '用于左侧主图区，建议上传横版或竖版校园图。',
      qrHint: '用于右下角二维码区，不上传则整块自动隐藏。',
      footerPlaceholder: '可写成一行说明，也可以手动换行。',
      brandLogoReady: '已添加品牌 Logo',
      brandLogoActionHint: '可点击按钮更换或移除',
      upload: '点击上传图片',
      uploading: '上传中...',
      change: '更换',
      remove: '移除',
      addLine: '添加一行',
      removeLine: '删除',
      richPlaceholder: '请输入文书内容，可设置加粗、斜体、下划线与列表。',
    }
    : {
      back: 'Back to posters',
      brandCard: 'Top Branding',
      brandHint: 'Controls the brand header at the top of the offer document.',
      basicCard: 'Basic Info',
      basicHint: 'Keep only school and student info. Empty fields hide automatically in the poster.',
      assetsCard: 'Assets',
      assetsHint: 'Upload the hero image and QR code. The document card stays as a white placeholder for now.',
      footerCard: 'Footer Copy',
      footerHint: 'Each footer line hides independently when empty.',
      richCard: 'White Document Card',
      richCardHint: 'Once entered, an A4-style white card appears above the hero image and below the blue footer layer.',
      richContent: 'Rich text content',
      brandLogo: 'Brand logo',
      brandTitle: 'Chinese title',
      brandSubtitle: 'English title',
      schoolCn: 'School name (CN)',
      schoolEn: 'School name (EN)',
      studentName: 'Name',
      studentAge: 'Age / Grade',
      studentCity: 'Region / Tag',
      applicationPeriod: 'Application period / Intake',
      transferPath: 'Pathway note',
      heroImage: 'Hero image',
      qrImage: 'QR code image',
      tuition: 'Tuition copy',
      pathway: 'Pathway copy',
      highlights: 'Extra copy',
      heroHint: 'Used in the main left-side image block.',
      qrHint: 'Used in the QR code block. Leave empty to hide it.',
      footerPlaceholder: 'Write one line or multiple lines as needed.',
      brandLogoReady: 'Brand logo added',
      brandLogoActionHint: 'Use the buttons to replace or remove it',
      upload: 'Click to upload',
      uploading: 'Uploading...',
      change: 'Replace',
      remove: 'Remove',
      addLine: 'Add line',
      removeLine: 'Remove',
      richPlaceholder: 'Enter rich text. You can use bold, italic, underline, and bullet list.',
    };

  const getPlaceholder = (label: string) => (
    isZh ? `请输入${label}` : `Enter ${label}`
  );

  const updatePoster = (next: SchoolPoster) => onChange(next);
  const brandSubtitleLines = poster.shell.brand.subtitle.length > 0
    ? poster.shell.brand.subtitle.split('\n')
    : [''];

  const updateBrandSubtitleLines = (lines: string[]) => {
    updatePoster({
      ...poster,
      shell: {
        ...poster.shell,
        brand: {
          ...poster.shell.brand,
          subtitle: lines.join('\n'),
        },
      },
    });
  };

  const handleImageUpload = async (field: 'shell.brand.logo' | 'shell.heroImage' | 'shell.qrCode', file: File) => {
    setUploadingField(field);
    try {
      const imageData = await readFileAsDataUrl(
        file,
        field === 'shell.heroImage'
          ? { maxWidth: 1280, maxHeight: 1280, quality: 0.82 }
          : field === 'shell.qrCode'
            ? { maxWidth: 720, maxHeight: 720, quality: 0.92 }
            : { maxWidth: 640, maxHeight: 640, quality: 0.9 }
      );

      if (field === 'shell.brand.logo') {
        updatePoster({ ...poster, shell: { ...poster.shell, brand: { ...poster.shell.brand, logo: imageData } } });
      }

      if (field === 'shell.heroImage') {
        updatePoster({ ...poster, shell: { ...poster.shell, heroImage: imageData } });
      }

      if (field === 'shell.qrCode') {
        updatePoster({ ...poster, shell: { ...poster.shell, qrCode: imageData } });
      }
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <div className="container mx-auto relative flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          <i className="fas fa-arrow-left text-xs"></i>
          <span>{copy.back}</span>
        </button>
      </div>

      <div className="lg:flex gap-4">
        <div className="lg:w-1/2 flex flex-col gap-6">
          <SectionCard title={copy.brandCard} subtitle={copy.brandHint}>
            <div className="grid gap-5 md:grid-cols-2 md:items-start">
              <UploadField
                label={copy.brandLogo}
                value={poster.shell.brand.logo}
                hint={copy.brandLogoActionHint}
                uploading={uploadingField === 'shell.brand.logo'}
                selectLabel={copy.upload}
                changeLabel={copy.change}
                removeLabel={copy.remove}
                uploadingLabel={copy.uploading}
                onUpload={(file) => handleImageUpload('shell.brand.logo', file)}
                onRemove={() => updatePoster({ ...poster, shell: { ...poster.shell, brand: { ...poster.shell.brand, logo: undefined } } })}
                variant="summary"
                filledTitle={copy.brandLogoReady}
              />

              <div className="space-y-2">
                <FieldLabel>{copy.brandTitle}</FieldLabel>
                <TextInput className="h-28 px-6 text-base" placeholder={getPlaceholder(copy.brandTitle)} value={poster.shell.brand.title} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, brand: { ...poster.shell.brand, title: event.target.value } } })} />
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>{copy.brandSubtitle}</FieldLabel>
              <div className="grid gap-3 md:grid-cols-2">
                {brandSubtitleLines.map((line, index) => (
                  <div key={`brand-subtitle-${index}`} className="relative">
                    <TextInput
                      className="pr-11"
                      placeholder={isZh ? `请输入${copy.brandSubtitle}${index + 1}` : `${copy.brandSubtitle} ${index + 1}`}
                      value={line}
                      onChange={(event) => {
                        const nextLines = [...brandSubtitleLines];
                        nextLines[index] = event.target.value;
                        updateBrandSubtitleLines(nextLines);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (brandSubtitleLines.length === 1) {
                          updateBrandSubtitleLines(['']);
                          return;
                        }

                        const nextLines = brandSubtitleLines.filter((_, lineIndex) => lineIndex !== index);
                        updateBrandSubtitleLines(nextLines.length > 0 ? nextLines : ['']);
                      }}
                      className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-400 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-600"
                      aria-label={copy.removeLine}
                      title={copy.removeLine}
                    >
                      <i className="fas fa-times text-[0.5625rem]"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateBrandSubtitleLines([...brandSubtitleLines, ''])}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <i className="fas fa-plus text-[0.625rem]"></i>
                  <span>{copy.addLine}</span>
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={copy.basicCard} subtitle={copy.basicHint}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>{copy.schoolCn}</FieldLabel>
                <TextInput placeholder={getPlaceholder(copy.schoolCn)} value={poster.shell.school.nameCn} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, school: { ...poster.shell.school, nameCn: event.target.value } } })} />
              </div>
              <div className="space-y-2">
                <FieldLabel>{copy.schoolEn}</FieldLabel>
                <TextInput placeholder={getPlaceholder(copy.schoolEn)} value={poster.shell.school.nameEn} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, school: { ...poster.shell.school, nameEn: event.target.value } } })} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="space-y-2">
                <FieldLabel>{copy.studentName}</FieldLabel>
                <TextInput placeholder={getPlaceholder(copy.studentName)} value={poster.shell.student.name} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, student: { ...poster.shell.student, name: event.target.value } } })} />
              </div>
              <div className="space-y-2">
                <FieldLabel>{copy.studentAge}</FieldLabel>
                <TextInput placeholder={getPlaceholder(copy.studentAge)} value={poster.shell.student.age} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, student: { ...poster.shell.student, age: event.target.value } } })} />
              </div>
              <div className="space-y-2">
                <FieldLabel>{copy.studentCity}</FieldLabel>
                <TextInput placeholder={getPlaceholder(copy.studentCity)} value={poster.shell.student.city} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, student: { ...poster.shell.student, city: event.target.value } } })} />
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>{copy.applicationPeriod}</FieldLabel>
              <TextInput placeholder={getPlaceholder(copy.applicationPeriod)} value={poster.shell.student.applicationPeriod} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, student: { ...poster.shell.student, applicationPeriod: event.target.value } } })} />
            </div>

            <div className="space-y-2">
              <FieldLabel>{copy.transferPath}</FieldLabel>
              <TextInput placeholder={getPlaceholder(copy.transferPath)} value={poster.shell.student.transferPath} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, student: { ...poster.shell.student, transferPath: event.target.value } } })} />
            </div>

            <UploadField
              label={copy.heroImage}
              value={poster.shell.heroImage}
              hint={copy.heroHint}
              uploading={uploadingField === 'shell.heroImage'}
              selectLabel={copy.upload}
              changeLabel={copy.change}
              removeLabel={copy.remove}
              uploadingLabel={copy.uploading}
              onUpload={(file) => handleImageUpload('shell.heroImage', file)}
              onRemove={() => updatePoster({ ...poster, shell: { ...poster.shell, heroImage: undefined } })}
            />
          </SectionCard>

          <SectionCard title={copy.footerCard} subtitle={copy.footerHint}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>{copy.tuition}</FieldLabel>
                <TextInput placeholder={getPlaceholder(copy.tuition)} value={poster.shell.footer.tuition} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, footer: { ...poster.shell.footer, tuition: event.target.value } } })} />
              </div>

              <div className="space-y-2">
                <FieldLabel>{copy.pathway}</FieldLabel>
                <TextInput placeholder={getPlaceholder(copy.pathway)} value={poster.shell.footer.pathway} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, footer: { ...poster.shell.footer, pathway: event.target.value } } })} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:items-start">
              <div className="space-y-2">
                <FieldLabel>{copy.highlights}</FieldLabel>
                <TextArea rows={4} value={poster.shell.footer.highlights} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, footer: { ...poster.shell.footer, highlights: event.target.value } } })} placeholder={copy.footerPlaceholder || getPlaceholder(copy.highlights)} />
              </div>

              <UploadField
                label={copy.qrImage}
                value={poster.shell.qrCode}
                hint={copy.qrHint}
                uploading={uploadingField === 'shell.qrCode'}
                selectLabel={copy.upload}
                changeLabel={copy.change}
                removeLabel={copy.remove}
                uploadingLabel={copy.uploading}
                onUpload={(file) => handleImageUpload('shell.qrCode', file)}
                onRemove={() => updatePoster({ ...poster, shell: { ...poster.shell, qrCode: undefined } })}
              />
            </div>
          </SectionCard>

          <SectionCard title={copy.richCard} subtitle={copy.richCardHint}>
            <div className="space-y-2">

              <RichTextInput
                value={poster.document.richText}
                placeholder={copy.richPlaceholder}
                onChange={(nextValue) => updatePoster({
                  ...poster,
                  document: {
                    ...poster.document,
                    richText: nextValue,
                  },
                })}
              />
            </div>
          </SectionCard>
        </div>

        <div className="lg:w-1/2 lg:sticky lg:top-24 self-start">
          <div className="min-h-[28.125rem] sm:min-h-[31.25rem] flex justify-center items-start overflow-x-hidden overflow-y-hidden">
            <ScalableInvoiceContainer baseWidth={720}>
              <SchoolPosterPreview poster={poster} />
            </ScalableInvoiceContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
