import { createClient } from '@/lib/supabase/server';
import { createInvoiceShare, CreateShareOptions, getOwnedInvoiceById } from '@/lib/supabase-share';
import { NextRequest, NextResponse } from 'next/server';

function sanitizeShareOptions(input: CreateShareOptions | undefined): CreateShareOptions {
  const allowDownload = input?.allowDownload ?? true;
  const expiresInDays = input?.expiresInDays ?? null;

  return {
    allowDownload: Boolean(allowDownload),
    expiresInDays:
      expiresInDays === null || expiresInDays === undefined
        ? null
        : [1, 3, 7, 14, 30, 90].includes(Number(expiresInDays))
          ? Number(expiresInDays)
          : null
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const invoiceId = typeof body?.invoiceId === 'string' ? body.invoiceId : '';
    const options = sanitizeShareOptions(body?.options);

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const invoice = await getOwnedInvoiceById(supabase, user.id, invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const share = await createInvoiceShare(supabase, user.id, invoiceId, options);
    return NextResponse.json({ share });
  } catch (error) {
    console.error('API Error creating share:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
