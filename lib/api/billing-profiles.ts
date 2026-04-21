import { apiRequest } from './client';
import type { BillingProfile, BillingProfileKind, Client, Sender } from '@/types';

export async function listBillingProfiles(kind?: BillingProfileKind) {
  const search = kind ? `?kind=${encodeURIComponent(kind)}` : '';
  return apiRequest<{ profiles: BillingProfile[] }>(`/api/billing-profiles${search}`);
}

export async function saveBillingProfile(kind: BillingProfileKind, profile: Partial<Sender | Client>, makeDefault = false) {
  return apiRequest<{ profile: BillingProfile | null }>(`/api/billing-profiles`, {
    method: 'POST',
    body: JSON.stringify({ kind, profile, makeDefault }),
  });
}
