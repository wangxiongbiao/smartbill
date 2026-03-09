import { NextResponse } from 'next/server';
import { getDefaultTemplates } from '@/lib/templates';
import { createDefaultInvoice } from '@/lib/invoice-defaults';
import { buildInvoicePdf, getInvoicePdfFileName } from '@/lib/invoice-pdf';
import { TemplateType } from '@/types/invoice';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const baseTemplate = (url.searchParams.get('template') || 'minimalist') as TemplateType;
    const name = url.searchParams.get('name') || 'invoice-template';
    const description = url.searchParams.get('description') || '';

    const defaultTemplate = getDefaultTemplates('system').find((template) => {
      return template.id === id || template.baseTemplate === baseTemplate;
    });

    const invoice = defaultTemplate?.invoice || createDefaultInvoice(undefined, { template: baseTemplate });
    invoice.template = baseTemplate;
    invoice.customTitle = name;

    if (!invoice.notes) {
      invoice.notes = description;
    }

    const pdfBytes = await buildInvoicePdf(invoice);
    const fileName = getInvoicePdfFileName(invoice, 'invoice-template', name);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to export template PDF:', error);
    return NextResponse.json({ error: 'Failed to export PDF' }, { status: 500 });
  }
}
