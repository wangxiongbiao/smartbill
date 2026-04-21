import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserTemplates, getUserTemplatesCount, getUserTemplatesPage, saveTemplate } from '@/lib/supabase-templates';
import { normalizeTemplateType } from '@/lib/template-types';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pageParam = Number(request.nextUrl.searchParams.get('page'));
  const pageSizeParam = Number(request.nextUrl.searchParams.get('pageSize'));
  const templateType = normalizeTemplateType(request.nextUrl.searchParams.get('templateType'));
  const countOnly = request.nextUrl.searchParams.get('countOnly') === '1';

  if (countOnly) {
    const totalCount = await getUserTemplatesCount(supabase, user.id);
    return NextResponse.json({ totalCount });
  }

  if (Number.isFinite(pageParam) && Number.isFinite(pageSizeParam)) {
    const { templates, totalCount, overallCount } = await getUserTemplatesPage(supabase, user.id, {
      page: pageParam,
      pageSize: pageSizeParam,
      templateType,
    });

    return NextResponse.json({ templates, totalCount, overallCount, page: pageParam, pageSize: pageSizeParam });
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
