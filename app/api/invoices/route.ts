import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteInvoice, getUserInvoices, saveInvoice } from '@/lib/supabase-db';
import { syncBillingProfilesForInvoice } from '@/lib/supabase-billing-profiles';
import { normalizeInvoiceStatus } from '@/lib/invoice-status';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = request.nextUrl.searchParams.get('userId');
    if (userId && userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invoices = (await getUserInvoices(user.id, supabase)).map((invoice) => ({
      ...invoice,
      status: normalizeInvoiceStatus(invoice.status),
    }));

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('[api/invoices][GET] Failed to load invoices:', error);
    return NextResponse.json({ error: 'Failed to load invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body?.invoice?.id) {
      return NextResponse.json({ error: 'Invoice is required' }, { status: 400 });
    }

    const normalizedInvoice = {
      ...body.invoice,
      status: normalizeInvoiceStatus(body.invoice.status),
    };

    await saveInvoice(user.id, normalizedInvoice, supabase);
    try {
      await syncBillingProfilesForInvoice(user.id, normalizedInvoice, supabase);
    } catch (error) {
      console.error('Failed to sync billing profiles after saving invoice:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/invoices][POST] Failed to save invoice:', error);
    return NextResponse.json({ error: 'Failed to save invoice' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const invoiceId = request.nextUrl.searchParams.get('id');
    if (!invoiceId) return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });

    await deleteInvoice(invoiceId, user.id, supabase);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/invoices][DELETE] Failed to delete invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
