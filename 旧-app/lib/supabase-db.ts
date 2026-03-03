import { createClient } from './supabase/client';
import { Invoice, Profile } from '../types';
import { safeDeepClean } from './utils';

/**
 * 获取用户 profile
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        // PGRST116 means no rows found, which is normal for first-time users
        if (error.code === 'PGRST116') {
            console.log('[getUserProfile] Profile not found for user:', userId, '(first-time user)');
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
export async function updateUserProfile(userId: string, updates: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>) {
    const supabase = createClient();
    const { error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

/**
 * 保存或更新发票到数据库
 */
export async function saveInvoice(userId: string, invoice: Invoice): Promise<void> {
    console.log('[saveInvoice] 开始保存');
    console.log('[saveInvoice] userId:', userId);
    console.log('[saveInvoice] invoice.id:', invoice.id);
    console.log('[saveInvoice] invoice.invoiceNumber:', invoice.invoiceNumber);

    const supabase = createClient();

    // Use safeDeepClean to remove circular references and DOM nodes
    const cleanInvoiceData = safeDeepClean(invoice);

    if (!cleanInvoiceData || !cleanInvoiceData.id) {
        console.error('[saveInvoice] ❌ Error: Cleaned invoice data is invalid');
        throw new Error('Failed to sanitize invoice data');
    }

    const payload = {
        id: cleanInvoiceData.id,
        user_id: userId,
        invoice_number: cleanInvoiceData.invoiceNumber,
        invoice_data: cleanInvoiceData,
        updated_at: new Date().toISOString()
    };

    console.log('[saveInvoice] 准备 upsert，payload已清理');

    const { data, error } = await supabase
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
export async function getUserInvoices(userId: string): Promise<Invoice[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('invoices')
        .select('invoice_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }

    return data.map(row => row.invoice_data as Invoice);
}

/**
 * 获取用户最新的一张发票
 */
export async function getLatestInvoice(userId: string): Promise<Invoice | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('invoices')
        .select('invoice_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        console.log('[getLatestInvoice] No invoice found or error:', error?.message);
        return null;
    }

    return data.invoice_data as Invoice;
}

/**
 * 删除发票
 */
export async function deleteInvoice(invoiceId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

    if (error) {
        console.error('Error deleting invoice:', error);
        throw error;
    }
}

/**
 * 批量保存发票 (用于首次同步 localStorage 数据)
 */
export async function batchSaveInvoices(userId: string, invoices: Invoice[]): Promise<void> {
    const supabase = createClient();

    // Use safeDeepClean for robust sanitization of all invoices
    const cleanInvoices = invoices.map(invoice => safeDeepClean(invoice)).filter(i => i && i.id);

    const records = cleanInvoices.map(invoice => ({
        id: invoice.id,
        user_id: userId,
        invoice_number: invoice.invoiceNumber,
        invoice_data: invoice,
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
        .from('invoices')
        .upsert(records, { onConflict: 'id' });

    if (error) {
        console.error('Error batch saving invoices:', error);
        throw error;
    }
}
