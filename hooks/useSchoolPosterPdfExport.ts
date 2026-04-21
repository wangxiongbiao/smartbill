"use client";

import { createElement, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import PosterShellPreview from '@/components/school-poster/PosterShellPreview';
import {
  SCHOOL_POSTER_A4_WIDTH_MM,
} from '@/lib/school-poster-preview';
import type { SchoolPoster } from '@/types';

const EXPORT_RENDER_SCALE = 4;

interface UseSchoolPosterPdfExportParams {
  poster: SchoolPoster;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
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

function createDetachedExportSurface({ poster }: Pick<UseSchoolPosterPdfExportParams, 'poster'>) {
  const shell = document.createElement('div');
  shell.setAttribute('data-school-poster-export-shell', 'true');
  Object.assign(shell.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: `${SCHOOL_POSTER_A4_WIDTH_MM}mm`,
    pointerEvents: 'none',
    background: '#ffffff',
    transform: 'translateX(calc(-100% - 48px))',
    zIndex: '-1',
  } satisfies Partial<CSSStyleDeclaration>);

  const rootNode = document.createElement('div');
  rootNode.setAttribute('data-school-poster-export-root', 'true');
  rootNode.style.width = `${SCHOOL_POSTER_A4_WIDTH_MM}mm`;
  shell.appendChild(rootNode);
  document.body.appendChild(shell);

  const root = createRoot(rootNode);
  flushSync(() => {
    root.render(createElement(PosterShellPreview, { poster }));
  });

  return {
    rootNode,
    cleanup() {
      root.unmount();
      shell.remove();
    },
  };
}

export function useSchoolPosterPdfExport({ poster, isExporting, setIsExporting }: UseSchoolPosterPdfExportParams) {
  const handleExportPdf = useCallback(async () => {
    if (isExporting) return;

    const schoolName = poster.shell.school.nameCn || poster.shell.school.nameEn || 'school-poster';
    const filename = `${sanitizeFilenamePart(schoolName)}_${sanitizeFilenamePart(poster.id)}.pdf`;
    let exportSurface: ReturnType<typeof createDetachedExportSurface> | null = null;

    setIsExporting(true);
    try {
      exportSurface = createDetachedExportSurface({ poster });
      const target = exportSurface.rootNode;

      await waitForFonts();
      await waitForImages(target);
      await waitForNextPaint();

      const targetRect = target.getBoundingClientRect();
      const width = Math.max(
        1,
        Math.round(target.scrollWidth),
        Math.round(target.clientWidth),
        Math.round(targetRect.width)
      );
      const height = Math.max(
        1,
        Math.round(target.scrollHeight),
        Math.round(target.clientHeight),
        Math.round(targetRect.height)
      );

      const canvas = await html2canvas(target, {
        scale: EXPORT_RENDER_SCALE,
        useCORS: true,
        backgroundColor: '#ffffff',
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedShell = clonedDoc.querySelector<HTMLElement>('[data-school-poster-export-shell="true"]');
          if (clonedShell) {
            clonedShell.style.position = 'fixed';
            clonedShell.style.top = '0';
            clonedShell.style.left = '0';
            clonedShell.style.transform = 'none';
            clonedShell.style.pointerEvents = 'none';
            clonedShell.style.background = '#ffffff';
          }

          const clonedTarget = clonedDoc.querySelector<HTMLElement>('[data-school-poster-export-root="true"]');
          if (clonedTarget) {
            clonedTarget.style.width = `${width}px`;
            clonedTarget.style.maxWidth = 'none';
          }
        },
      });

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        pageWidth,
        pageHeight
      );

      const pageCount = pdf.getNumberOfPages();
      if (pageCount > 1) {
        for (let page = pageCount; page > 1; page -= 1) {
          pdf.deletePage(page);
        }
      }

      pdf.save(filename);
    } catch (error) {
      console.error('School poster PDF generation failed', error);
    } finally {
      exportSurface?.cleanup();
      setIsExporting(false);
    }
  }, [isExporting, poster, poster.id, poster.shell.school.nameCn, poster.shell.school.nameEn, setIsExporting]);

  return {
    handleExportPdf,
  };
}
