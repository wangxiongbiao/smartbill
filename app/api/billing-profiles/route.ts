import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listUserBillingProfiles, saveUserBillingProfile } from '@/lib/supabase-billing-profiles';
import { sanitizeBillingCustomFields } from '@/lib/billing-profiles';
import { sanitizeEmail, sanitizeText } from '@/lib/server/request';
import type { BillingProfileKind } from '@/types';

function resolveKind(value: string | null): BillingProfileKind | undefined {
  if (value === 'sender' || value === 'client') return value;
  return undefined;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const kind = resolveKind(request.nextUrl.searchParams.get('kind'));
  const requestedKind = request.nextUrl.searchParams.get('kind');
  if (requestedKind && !kind) {
    return NextResponse.json({ error: 'Invalid billing profile kind' }, { status: 400 });
  }

  const profiles = await listUserBillingProfiles(user.id, supabase, kind);
  return NextResponse.json({ profiles });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const kind = resolveKind(body?.kind);
  if (!kind) {
    return NextResponse.json({ error: 'Invalid billing profile kind' }, { status: 400 });
  }

  const profile = await saveUserBillingProfile(
    user.id,
    kind,
    {
      name: sanitizeText(body?.profile?.name, 160),
      email: sanitizeEmail(body?.profile?.email),
      phone: sanitizeText(body?.profile?.phone, 40),
      address: sanitizeText(body?.profile?.address, 1000),
      customFields: sanitizeBillingCustomFields(body?.profile?.customFields),
    },
    supabase,
    {
      makeDefault: Boolean(body?.makeDefault),
    }
  );

  return NextResponse.json({ profile });
}
