import { supabase } from './supabase-browser';
import { Invoice } from '@/types/invoice';
import { safeDeepClean } from './utils';

/**
 * 保存或更新发票到数据库
 */
export async function saveInvoice(userId: string, invoice: Invoice): Promise<void> {
    // Sanitize data before saving
    const cleanInvoiceData = safeDeepClean(invoice);

    if (!cleanInvoiceData || !cleanInvoiceData.id) {
        throw new Error('Failed to sanitize invoice data');
    }

    const payload = {
        id: cleanInvoiceData.id,
        user_id: userId,
        invoice_number: cleanInvoiceData.invoiceNumber,
        invoice_data: cleanInvoiceData,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('invoices')
        .upsert(payload, {
            onConflict: 'id'
        });

    if (error) {
        console.error('[saveInvoice] Error:', error);
        throw error;
    }
}

/**
 * 获取用户所有发票
 */
export async function getUserInvoices(userId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
        .from('invoices')
        .select('invoice_data')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }

    return (data || []).map((row: any) => row.invoice_data as Invoice);
}

/**
 * 根据 ID 获取单张发票
 */
export async function getInvoiceById(userId: string, invoiceId: string): Promise<Invoice | null> {
    const { data, error } = await supabase
        .from('invoices')
        .select('invoice_data')
        .eq('user_id', userId)
        .eq('id', invoiceId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    return data.invoice_data as Invoice;
}

/**
 * 删除发票
 */
export async function deleteInvoice(invoiceId: string): Promise<void> {
    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

    if (error) {
        console.error('Error deleting invoice:', error);
        throw error;
    }
}
