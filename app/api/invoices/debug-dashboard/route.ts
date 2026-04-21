import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserInvoices } from '@/lib/supabase-db';
import { calculateInvoiceTotal, calculateInvoiceTotals } from '@/lib/invoice';
import { getInvoiceDisplayStatus, normalizeInvoiceStatus } from '@/lib/invoice-status';

function isBillingRecord(invoice: { status?: string }) {
  const normalized = normalizeInvoiceStatus(invoice.status as any);
  return normalized === 'Pending' || normalized === 'Paid';
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoiceId = request.nextUrl.searchParams.get('id');
  const invoices = await getUserInvoices(user.id, supabase);
  const now = new Date();

  const inspected = invoices
    .filter((invoice) => (invoiceId ? invoice.id === invoiceId : true))
    .map((invoice) => {
      const totals = calculateInvoiceTotals(invoice.items || [], invoice.taxRate || 0);
      const total = calculateInvoiceTotal(invoice);
      const displayStatus = getInvoiceDisplayStatus(invoice, now);
      const billable = isBillingRecord(invoice);
      const countedIn = {
        totalBilled: billable,
        unpaid: billable && displayStatus !== 'paid',
        paid: billable && displayStatus === 'paid',
        overdue: billable && displayStatus === 'overdue',
      };

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        dueDate: invoice.dueDate,
        displayStatus,
        billable,
        countedIn,
        taxRate: invoice.taxRate || 0,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total,
        items: (invoice.items || []).map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          effectiveLineTotal:
            item.amount !== undefined && item.amount !== '' && !Number.isNaN(Number(item.amount))
              ? Number(item.amount)
              : Number(item.quantity || 0) * Number(item.rate || 0),
        })),
      };
    });

  return NextResponse.json({
    now: now.toISOString(),
    totalInvoices: invoices.length,
    inspectedCount: inspected.length,
    inspected,
  });
}
