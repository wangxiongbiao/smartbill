import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile, updateUserProfile } from '@/lib/supabase-db';
import { sanitizeText } from '@/lib/server/request';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestedUserId = request.nextUrl.searchParams.get('userId');
  if (requestedUserId && requestedUserId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const profile = await getUserProfile(user.id);
  return NextResponse.json({ profile });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const fullName = sanitizeText(body?.fullName, 120);

  if (!fullName) {
    return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
  }

  await updateUserProfile(user.id, { full_name: fullName });
  const profile = await getUserProfile(user.id);

  return NextResponse.json({ success: true, profile });
}
