import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFFont, PDFImage, PDFPage, rgb } from 'pdf-lib';
import { Invoice, InvoiceItem } from '@/types/invoice';
import { getInvoiceTheme } from '@/lib/invoice-theme';

type PdfColor = ReturnType<typeof rgb>;

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FONT_PATH = path.join(process.cwd(), 'public', 'fonts', 'NotoSansCJKsc-Regular.otf');

function hexToRgbColor(hex: string) {
  const normalized = hex.replace('#', '');
  const expanded = normalized.length === 3
    ? normalized.split('').map((part) => `${part}${part}`).join('')
    : normalized;

  const value = parseInt(expanded, 16);

  return rgb(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255
  );
}

function toPdfTheme(template?: Invoice['template']) {
  const theme = getInvoiceTheme(template);

  return {
    ...theme,
    pageBackground: hexToRgbColor(theme.pageBackground),
    textColor: hexToRgbColor(theme.textColor),
    mutedColor: hexToRgbColor(theme.mutedColor),
    borderColor: hexToRgbColor(theme.borderColor),
    surfaceColor: hexToRgbColor(theme.surfaceColor),
    accentColor: hexToRgbColor(theme.accentColor),
    headerPanelColor: hexToRgbColor(theme.headerPanelColor),
    titleColor: hexToRgbColor(theme.titleColor),
    metaLabelColor: hexToRgbColor(theme.metaLabelColor),
    metaValueColor: hexToRgbColor(theme.metaValueColor),
    sectionLabelColor: hexToRgbColor(theme.sectionLabelColor),
    tableHeaderFill: hexToRgbColor(theme.tableHeaderFill),
    tableHeaderText: hexToRgbColor(theme.tableHeaderText),
    totalBandFill: theme.totalBandFill ? hexToRgbColor(theme.totalBandFill) : undefined,
    totalBandText: hexToRgbColor(theme.totalBandText),
    continuationRuleColor: hexToRgbColor(theme.continuationRuleColor),
  };
}

function getDisplayText(value: unknown, fallback = '-') {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
}

function getNumericValue(value: unknown) {
  const normalized = Number(value || 0);
  return Number.isFinite(normalized) ? normalized : 0;
}

function getLineAmount(item: InvoiceItem) {
  if (item.amount !== undefined && item.amount !== '') {
    return getNumericValue(item.amount);
  }

  return getNumericValue(item.quantity) * getNumericValue(item.rate);
}

function getSubtotal(invoice: Invoice) {
  return invoice.items.reduce((sum, item) => sum + getLineAmount(item), 0);
}

function formatCurrency(currency: string | undefined, value: number) {
  const normalizedCurrency = currency || 'USD';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${normalizedCurrency} ${value.toFixed(2)}`;
  }
}

function sanitizeFileName(name: string) {
  const cleaned = name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-');
  return cleaned || 'invoice';
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const blocks = text.replace(/\r/g, '').split('\n');
  const lines: string[] = [];

  for (const block of blocks) {
    if (!block) {
      lines.push('');
      continue;
    }

    let currentLine = '';

    for (const char of Array.from(block)) {
      const candidate = currentLine + char;
      if (!currentLine || font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = char;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines.length > 0 ? lines : [''];
}

function drawRightText(page: PDFPage, font: PDFFont, text: string, rightX: number, y: number, size: number, color: PdfColor) {
  page.drawText(text, {
    x: rightX - font.widthOfTextAtSize(text, size),
    y,
    size,
    font,
    color,
  });
}

function drawWrappedText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  options: {
    x: number;
    y: number;
    size: number;
    maxWidth: number;
    lineHeight: number;
    color: PdfColor;
  }
) {
  const lines = wrapText(text, font, options.size, options.maxWidth);

  lines.forEach((line, index) => {
    page.drawText(line, {
      x: options.x,
      y: options.y - index * options.lineHeight,
      size: options.size,
      font,
      color: options.color,
    });
  });

  return options.y - lines.length * options.lineHeight;
}

function drawSectionTitle(page: PDFPage, font: PDFFont, text: string, y: number, color: PdfColor) {
  page.drawText(text, {
    x: MARGIN,
    y,
    size: 9,
    font,
    color,
  });

  return y - 18;
}

function drawDivider(page: PDFPage, y: number, color: PdfColor, thickness = 1) {
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness,
    color,
  });
}

async function embedDataImage(pdfDoc: PDFDocument, imageData?: string) {
  if (!imageData) return null;

  const match = imageData.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
  if (!match) return null;

  const [, type, payload] = match;
  const bytes = Buffer.from(payload, 'base64');

  if (type === 'png') {
    return pdfDoc.embedPng(bytes);
  }

  return pdfDoc.embedJpg(bytes);
}

function scaleImage(image: PDFImage, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  return {
    width: image.width * scale,
    height: image.height * scale,
  };
}

function buildPaymentLines(invoice: Invoice) {
  const visibleFields = invoice.paymentInfo?.fields?.filter((field) => {
    return field.visible !== false && String(field.value || '').trim();
  }) || [];

  return visibleFields.map((field) => `${field.label}: ${field.value}`);
}

function drawPageDecoration(page: PDFPage, theme: ReturnType<typeof toPdfTheme>, isFirstPage: boolean) {
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: theme.pageBackground,
  });

  if (!isFirstPage) {
    drawDivider(page, PAGE_HEIGHT - 28, theme.continuationRuleColor, 2);
    return;
  }

  if (theme.id === 'modern') {
    page.drawRectangle({
      x: MARGIN - 18,
      y: PAGE_HEIGHT - 174,
      width: CONTENT_WIDTH + 36,
      height: 122,
      color: theme.headerPanelColor,
    });
  }

  if (theme.id === 'professional') {
    page.drawRectangle({
      x: PAGE_WIDTH - MARGIN - 212,
      y: PAGE_HEIGHT - 146,
      width: 212,
      height: 116,
      color: theme.headerPanelColor,
    });
  }
}

export async function buildInvoicePdf(invoice: Invoice) {
  const theme = toPdfTheme(invoice.template);
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = await readFile(FONT_PATH);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });

  const logoImage = await embedDataImage(pdfDoc, invoice.sender.logo);
  const qrCodeImage = await embedDataImage(pdfDoc, invoice.paymentInfo?.qrCode);
  const signatureImage = await embedDataImage(pdfDoc, invoice.sender.signature);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  drawPageDecoration(page, theme, true);

  const createPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
    drawPageDecoration(page, theme, false);
  };

  const ensureSpace = (height: number, redrawTableHeader = false) => {
    if (y - height >= MARGIN) return;
    createPage();
    if (redrawTableHeader) {
      drawItemsHeader();
    }
  };

  const drawItemsHeader = () => {
    page.drawRectangle({
      x: MARGIN,
      y: y - 22,
      width: CONTENT_WIDTH,
      height: 22,
      color: theme.tableHeaderFill,
      borderColor: theme.borderColor,
      borderWidth: 1,
    });

    page.drawText('项目', { x: MARGIN + 12, y: y - 15, size: 9, font, color: theme.tableHeaderText });
    drawRightText(page, font, '数量', MARGIN + 330, y - 15, 9, theme.tableHeaderText);
    drawRightText(page, font, '单价', MARGIN + 430, y - 15, 9, theme.tableHeaderText);
    drawRightText(page, font, '金额', PAGE_WIDTH - MARGIN - 12, y - 15, 9, theme.tableHeaderText);
    y -= 32;
  };

  const headerTop = PAGE_HEIGHT - MARGIN;
  let senderY = headerTop;
  const logoWidth = 88;

  if (logoImage) {
    const size = scaleImage(logoImage, logoWidth, 48);
    page.drawImage(logoImage, {
      x: MARGIN,
      y: senderY - size.height,
      width: size.width,
      height: size.height,
    });
    senderY -= size.height + 18;
  }

  const senderTextX = logoImage ? MARGIN : MARGIN;

  page.drawText(getDisplayText(invoice.sender.name, 'Your Company'), {
    x: senderTextX,
    y: senderY,
    size: 22,
    font,
    color: theme.textColor,
  });

  const senderLines = [
    getDisplayText(invoice.sender.address, ''),
    getDisplayText(invoice.sender.phone, ''),
    getDisplayText(invoice.sender.email, ''),
  ].filter(Boolean);

  const senderInfoTopY = senderY - 18;

  senderLines.forEach((line, index) => {
    page.drawText(line, {
      x: senderTextX,
      y: senderInfoTopY - index * 14,
      size: 10,
      font,
      color: theme.mutedColor,
    });
  });

  const senderBottomY = senderInfoTopY - Math.max(0, senderLines.length - 1) * 14;
  const title = getDisplayText(invoice.customTitle || (invoice.type === 'receipt' ? '收据' : '发票'), '发票');

  const invoiceMeta = [
    ['编号', getDisplayText(invoice.invoiceNumber)],
    ['开票日期', getDisplayText(invoice.date)],
    ['到期日期', getDisplayText(invoice.dueDate)],
    ['状态', getDisplayText(invoice.status || 'Draft')],
  ] as const;

  let metaBottomY = headerTop - 58;

  if (theme.id === 'professional') {
    const panelX = PAGE_WIDTH - MARGIN - 212;
    const panelTopY = PAGE_HEIGHT - 58;
    page.drawText(title, {
      x: panelX + 18,
      y: panelTopY,
      size: 28,
      font,
      color: theme.titleColor,
    });

    invoiceMeta.forEach(([label, value], index) => {
      const rowY = panelTopY - 30 - index * 15;
      page.drawText(`${label}:`, {
        x: panelX + 18,
        y: rowY,
        size: 9,
        font,
        color: theme.metaLabelColor,
      });
      drawRightText(page, font, value, PAGE_WIDTH - MARGIN - 18, rowY, 9, theme.metaValueColor);
    });

    metaBottomY = panelTopY - 30 - (invoiceMeta.length - 1) * 15;
  } else {
    drawRightText(page, font, title, PAGE_WIDTH - MARGIN, headerTop + 2, 28, theme.titleColor);

    invoiceMeta.forEach(([label, value], index) => {
      const rowY = headerTop - 30 - index * 16;
      drawRightText(page, font, value, PAGE_WIDTH - MARGIN, rowY, 10, theme.metaValueColor);
      drawRightText(page, font, `${label}:`, PAGE_WIDTH - MARGIN - 88, rowY, 10, theme.metaLabelColor);
    });

    metaBottomY = headerTop - 30 - (invoiceMeta.length - 1) * 16;
  }

  y = Math.min(senderBottomY, metaBottomY) - 28;
  drawDivider(page, y, theme.id === 'professional' ? theme.accentColor : theme.borderColor, theme.id === 'modern' ? 2 : 1);
  y -= 24;

  if (theme.id !== 'minimalist') {
    page.drawRectangle({
      x: MARGIN,
      y: y - 74,
      width: 255,
      height: 66,
      color: theme.surfaceColor,
      borderColor: theme.borderColor,
      borderWidth: 1,
    });
  }

  y = drawSectionTitle(page, font, 'Bill To', y, theme.sectionLabelColor);
  y = drawWrappedText(page, font, getDisplayText(invoice.client.name, 'Client'), {
    x: MARGIN + (theme.id === 'minimalist' ? 0 : 12),
    y,
    size: 13,
    maxWidth: 240,
    lineHeight: 18,
    color: theme.textColor,
  });
  y = drawWrappedText(page, font, getDisplayText(invoice.client.address, ''), {
    x: MARGIN + (theme.id === 'minimalist' ? 0 : 12),
    y: y - 4,
    size: 10,
    maxWidth: 240,
    lineHeight: 14,
    color: theme.mutedColor,
  });
  y = drawWrappedText(page, font, getDisplayText(invoice.client.email, ''), {
    x: MARGIN + (theme.id === 'minimalist' ? 0 : 12),
    y: y - 2,
    size: 10,
    maxWidth: 240,
    lineHeight: 14,
    color: theme.mutedColor,
  });

  y -= 20;
  y = drawSectionTitle(page, font, 'Line Items', y, theme.sectionLabelColor);
  drawItemsHeader();

  invoice.items.forEach((item, index) => {
    const description = getDisplayText(item.description, `项目 ${index + 1}`);
    const descriptionLines = wrapText(description, font, 10, 210);
    const rowHeight = Math.max(24, descriptionLines.length * 14 + 10);
    ensureSpace(rowHeight + 12, true);

    const rowTop = y;
    const rowBottom = rowTop - rowHeight;

    page.drawLine({
      start: { x: MARGIN, y: rowBottom },
      end: { x: PAGE_WIDTH - MARGIN, y: rowBottom },
      thickness: 1,
      color: theme.borderColor,
    });

    descriptionLines.forEach((line, lineIndex) => {
      page.drawText(line, {
        x: MARGIN + 12,
        y: rowTop - 14 - lineIndex * 14,
        size: 10,
        font,
        color: theme.textColor,
      });
    });

    drawRightText(page, font, String(getNumericValue(item.quantity)), MARGIN + 330, rowTop - 14, 10, theme.textColor);
    drawRightText(page, font, formatCurrency(invoice.currency, getNumericValue(item.rate)), MARGIN + 430, rowTop - 14, 10, theme.textColor);
    drawRightText(page, font, formatCurrency(invoice.currency, getLineAmount(item)), PAGE_WIDTH - MARGIN - 12, rowTop - 14, 10, theme.textColor);

    y = rowBottom - 8;
  });

  const subtotal = getSubtotal(invoice);
  const tax = subtotal * (getNumericValue(invoice.taxRate) / 100);
  const total = subtotal + tax;

  ensureSpace(132);
  y -= 8;

  const totalsX = PAGE_WIDTH - MARGIN - 180;
  const totalRows: Array<[string, string]> = [
    ['小计', formatCurrency(invoice.currency, subtotal)],
    [`税费 (${getNumericValue(invoice.taxRate)}%)`, formatCurrency(invoice.currency, tax)],
    ['总计', formatCurrency(invoice.currency, total)],
  ];

  totalRows.forEach(([label, value], index) => {
    const rowY = y - index * 20;
    const isFinal = index === totalRows.length - 1;

    if (isFinal && theme.totalBandFill) {
      page.drawRectangle({
        x: totalsX - 12,
        y: rowY - 8,
        width: PAGE_WIDTH - MARGIN - (totalsX - 12),
        height: 24,
        color: theme.totalBandFill,
      });
    }

    page.drawText(label, {
      x: totalsX,
      y: rowY,
      size: isFinal ? 12 : 10,
      font,
      color: isFinal ? theme.totalBandText : theme.mutedColor,
    });
    drawRightText(
      page,
      font,
      value,
      PAGE_WIDTH - MARGIN,
      rowY,
      isFinal ? 12 : 10,
      isFinal ? theme.totalBandText : theme.textColor
    );
  });

  y -= totalRows.length * 20 + 20;
  drawDivider(page, y, theme.borderColor);
  y -= 24;

  const paymentLines = buildPaymentLines(invoice);
  const hasPaymentBlock = paymentLines.length > 0 || qrCodeImage;

  if (hasPaymentBlock) {
    ensureSpace(qrCodeImage ? 150 : 90);
    y = drawSectionTitle(page, font, 'Payment Details', y, theme.sectionLabelColor);

    const paymentStartY = y;
    const paymentWidth = qrCodeImage ? 260 : CONTENT_WIDTH;
    let paymentEndY = y;

    paymentLines.forEach((line) => {
      paymentEndY = drawWrappedText(page, font, line, {
        x: MARGIN,
        y: paymentEndY,
        size: 10,
        maxWidth: paymentWidth,
        lineHeight: 14,
        color: theme.textColor,
      }) - 6;
    });

    if (qrCodeImage) {
      const size = scaleImage(qrCodeImage, 104, 104);
      page.drawImage(qrCodeImage, {
        x: PAGE_WIDTH - MARGIN - size.width,
        y: paymentStartY - size.height + 4,
        width: size.width,
        height: size.height,
      });
      paymentEndY = Math.min(paymentEndY, paymentStartY - size.height - 12);
    }

    y = paymentEndY - 8;
  }

  const notes = [invoice.notes, invoice.sender.disclaimerText].filter((value) => String(value || '').trim()).join('\n\n');
  if (notes) {
    ensureSpace(110);
    y = drawSectionTitle(page, font, 'Notes', y, theme.sectionLabelColor);
    y = drawWrappedText(page, font, notes, {
      x: MARGIN,
      y,
      size: 10,
      maxWidth: CONTENT_WIDTH - 140,
      lineHeight: 15,
      color: theme.mutedColor,
    }) - 8;
  }

  if (signatureImage) {
    ensureSpace(100);
    y = drawSectionTitle(page, font, 'Signature', y, theme.sectionLabelColor);
    const size = scaleImage(signatureImage, 140, 64);
    page.drawImage(signatureImage, {
      x: MARGIN,
      y: y - size.height + 8,
      width: size.width,
      height: size.height,
    });
    y -= size.height + 8;
  }

  return pdfDoc.save();
}

export function getInvoicePdfFileName(invoice: Invoice, fallback = 'invoice', preferredName?: string) {
  return `${sanitizeFileName(preferredName || invoice.invoiceNumber || invoice.customTitle || fallback)}.pdf`;
}
