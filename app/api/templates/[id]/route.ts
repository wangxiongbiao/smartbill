import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteTemplate, getTemplate } from '@/lib/supabase-templates';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const template = await getTemplate(supabase, id);

  if (template && template.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ template });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const template = await getTemplate(supabase, id);

  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  if (template.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await deleteTemplate(supabase, id, user.id);
  return NextResponse.json({ success: true });
}
