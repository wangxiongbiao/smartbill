import React, { useEffect, useRef, useState } from 'react';
import EditableTextValue from '@/components/preview-editable/EditableTextValue';
import { SCHOOL_POSTER_A4_ASPECT_RATIO } from '@/lib/school-poster-preview';
import type { Language, SchoolPoster } from '@/types';

interface PosterShellPreviewProps {
  poster: SchoolPoster;
  lang?: Language;
  editable?: boolean;
  onChange?: (poster: SchoolPoster) => void;
}

function hasValue(value?: string) {
  return Boolean(value && value.trim());
}

function splitLines(value?: string) {
  return (value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasDocumentHtmlValue(value?: string) {
  if (!value) return false;

  if (/<(?:img|video|iframe|embed|object)\b/i.test(value)) {
    return true;
  }

  const plainText = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();

  return plainText.length > 0;
}

function sanitizeDocumentHtml(value?: string) {
  if (!value) return '';

  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<p(\s[^>]*)?>\s*(?:&nbsp;|\u00a0|<br\s*\/?>|\s)*<\/p>/gi, '<p$1><br /></p>');
}

const SCHOOL_CN_BASE_FONT_REM = 2;
const SCHOOL_CN_MIN_FONT_REM = 1;
const DOCUMENT_CARD_SCALE = 0.75;
const POSTER_BACKGROUND_COLOR = '#d0f0ff';
const POSTER_FOOTER_COLOR = '#265aa8';

export default function PosterShellPreview({ poster, lang = 'zh-CN', editable = false, onChange }: PosterShellPreviewProps) {
  const { shell, document } = poster;
  const previewEditable = editable && Boolean(onChange);
  const copy = (lang === 'zh-CN' || lang === 'zh-TW')
    ? {
      brandTitle: '品牌标题',
      brandSubtitle: '品牌副标题',
      schoolCn: '学校中文名',
      schoolEn: '学校英文名',
      studentName: '姓名',
      studentAge: '年龄 / 年级',
      studentCity: '地区 / 标签',
      applicationPeriod: '申请周期 / 入学时间',
      transferPath: '路径说明',
      tuition: '学费文案',
      pathway: '路径文案',
      highlights: '补充文案',
    }
    : {
      brandTitle: 'Brand title',
      brandSubtitle: 'Brand subtitle',
      schoolCn: 'School name (CN)',
      schoolEn: 'School name (EN)',
      studentName: 'Student name',
      studentAge: 'Age / Grade',
      studentCity: 'Region / Tag',
      applicationPeriod: 'Application period / Intake',
      transferPath: 'Pathway note',
      tuition: 'Tuition copy',
      pathway: 'Pathway copy',
      highlights: 'Extra copy',
    };
  const brandLines = splitLines(shell.brand.subtitle);
  const hasBrandTitle = hasValue(shell.brand.title);
  const hasBrandSubtitle = brandLines.length > 0;
  const showBrandLogo = hasValue(shell.brand.logo);
  const showBrandBlock = previewEditable || showBrandLogo || hasBrandTitle || hasBrandSubtitle;
  const hasSchoolCnValue = hasValue(shell.school.nameCn);
  const hasSchoolEnValue = hasValue(shell.school.nameEn);
  const showSchoolCn = previewEditable || hasSchoolCnValue;
  const showSchoolEn = previewEditable || hasSchoolEnValue;
  const studentFields = [
    {
      key: 'name',
      value: shell.student.name,
      placeholder: copy.studentName,
      className: 'min-w-[4rem]',
      inputClassName: 'text-[1.1rem] font-bold',
      onCommit: (value: string) => onChange?.({ ...poster, shell: { ...shell, student: { ...shell.student, name: value } } }),
    },
    {
      key: 'age',
      value: shell.student.age,
      placeholder: copy.studentAge,
      className: 'min-w-[4rem]',
      inputClassName: 'text-[1.1rem] font-bold',
      onCommit: (value: string) => onChange?.({ ...poster, shell: { ...shell, student: { ...shell.student, age: value } } }),
    },
    {
      key: 'city',
      value: shell.student.city,
      placeholder: copy.studentCity,
      className: 'min-w-[4rem]',
      inputClassName: 'text-[1.1rem] font-bold',
      onCommit: (value: string) => onChange?.({ ...poster, shell: { ...shell, student: { ...shell.student, city: value } } }),
    },
  ] as const;
  const visibleStudentFields = studentFields.filter((field) => previewEditable || hasValue(field.value));
  const showStudentMeta = visibleStudentFields.length > 0;
  const showApplicationPeriod = previewEditable || hasValue(shell.student.applicationPeriod);
  const showTransferPath = previewEditable || hasValue(shell.student.transferPath);
  const footerFields = [
    {
      key: 'tuition',
      value: shell.footer.tuition,
      placeholder: copy.tuition,
      onCommit: (value: string) => onChange?.({ ...poster, shell: { ...shell, footer: { ...shell.footer, tuition: value } } }),
    },
    {
      key: 'pathway',
      value: shell.footer.pathway,
      placeholder: copy.pathway,
      onCommit: (value: string) => onChange?.({ ...poster, shell: { ...shell, footer: { ...shell.footer, pathway: value } } }),
    },
    {
      key: 'highlights',
      value: shell.footer.highlights,
      placeholder: copy.highlights,
      onCommit: (value: string) => onChange?.({ ...poster, shell: { ...shell, footer: { ...shell.footer, highlights: value } } }),
    },
  ] as const;
  const visibleFooterFields = footerFields.filter((field) => previewEditable || hasValue(field.value));
  const showFooterBlock = visibleFooterFields.length > 0;
  const showQrBlock = hasValue(shell.qrCode);
  const showBottomCard = showFooterBlock || showQrBlock;
  const showHeroImage = hasValue(shell.heroImage);
  const showDocumentCard = hasDocumentHtmlValue(document.richText);
  const documentHtml = sanitizeDocumentHtml(document.richText);
  const schoolNameRowRef = useRef<HTMLDivElement>(null);
  const schoolNameMeasureRef = useRef<HTMLDivElement>(null);
  const [schoolNameFontSizeRem, setSchoolNameFontSizeRem] = useState(SCHOOL_CN_BASE_FONT_REM);

  useEffect(() => {
    if (!hasSchoolCnValue) {
      setSchoolNameFontSizeRem(SCHOOL_CN_BASE_FONT_REM);
      return;
    }

    const row = schoolNameRowRef.current;
    const measure = schoolNameMeasureRef.current;
    if (!row || !measure) return;

    const recalcSchoolNameFontSize = () => {
      const availableWidth = row.clientWidth;
      const requiredWidth = measure.scrollWidth;
      if (!availableWidth || !requiredWidth) return;

      const scaledFontSize = SCHOOL_CN_BASE_FONT_REM * (availableWidth / requiredWidth);
      const nextFontSize = Math.max(
        SCHOOL_CN_MIN_FONT_REM,
        Math.min(SCHOOL_CN_BASE_FONT_REM, scaledFontSize)
      );

      setSchoolNameFontSizeRem((prev) => (
        Math.abs(prev - nextFontSize) < 0.01 ? prev : nextFontSize
      ));
    };

    recalcSchoolNameFontSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => recalcSchoolNameFontSize());
      resizeObserver.observe(row);
    }

    const handleResize = () => recalcSchoolNameFontSize();
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [shell.school.nameCn, showSchoolCn]);

  return (
    <div
      className="relative w-full  overflow-hidden bg-[#d0f0ff] text-slate-900 shadow-[0_2.75rem_5.5rem_-2.5rem_rgba(15,23,42,0.32)]"
      style={{ aspectRatio: `${SCHOOL_POSTER_A4_ASPECT_RATIO}` }}
    >
      {/* 标题 */}
      <div className='relative' style={{ zIndex: 2 }}>
        {showBrandBlock && (
          <div className="pt-8 px-10 flex items-start gap-3">
            {showBrandLogo ? (
              <img src={shell.brand.logo} alt="logo" className="object-contain h-[5.5rem]" />
            ) : null}
            <div className={showBrandLogo ? 'pt-3' : ''}>
              {(previewEditable || hasBrandTitle) && (
                <div className="text-[0.8rem] font-semibold text-[#466382] mb-[0.2rem] tracking-[0.02em]">
                  <EditableTextValue
                    value={shell.brand.title}
                    placeholder={copy.brandTitle}
                    editable={previewEditable}
                    className="inline"
                    inputClassName="text-[0.8rem] font-semibold tracking-[0.02em] text-[#466382]"
                    emptyClassName="text-[#8aa3c2]"
                    onChange={(value) => onChange?.({ ...poster, shell: { ...shell, brand: { ...shell.brand, title: value } } })}
                  />
                </div>
              )}
              {(previewEditable || hasBrandSubtitle) ? (
                <div className="text-[0.9rem] font-bold leading-none text-[#044195]">
                  <EditableTextValue
                    value={shell.brand.subtitle}
                    placeholder={copy.brandSubtitle}
                    multiline
                    editable={previewEditable}
                    className="inline whitespace-pre-line"
                    inputClassName="text-[0.9rem] font-bold leading-none text-[#044195]"
                    emptyClassName="text-[#7f9fd5]"
                    onChange={(value) => onChange?.({ ...poster, shell: { ...shell, brand: { ...shell.brand, subtitle: value } } })}
                  />
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className='px-6'>
          {showSchoolCn && (
            <>
              <div
                ref={schoolNameMeasureRef}
                className='pointer-events-none absolute left-0 top-0 -z-10 whitespace-nowrap opacity-0 text-[3rem] font-semibold leading-none'
                aria-hidden='true'
              >
                {shell.school.nameCn}
              </div>
              <div
                ref={schoolNameRowRef}
                className='flex w-full pl-[1.8rem] whitespace-nowrap  mb-[0.4rem] font-semibold text-[#044195] mt-10'
                style={{ fontSize: `${schoolNameFontSizeRem}rem` }}
              >
                <EditableTextValue
                  value={shell.school.nameCn}
                  placeholder={copy.schoolCn}
                  editable={previewEditable}
                  className="inline-block min-w-[10rem]"
                  inputClassName="text-inherit font-semibold text-[#044195]"
                  emptyClassName="text-[#7f9fd5]"
                  onChange={(value) => onChange?.({ ...poster, shell: { ...shell, school: { ...shell.school, nameCn: value } } })}
                />
              </div>
            </>
          )}
          <div className='pl-8'>
            {showSchoolEn && (
              <div className='text-[1.3rem]  leading-none font-semibold text-[#777]'>
                <EditableTextValue
                  value={shell.school.nameEn}
                  placeholder={copy.schoolEn}
                  editable={previewEditable}
                  className="inline"
                  inputClassName="text-[1.3rem] font-semibold text-[#777]"
                  emptyClassName="text-[#9ca3af]"
                  onChange={(value) => onChange?.({ ...poster, shell: { ...shell, school: { ...shell.school, nameEn: value } } })}
                />
              </div>
            )}
            <div className='pt-6'>
              {showStudentMeta && (
                <div className='flex text-[1.1rem] font-bold text-[#222]'>
                  {visibleStudentFields.map((field, index) => (
                    <React.Fragment key={field.key}>
                      {index > 0 && <div>｜</div>}
                      <EditableTextValue
                        value={field.value}
                        placeholder={field.placeholder}
                        editable={previewEditable}
                        className={field.className}
                        inputClassName={field.inputClassName}
                        emptyClassName="text-slate-400"
                        onChange={field.onCommit}
                      />
                    </React.Fragment>
                  ))}
                </div>
              )}
              {showApplicationPeriod && (
                <div className='flex text-[1.1rem] font-bold text-[#222]'>
                  <EditableTextValue
                    value={shell.student.applicationPeriod}
                    placeholder={copy.applicationPeriod}
                    editable={previewEditable}
                    className="inline"
                    inputClassName="text-[1.1rem] font-bold"
                    emptyClassName="text-slate-400"
                    onChange={(value) => onChange?.({ ...poster, shell: { ...shell, student: { ...shell.student, applicationPeriod: value } } })}
                  />
                </div>
              )}
              {showTransferPath && (
                <div className='flex text-[1.1rem] font-bold text-[#222]'>
                  <EditableTextValue
                    value={shell.student.transferPath}
                    placeholder={copy.transferPath}
                    editable={previewEditable}
                    className="inline"
                    inputClassName="text-[1.1rem] font-bold"
                    emptyClassName="text-slate-400"
                    onChange={(value) => onChange?.({ ...poster, shell: { ...shell, student: { ...shell.student, transferPath: value } } })}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showHeroImage && (
        <div
          className='absolute bottom-0 w-full overflow-hidden'
          style={{
            zIndex: 1,
          }}
        >
          <div className="relative h-full w-full">
            <img src={shell.heroImage} alt="logo" className="max-h-[40rem] object-cover w-full h-full" />
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polygon points="0,0 100,0 100,60" fill={POSTER_BACKGROUND_COLOR} />
            </svg>
          </div>
        </div>
      )}

      {showBottomCard && (
        <div
          className='absolute bottom-0 w-full h-[24%] overflow-hidden'
          style={{
            zIndex: 3,
          }}
        >
          <svg
            aria-hidden="true"
            className="block h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon points="0,100 100,0 100,100" fill={POSTER_FOOTER_COLOR} />
          </svg>
        </div>
      )}


      {showBottomCard && (
        <div
          className='absolute bottom-[1.9rem] right-10 flex max-w-[calc(100%-5rem)] items-end gap-6 text-[#f0f0f0]'
          style={{ zIndex: 4 }}
        >
          {showFooterBlock && (
            <div className='max-w-[18rem] text-right text-[1rem] font-light leading-[1.5]'>
              {visibleFooterFields.map((field) => (
                <div key={field.key}>
                  <EditableTextValue
                    value={field.value}
                    placeholder={field.placeholder}
                    editable={previewEditable}
                    className="inline"
                    inputClassName="text-[1rem] font-light text-right"
                    emptyClassName="text-blue-100/70"
                    onChange={field.onCommit}
                  />
                </div>
              ))}
            </div>
          )}
          {showQrBlock && (
            <img src={shell.qrCode} alt="qr code" className="object-cover w-[5rem] h-[5rem] flex-shrink-0" />
          )}
        </div>
      )}

      {showDocumentCard ? (
        <div
          className="absolute bottom-[8.4rem] right-[3.6rem] origin-bottom-right"
          style={{
            zIndex: 2,
            transform: `scale(${DOCUMENT_CARD_SCALE})`,
          }}
        >
          <div className="w-[34rem] max-w-none aspect-[210/297] rounded-sm border border-slate-200/70 bg-white shadow-[0_1.5rem_3rem_-1.5rem_rgba(15,23,42,0.45)]">
            <div className="h-full w-full overflow-hidden p-6">
              <div
                className="poster-document-preview h-full w-full overflow-hidden break-words"
                dangerouslySetInnerHTML={{ __html: documentHtml }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
