import React, { useEffect, useRef, useState } from 'react';
import type { SchoolPoster } from '@/types';

interface PosterShellPreviewProps {
  poster: SchoolPoster;
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

const SCHOOL_CN_BASE_FONT_REM = 2;
const SCHOOL_CN_MIN_FONT_REM = 1;

export default function PosterShellPreview({ poster }: PosterShellPreviewProps) {
  const { shell } = poster;
  const brandLines = splitLines(shell.brand.subtitle);
  const showBrandLogo = hasValue(shell.brand.logo);
  const showBrandBlock = showBrandLogo || hasValue(shell.brand.title) || brandLines.length > 0;
  const showSchoolCn = hasValue(shell.school.nameCn);
  const showSchoolEn = hasValue(shell.school.nameEn);
  const studentMeta = [shell.student.name, shell.student.age, shell.student.city].filter(hasValue);
  const showStudentMeta = studentMeta.length > 0;
  const showApplicationPeriod = hasValue(shell.student.applicationPeriod);
  const showTransferPath = hasValue(shell.student.transferPath);
  const footerRows = [shell.footer.tuition, shell.footer.pathway, shell.footer.highlights].filter(hasValue);
  const showFooterBlock = footerRows.length > 0;
  const showQrBlock = hasValue(shell.qrCode);
  const showBottomCard = showFooterBlock || showQrBlock;
  const showHeroImage = hasValue(shell.heroImage);
  const schoolNameRowRef = useRef<HTMLDivElement>(null);
  const schoolNameMeasureRef = useRef<HTMLDivElement>(null);
  const [schoolNameFontSizeRem, setSchoolNameFontSizeRem] = useState(SCHOOL_CN_BASE_FONT_REM);

  useEffect(() => {
    if (!showSchoolCn) {
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
    <div className="relative min-h-[66rem] rounded-3xl overflow-hidden  bg-[#d0f0ff]  text-slate-900 shadow-[0_2.75rem_5.5rem_-2.5rem_rgba(15,23,42,0.32)]">
      {/* 标题 */}
      <div className='relative' style={{ zIndex: 2 }}>
        {showBrandBlock && (
          <div className="pt-8 px-10 flex items-start gap-3">
            {showBrandLogo ? (
              <img src={shell.brand.logo} alt="logo" className="object-contain h-[5.5rem]" />
            ) : null}
            <div className={showBrandLogo ? 'pt-3' : ''}>
              {hasValue(shell.brand.title) && (
                <div className="text-[0.8rem] font-semibold text-[#466382] mb-[0.2rem] tracking-[0.02em]">{shell.brand.title}</div>
              )}
              {brandLines.map((line, index) => (
                <div key={`${line}-${index}`} className="text-[0.9rem] leading-none mb-[0.08rem] font-bold text-[#044195]">{line}</div>
              ))}
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
                「{shell.school.nameCn}」
              </div>
              <div
                ref={schoolNameRowRef}
                className='flex w-full overflow-hidden whitespace-nowrap leading-none mb-[0.4rem] font-semibold text-[#044195] mt-10'
                style={{ fontSize: `${schoolNameFontSizeRem}rem` }}
              >
                <div className='leading-none '>「</div>
                <div className='leading-none '>{shell.school.nameCn}</div>
                <div className='leading-none '>」</div>
              </div>
            </>
          )}
          <div className='pl-8'>
            {showSchoolEn && (
              <div className='text-[1.3rem]  leading-none font-semibold text-[#777]'>{shell.school.nameEn}</div>
            )}
            <div className='pt-6'>
              {showStudentMeta && (
                <div className='flex text-[1.1rem] font-bold text-[#222]'>
                  {studentMeta.map((item, index) => (
                    <React.Fragment key={`${item}-${index}`}>
                      {index > 0 && <div>｜</div>}
                      <div>{item}</div>
                    </React.Fragment>
                  ))}
                </div>
              )}
              {showApplicationPeriod && (
                <div className='flex text-[1.1rem] font-bold text-[#222]'>
                  <div>{shell.student.applicationPeriod}</div>
                </div>
              )}
              {showTransferPath && (
                <div className='flex text-[1.1rem] font-bold text-[#222]'>
                  <div>{shell.student.transferPath}</div>
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
            clipPath: 'polygon(0 0, 100% 60%, 100% 100%, 0 100%)',
          }}
        >
          <img src={shell.heroImage} alt="logo" className="max-h-[40rem] object-cover w-full h-full" />
        </div>
      )}

      {showBottomCard && (
        <div
          className='absolute bottom-0 w-full bg-[#265aa8] h-[24%] overflow-hidden'
          style={{
            zIndex: 3,
            clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)',
          }}
        >
          <div className='w-full h-full '></div>
        </div>
      )}


      {showBottomCard && (
        <div className='absolute flex pt-[5rem] gap-6 px-10 justify-end items-center bottom-0 text-[#f0f0f0] w-full  h-[22.5%]' style={{
          zIndex: 4
        }}>
          {showFooterBlock && (
            <div className='text-[1rem] font-light text-right'>
              {footerRows.map((line, index) => (
                <div key={`${line}-${index}`}>{line}</div>
              ))}
            </div>
          )}
          {showQrBlock && (
            <img src={shell.qrCode} alt="qr code" className="object-cover  w-[5rem] h-[5rem]" />
          )}
        </div>
      )}
    </div>
  );
}
