import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteSchoolPoster, getUserSchoolPosters, saveSchoolPoster } from '@/lib/supabase-school-posters';
import { normalizeSchoolPoster } from '@/lib/school-posters';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const posters = await getUserSchoolPosters(user.id, supabase);
    return NextResponse.json({ posters });
  } catch (error) {
    console.error('[api/school-posters][GET] Failed to load school posters:', error);
    return NextResponse.json({ error: 'Failed to load school posters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body?.poster?.id) {
      return NextResponse.json({ error: 'School poster is required' }, { status: 400 });
    }

    const normalizedPoster = normalizeSchoolPoster({
      ...body.poster,
      id: String(body.poster.id),
    });

    const savedPoster = await saveSchoolPoster(user.id, normalizedPoster, supabase);
    return NextResponse.json({ success: true, poster: savedPoster });
  } catch (error) {
    console.error('[api/school-posters][POST] Failed to save school poster:', error);
    return NextResponse.json({ error: 'Failed to save school poster' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const posterId = request.nextUrl.searchParams.get('id');
    if (!posterId) return NextResponse.json({ error: 'School poster ID is required' }, { status: 400 });

    await deleteSchoolPoster(posterId, user.id, supabase);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/school-posters][DELETE] Failed to delete school poster:', error);
    return NextResponse.json({ error: 'Failed to delete school poster' }, { status: 500 });
  }
}
