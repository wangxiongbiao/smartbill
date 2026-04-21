import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildBillingProfileSearchKey,
  getBillingProfileSnapshot,
  hasBillingProfileContent,
  mapBillingProfileRow,
  sanitizeBillingProfileSnapshot,
} from '@/lib/billing-profiles';
import type { BillingProfile, BillingProfileKind, Client, Invoice, Sender } from '@/types';

function isMissingBillingProfilesTableError(error: { code?: string; message?: string } | null) {
  return error?.code === '42P01' || error?.message?.includes('billing_profiles');
}

export async function listUserBillingProfiles(
  userId: string,
  supabase: SupabaseClient,
  kind?: BillingProfileKind
): Promise<BillingProfile[]> {
  let query = supabase
    .from('billing_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('last_used_at', { ascending: false })
    .order('updated_at', { ascending: false });

  if (kind) {
    query = query.eq('kind', kind);
  }

  const { data, error } = await query;

  if (error) {
    if (isMissingBillingProfilesTableError(error)) return [];
    console.error('[listUserBillingProfiles] Error fetching billing profiles:', error);
    throw error;
  }

  return (data || []).map((row) => mapBillingProfileRow(row as Record<string, unknown>));
}

export async function saveUserBillingProfile(
  userId: string,
  kind: BillingProfileKind,
  source: Partial<Sender | Client>,
  supabase: SupabaseClient,
  options?: { makeDefault?: boolean }
): Promise<BillingProfile | null> {
  const snapshot = sanitizeBillingProfileSnapshot(source);
  if (!hasBillingProfileContent(snapshot)) {
    throw new Error('Billing profile name is required');
  }

  if (options?.makeDefault && kind === 'sender') {
    const { error: resetError } = await supabase
      .from('billing_profiles')
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('kind', kind)
      .eq('is_default', true);

    if (resetError && !isMissingBillingProfilesTableError(resetError)) {
      console.error('[saveUserBillingProfile] Error clearing sender default:', resetError);
      throw resetError;
    }
  }

  const now = new Date().toISOString();
  const payload = {
    user_id: userId,
    kind,
    search_key: buildBillingProfileSearchKey(snapshot),
    name: snapshot.name,
    email: snapshot.email,
    phone: snapshot.phone || null,
    address: snapshot.address,
    custom_fields: snapshot.customFields,
    is_default: Boolean(options?.makeDefault && kind === 'sender'),
    last_used_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('billing_profiles')
    .upsert(payload, { onConflict: 'user_id,kind,search_key' })
    .select('*')
    .single();

  if (error) {
    if (isMissingBillingProfilesTableError(error)) return null;
    console.error('[saveUserBillingProfile] Error saving billing profile:', error);
    throw error;
  }

  return mapBillingProfileRow(data as Record<string, unknown>);
}

async function upsertBillingProfileSnapshot(
  userId: string,
  kind: BillingProfileKind,
  invoice: Invoice,
  supabase: SupabaseClient
) {
  const snapshot = getBillingProfileSnapshot(kind, invoice);
  if (!hasBillingProfileContent(snapshot)) return;

  const now = new Date().toISOString();
  const payload = {
    user_id: userId,
    kind,
    search_key: buildBillingProfileSearchKey(snapshot),
    name: snapshot.name,
    email: snapshot.email,
    phone: snapshot.phone || null,
    address: snapshot.address,
    custom_fields: snapshot.customFields,
    last_used_at: now,
    updated_at: now,
  };

  const { error } = await supabase
    .from('billing_profiles')
    .upsert(payload, { onConflict: 'user_id,kind,search_key' });

  if (error) {
    if (isMissingBillingProfilesTableError(error)) return;
    console.error('[upsertBillingProfileSnapshot] Error syncing billing profile:', error);
    throw error;
  }
}

export async function syncBillingProfilesForInvoice(userId: string, invoice: Invoice, supabase: SupabaseClient) {
  await upsertBillingProfileSnapshot(userId, 'sender', invoice, supabase);
  await upsertBillingProfileSnapshot(userId, 'client', invoice, supabase);
}
