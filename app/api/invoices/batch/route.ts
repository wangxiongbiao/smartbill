import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { batchSaveInvoices } from '@/lib/supabase-db';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const invoices = Array.isArray(body?.invoices) ? body.invoices : [];

  await batchSaveInvoices(user.id, invoices);
  return NextResponse.json({ success: true });
}
