"use client";

import { useCallback } from 'react';
import { jsPDF } from 'jspdf';
import type React from 'react';
import type { SchoolPoster } from '@/types';

declare var html2pdf: any;
declare var html2canvas: any;

interface UseSchoolPosterPdfExportParams {
  poster: SchoolPoster;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
  printAreaRef: React.RefObject<HTMLDivElement | null>;
}

function sanitizeFilenamePart(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s_-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 60) || 'school-poster';
}

async function waitForFonts() {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await (document as Document & { fonts: FontFaceSet }).fonts.ready;
  } catch {
    // Ignore and continue export.
  }
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll('img'));
  if (images.length === 0) return;

  await Promise.all(images.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const done = () => resolve();
      image.addEventListener('load', done, { once: true });
      image.addEventListener('error', done, { once: true });
      window.setTimeout(done, 2500);
    });
  }));
}

async function waitForNextPaint() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export function useSchoolPosterPdfExport({ poster, isExporting, setIsExporting, printAreaRef }: UseSchoolPosterPdfExportParams) {
  const handleExportPdf = useCallback(async () => {
    const target = printAreaRef.current;
    if (!target || isExporting) return;

    const schoolName = poster.shell.school.nameCn || poster.shell.school.nameEn || 'school-poster';
    const filename = `${sanitizeFilenamePart(schoolName)}_${sanitizeFilenamePart(poster.id)}.pdf`;

    setIsExporting(true);
    try {
      if (typeof html2pdf === 'undefined') {
        window.print();
        return;
      }

      await waitForFonts();
      await waitForImages(target);
      await waitForNextPaint();

      const targetRect = target.getBoundingClientRect();
      const width = Math.max(1, Math.round(targetRect.width));
      const height = Math.max(1, Math.round(targetRect.height));

      if (typeof html2canvas !== 'undefined') {
        const canvas = await html2canvas(target, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width,
          height,
          x: targetRect.left + window.scrollX,
          y: targetRect.top + window.scrollY,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
        });

        const pdf = new jsPDF({
          unit: 'px',
          format: [canvas.width, canvas.height],
          orientation: canvas.height >= canvas.width ? 'portrait' : 'landscape',
          hotfixes: ['px_scaling'],
        });

        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.98),
          'JPEG',
          0,
          0,
          canvas.width,
          canvas.height,
          undefined,
          'FAST'
        );

        // Guard against rounding-related trailing blank page.
        const pageCount = pdf.getNumberOfPages();
        if (pageCount > 1) {
          for (let page = pageCount; page > 1; page -= 1) {
            pdf.deletePage(page);
          }
        }

        pdf.save(filename);
        return;
      }

      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'px', format: [width, height], orientation: height >= width ? 'portrait' : 'landscape' },
        })
        .from(target)
        .save();
    } catch (error) {
      console.error('School poster PDF generation failed', error);
      window.print();
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, poster.id, poster.shell.school.nameCn, poster.shell.school.nameEn, printAreaRef, setIsExporting]);

  return {
    handleExportPdf,
  };
}
