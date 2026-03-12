import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserTemplates, saveTemplate } from '@/lib/supabase-templates';
import { normalizeTemplateType } from '@/lib/template-types';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = request.nextUrl.searchParams.get('userId');
  if (userId && userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const templates = await getUserTemplates(supabase, user.id);
  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const templateType = normalizeTemplateType(body?.templateType);

  if (!body?.name || !body?.templateData || !templateType) {
    return NextResponse.json({ error: 'Invalid template payload' }, { status: 400 });
  }

  const template = await saveTemplate(
    supabase,
    user.id,
    body.name,
    body.description || '',
    templateType,
    body.templateData
  );
  return NextResponse.json({ template });
}
