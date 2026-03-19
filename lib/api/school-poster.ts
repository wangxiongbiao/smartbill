import { apiRequest } from '@/lib/api/client';
import type { SchoolPoster } from '@/types';

export async function listSchoolPosters() {
  return apiRequest<{ posters: SchoolPoster[] }>(`/api/school-posters`);
}

export async function saveSchoolPosterRecord(poster: SchoolPoster) {
  return apiRequest<{ success: true; poster: SchoolPoster }>(`/api/school-posters`, {
    method: 'POST',
    body: JSON.stringify({ poster }),
  });
}

export async function deleteSchoolPosterRecord(posterId: string) {
  return apiRequest<{ success: true }>(`/api/school-posters?id=${encodeURIComponent(posterId)}`, {
    method: 'DELETE',
  });
}
