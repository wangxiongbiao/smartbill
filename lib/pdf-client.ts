import { Invoice } from '@/types/invoice';

interface DownloadInvoicePdfOptions {
  invoice: Invoice;
  fileName?: string;
}

interface InvoicePdfPayload {
  blob: Blob;
  fileName: string;
}

interface ExportPreviewPdfOptions {
  element: HTMLElement;
  fileName?: string;
  scale?: number;
}

function resolvePdfFileName(fileName?: string, disposition?: string | null) {
  const matchedFileName = disposition?.match(/filename="([^"]+)"/)?.[1];
  return matchedFileName || fileName || 'invoice.pdf';
}

function sanitizeFileName(fileName?: string) {
  const cleaned = (fileName || 'invoice').trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-');
  return cleaned.endsWith('.pdf') ? cleaned : `${cleaned || 'invoice'}.pdf`;
}

async function waitForPreviewAssets(element: HTMLElement) {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    } catch {
      // Ignore font loading failures and continue exporting.
    }
  }

  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  }));
}

export async function requestInvoicePdf({ invoice, fileName }: DownloadInvoicePdfOptions): Promise<InvoicePdfPayload> {
  const response = await fetch('/api/invoice/pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      invoice,
      fileName,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to export PDF');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');

  return {
    blob,
    fileName: resolvePdfFileName(fileName, disposition),
  };
}

export async function exportPreviewElementToPdf({
  element,
  fileName,
  scale = 2,
}: ExportPreviewPdfOptions) {
  await waitForPreviewAssets(element);

  const [{ toCanvas }, { jsPDF }] = await Promise.all([
    import('html-to-image'),
    import('jspdf'),
  ]);

  const canvas = await toCanvas(element, {
    cacheBust: true,
    pixelRatio: Math.max(1, scale),
    skipAutoScale: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }

  pdf.save(sanitizeFileName(fileName));
}

export function triggerPdfDownload(blob: Blob, fileName: string) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

export async function downloadInvoicePdf({ invoice, fileName }: DownloadInvoicePdfOptions) {
  const payload = await requestInvoicePdf({ invoice, fileName });
  triggerPdfDownload(payload.blob, payload.fileName);
}
