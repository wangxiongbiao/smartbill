"use client";

import React, { useId, useState } from 'react';
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
      <div className="mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{title}</h3>
        {subtitle && <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>}
      </div>
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

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
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
}) {
  const inputId = useId();

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      {value ? (
        <div className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-slate-50">
          <div className="flex h-40 items-center justify-center overflow-hidden bg-white">
            <img src={value} alt={label} className="h-full w-full object-contain" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">{hint}</p>
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
      ) : (
        <label htmlFor={inputId} className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-[1.35rem] border-2 border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-blue-300 hover:bg-blue-50">
          <i className={`fas ${uploading ? 'fa-circle-notch fa-spin' : 'fa-image'} text-xl text-slate-400`} />
          <p className="mt-3 text-sm font-semibold text-slate-600">{uploading ? uploadingLabel : selectLabel}</p>
          <p className="mt-1 text-xs text-slate-400">{hint}</p>
        </label>
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
      upload: '点击上传图片',
      uploading: '上传中...',
      change: '更换',
      remove: '移除',
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
      upload: 'Click to upload',
      uploading: 'Uploading...',
      change: 'Replace',
      remove: 'Remove',
    };

  const updatePoster = (next: SchoolPoster) => onChange(next);

  const handleImageUpload = async (field: 'shell.brand.logo' | 'shell.heroImage' | 'shell.qrCode', file: File) => {
    setUploadingField(field);
    try {
      const imageData = await readFileAsDataUrl(file);

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
            <UploadField
              label={copy.brandLogo}
              value={poster.shell.brand.logo}
              hint={copy.brandHint}
              uploading={uploadingField === 'shell.brand.logo'}
              selectLabel={copy.upload}
              changeLabel={copy.change}
              removeLabel={copy.remove}
              uploadingLabel={copy.uploading}
              onUpload={(file) => handleImageUpload('shell.brand.logo', file)}
              onRemove={() => updatePoster({ ...poster, shell: { ...poster.shell, brand: { ...poster.shell.brand, logo: undefined } } })}
            />

            <div className="space-y-2">
              <FieldLabel>{copy.brandTitle}</FieldLabel>
              <TextInput value={poster.shell.brand.title} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, brand: { ...poster.shell.brand, title: event.target.value } } })} />
            </div>

            <div className="space-y-2">
              <FieldLabel>{copy.brandSubtitle}</FieldLabel>
              <TextArea rows={3} value={poster.shell.brand.subtitle} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, brand: { ...poster.shell.brand, subtitle: event.target.value } } })} />
            </div>
          </SectionCard>

          <SectionCard title={copy.basicCard} subtitle={copy.basicHint}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>{copy.schoolCn}</FieldLabel>
                <TextInput value={poster.shell.school.nameCn} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, school: { ...poster.shell.school, nameCn: event.target.value } } })} />
              </div>
              <div className="space-y-2">
                <FieldLabel>{copy.schoolEn}</FieldLabel>
                <TextInput value={poster.shell.school.nameEn} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, school: { ...poster.shell.school, nameEn: event.target.value } } })} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="space-y-2">
                <FieldLabel>{copy.studentName}</FieldLabel>
                <TextInput value={poster.shell.student.name} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, student: { ...poster.shell.student, name: event.target.value } } })} />
              </div>
              <div className="space-y-2">
                <FieldLabel>{copy.studentAge}</FieldLabel>
                <TextInput value={poster.shell.student.age} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, student: { ...poster.shell.student, age: event.target.value } } })} />
              </div>
              <div className="space-y-2">
                <FieldLabel>{copy.studentCity}</FieldLabel>
                <TextInput value={poster.shell.student.city} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, student: { ...poster.shell.student, city: event.target.value } } })} />
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>{copy.applicationPeriod}</FieldLabel>
              <TextInput value={poster.shell.student.applicationPeriod} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, student: { ...poster.shell.student, applicationPeriod: event.target.value } } })} />
            </div>

            <div className="space-y-2">
              <FieldLabel>{copy.transferPath}</FieldLabel>
              <TextArea rows={4} value={poster.shell.student.transferPath} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, student: { ...poster.shell.student, transferPath: event.target.value } } })} />
            </div>
          </SectionCard>

          <SectionCard title={copy.assetsCard} subtitle={copy.assetsHint}>
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
          </SectionCard>

          <SectionCard title={copy.footerCard} subtitle={copy.footerHint}>
            <div className="space-y-2">
              <FieldLabel>{copy.tuition}</FieldLabel>
              <TextInput value={poster.shell.footer.tuition} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, footer: { ...poster.shell.footer, tuition: event.target.value } } })} />
            </div>

            <div className="space-y-2">
              <FieldLabel>{copy.pathway}</FieldLabel>
              <TextInput value={poster.shell.footer.pathway} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, footer: { ...poster.shell.footer, pathway: event.target.value } } })} />
            </div>

            <div className="space-y-2">
              <FieldLabel>{copy.highlights}</FieldLabel>
              <TextArea rows={4} value={poster.shell.footer.highlights} onChange={(event) => updatePoster({ ...poster, shell: { ...poster.shell, footer: { ...poster.shell.footer, highlights: event.target.value } } })} placeholder={copy.footerPlaceholder} />
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
