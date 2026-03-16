import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createBrowserClient } from './supabase/client';
import { Invoice, Profile } from '../types';
import { safeDeepClean } from './utils';

function getSupabaseClient(supabase?: SupabaseClient) {
    return supabase ?? createBrowserClient();
}

function isMissingTableError(error: { code?: string; message?: string } | null, tableName: string) {
    return error?.code === '42P01' || error?.message?.includes(tableName);
}

function sanitizeSearchTerm(value: string) {
    return value.replace(/[,%()]/g, ' ').trim();
}

/**
 * 获取用户 profile
 */
export async function getUserProfile(userId: string, supabase?: SupabaseClient): Promise<Profile | null> {
    const client = getSupabaseClient(supabase);
    const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            console.log('[getUserProfile] Profile not found for user:', userId, '(first-time user)');
            return null;
        }
        if (isMissingTableError(error, 'profiles')) {
            console.warn('[getUserProfile] profiles table is missing, returning null profile');
            return null;
        }
        console.error('[getUserProfile] Error fetching profile:', error);
        return null;
    }
    return data;
}

/**
 * 更新用户 profile
 */
export async function updateUserProfile(userId: string, updates: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>, supabase?: SupabaseClient) {
    const client = getSupabaseClient(supabase);
    const { error } = await client
        .from('profiles')
        .upsert({
            id: userId,
            ...updates,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'id'
        });

    if (error) {
        if (isMissingTableError(error, 'profiles')) {
            console.warn('[updateUserProfile] profiles table is missing, skipping remote profile update');
            return;
        }
        console.error('Error updating profile:', error);
        throw error;
    }
}

/**
 * 保存或更新发票到数据库
 */
export async function saveInvoice(userId: string, invoice: Invoice, supabase?: SupabaseClient): Promise<void> {
    console.log('[saveInvoice] 开始保存');
    console.log('[saveInvoice] userId:', userId);
    console.log('[saveInvoice] invoice.id:', invoice.id);
    console.log('[saveInvoice] invoice.invoiceNumber:', invoice.invoiceNumber);

    const client = getSupabaseClient(supabase);
    const cleanInvoiceData = safeDeepClean(invoice);

    if (!cleanInvoiceData || !cleanInvoiceData.id) {
        console.error('[saveInvoice] ❌ Error: Cleaned invoice data is invalid');
        throw new Error('Failed to sanitize invoice data');
    }

    const normalizedInvoice: Invoice = {
        ...cleanInvoiceData,
        id: String(cleanInvoiceData.id),
    };

    const payload = {
        id: normalizedInvoice.id,
        user_id: userId,
        invoice_number: normalizedInvoice.invoiceNumber,
        invoice_data: normalizedInvoice,
        updated_at: new Date().toISOString()
    };

    console.log('[saveInvoice] 准备 upsert，payload已清理');

    const { data, error } = await client
        .from('invoices')
        .upsert(payload, {
            onConflict: 'id'
        })
        .select();

    if (error) {
        console.error('[saveInvoice] ❌ Supabase 错误:', error);
        console.error('[saveInvoice] 错误详情:', JSON.stringify(error, null, 2));
        throw error;
    }

    console.log('[saveInvoice] ✅ 保存成功，返回数据:', data);
}

/**
 * 获取用户所有发票
 */
export async function getUserInvoices(userId: string, supabase?: SupabaseClient): Promise<Invoice[]> {
    const client = getSupabaseClient(supabase);
    const { data, error } = await client
        .from('invoices')
        .select('invoice_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        if (isMissingTableError(error, 'invoices')) {
            console.warn('[getUserInvoices] invoices table is missing, returning empty list');
            return [];
        }
        console.error('Error fetching invoices:', error);
        throw error;
    }

    return (data || [])
        .map(row => row.invoice_data as Invoice | null)
        .filter((invoice): invoice is Invoice => Boolean(invoice?.id));
}

export async function getUserInvoicesPage(
    userId: string,
    params: {
        page: number;
        pageSize: number;
        search?: string;
        month?: number | null;
    },
    supabase?: SupabaseClient
): Promise<{ invoices: Invoice[]; totalCount: number }> {
    const client = getSupabaseClient(supabase);
    const page = Math.max(1, Math.floor(params.page));
    const pageSize = Math.max(1, Math.min(100, Math.floor(params.pageSize)));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const search = sanitizeSearchTerm(params.search || '');
    const month = typeof params.month === 'number' && params.month >= 1 && params.month <= 12 ? params.month : null;

    let query = client
        .from('invoices')
        .select('invoice_data', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (search) {
        query = query.or(`invoice_number.ilike.%${search}%,invoice_data->client->>name.ilike.%${search}%`);
    }

    if (month) {
        query = query.filter('invoice_data->>date', 'like', `____-${month.toString().padStart(2, '0')}-%`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
        if (isMissingTableError(error, 'invoices')) {
            console.warn('[getUserInvoicesPage] invoices table is missing, returning empty page');
            return { invoices: [], totalCount: 0 };
        }
        console.error('Error fetching invoice page:', error);
        throw error;
    }

    return {
        invoices: (data || [])
            .map(row => row.invoice_data as Invoice | null)
            .filter((invoice): invoice is Invoice => Boolean(invoice?.id)),
        totalCount: count || 0,
    };
}

/**
 * 获取用户最新的一张发票
 */
export async function getLatestInvoice(userId: string, supabase?: SupabaseClient): Promise<Invoice | null> {
    const client = getSupabaseClient(supabase);
    const { data, error } = await client
        .from('invoices')
        .select('invoice_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        if (isMissingTableError(error ?? null, 'invoices')) {
            console.warn('[getLatestInvoice] invoices table is missing, returning null');
            return null;
        }
        console.log('[getLatestInvoice] No invoice found or error:', error?.message);
        return null;
    }

    return data.invoice_data as Invoice;
}

/**
 * 删除发票
 */
export async function deleteInvoice(invoiceId: string, userId?: string, supabase?: SupabaseClient): Promise<void> {
    const client = getSupabaseClient(supabase);
    let query = client
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
        if (isMissingTableError(error, 'invoices')) {
            console.warn('[deleteInvoice] invoices table is missing, skipping remote delete');
            return;
        }
        console.error('Error deleting invoice:', error);
        throw error;
    }
}

/**
 * 批量保存发票 (用于首次同步 localStorage 数据)
 */
export async function batchSaveInvoices(userId: string, invoices: Invoice[], supabase?: SupabaseClient): Promise<void> {
    const client = getSupabaseClient(supabase);
    const cleanInvoices = invoices.map(invoice => safeDeepClean(invoice)).filter(i => i && i.id);

    const records = cleanInvoices.map(invoice => ({
        id: invoice.id,
        user_id: userId,
        invoice_number: invoice.invoiceNumber,
        invoice_data: invoice,
        updated_at: new Date().toISOString()
    }));

    const { error } = await client
        .from('invoices')
        .upsert(records, { onConflict: 'id' });

    if (error) {
        if (isMissingTableError(error, 'invoices')) {
            console.warn('[batchSaveInvoices] invoices table is missing, skipping remote batch sync');
            return;
        }
        console.error('Error batch saving invoices:', error);
        throw error;
    }
}
