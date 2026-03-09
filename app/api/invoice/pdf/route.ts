import { NextResponse } from 'next/server';
import { getInvoicePdfFileName, buildInvoicePdf } from '@/lib/invoice-pdf';
import { Invoice } from '@/types/invoice';

interface ExportInvoicePdfRequest {
  invoice?: Invoice;
  fileName?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ExportInvoicePdfRequest;
    const invoice = body.invoice;

    if (!invoice?.items || !invoice.sender || !invoice.client) {
      return NextResponse.json({ error: 'Invalid invoice payload' }, { status: 400 });
    }

    const pdfBytes = await buildInvoicePdf(invoice);
    const fileName = getInvoicePdfFileName(invoice, 'invoice', body.fileName);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to export invoice PDF:', error);
    return NextResponse.json({ error: 'Failed to export PDF' }, { status: 500 });
  }
}
