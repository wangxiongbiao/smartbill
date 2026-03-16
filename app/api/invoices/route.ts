import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteInvoice, getUserInvoices, getUserInvoicesPage, saveInvoice } from '@/lib/supabase-db';
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

    const pageRaw = request.nextUrl.searchParams.get('page');
    const pageSizeRaw = request.nextUrl.searchParams.get('pageSize');
    const pageParam = pageRaw === null ? NaN : Number(pageRaw);
    const pageSizeParam = pageSizeRaw === null ? NaN : Number(pageSizeRaw);
    const search = request.nextUrl.searchParams.get('search') || undefined;
    const monthRaw = request.nextUrl.searchParams.get('month');
    const monthParam = monthRaw === null ? NaN : Number(monthRaw);

    if (Number.isFinite(pageParam) && pageParam > 0 && Number.isFinite(pageSizeParam) && pageSizeParam > 0) {
      const { invoices, totalCount } = await getUserInvoicesPage(user.id, {
        page: pageParam,
        pageSize: pageSizeParam,
        search,
        month: Number.isFinite(monthParam) ? monthParam : null,
      }, supabase);

      const normalizedInvoices = invoices.map((invoice) => ({
        ...invoice,
        id: String(invoice.id),
        status: normalizeInvoiceStatus(invoice.status),
      }));

      return NextResponse.json({ invoices: normalizedInvoices, totalCount, page: pageParam, pageSize: pageSizeParam });
    }

    const invoices = (await getUserInvoices(user.id, supabase)).map((invoice) => ({
      ...invoice,
      id: String(invoice.id),
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
      id: String(body.invoice.id),
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
