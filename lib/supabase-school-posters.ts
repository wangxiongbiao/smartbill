import type { SupabaseClient } from '@supabase/supabase-js';
import type { SchoolPoster } from '@/types';
import { normalizeSchoolPoster } from '@/lib/school-posters';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { safeDeepClean } from '@/lib/utils';

function getSupabaseClient(supabase?: SupabaseClient) {
  return supabase ?? createBrowserClient();
}

function isMissingSchoolPostersTableError(error: { code?: string; message?: string } | null) {
  return error?.code === '42P01' || error?.message?.includes('school_posters');
}

export async function saveSchoolPoster(userId: string, poster: SchoolPoster, supabase?: SupabaseClient): Promise<SchoolPoster> {
  const client = getSupabaseClient(supabase);
  const cleanedPoster = safeDeepClean(poster);

  if (!cleanedPoster || !cleanedPoster.id) {
    throw new Error('Failed to sanitize school poster data');
  }

  const normalizedPoster = normalizeSchoolPoster({
    ...cleanedPoster,
    id: String(cleanedPoster.id),
  });

  const payload = {
    id: normalizedPoster.id,
    user_id: userId,
    layout_id: normalizedPoster.layoutId,
    school_name_cn: normalizedPoster.shell.school.nameCn || null,
    school_name_en: normalizedPoster.shell.school.nameEn || null,
    student_name: normalizedPoster.shell.student.name || null,
    poster_data: normalizedPoster,
    updated_at: new Date().toISOString(),
  };

  const { error } = await client
    .from('school_posters')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    if (isMissingSchoolPostersTableError(error)) {
      console.warn('[saveSchoolPoster] school_posters table is missing');
    }
    throw error;
  }

  return normalizedPoster;
}

export async function getUserSchoolPosters(userId: string, supabase?: SupabaseClient): Promise<SchoolPoster[]> {
  const client = getSupabaseClient(supabase);
  const { data, error } = await client
    .from('school_posters')
    .select('poster_data')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    if (isMissingSchoolPostersTableError(error)) {
      console.warn('[getUserSchoolPosters] school_posters table is missing, returning empty list');
      return [];
    }
    throw error;
  }

  return (data || [])
    .map((row) => row.poster_data as SchoolPoster | null)
    .filter((poster): poster is SchoolPoster => Boolean(poster?.id))
    .map(normalizeSchoolPoster);
}

export async function deleteSchoolPoster(posterId: string, userId?: string, supabase?: SupabaseClient): Promise<void> {
  const client = getSupabaseClient(supabase);
  let query = client
    .from('school_posters')
    .delete()
    .eq('id', posterId);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { error } = await query;

  if (error) {
    if (isMissingSchoolPostersTableError(error)) {
      console.warn('[deleteSchoolPoster] school_posters table is missing, skipping remote delete');
      return;
    }
    throw error;
  }
}
