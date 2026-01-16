
import { SupabaseClient } from '@supabase/supabase-js';
import { Invoice } from '../types';
import { nanoid } from 'nanoid';

export interface InvoiceShare {
    id: string;
    invoice_id: string;
    user_id: string;
    share_token: string;
    allow_download: boolean;
    expires_at: string | null;
    created_at: string;
    last_accessed_at: string | null;
    access_count: number;
}

export interface CreateShareOptions {
    allowDownload?: boolean;
    expiresInDays?: number | null; // null means never expires
}

/**
 * 创建发票分享链接
 */
export async function createInvoiceShare(
    supabase: SupabaseClient,
    userId: string,
    invoiceId: string,
    options: CreateShareOptions = {}
): Promise<InvoiceShare> {
    const shareToken = nanoid(32); // Generate a secure 32-char token

    let expiresAt = null;
    if (options.expiresInDays) {
        const date = new Date();
        date.setDate(date.getDate() + options.expiresInDays);
        expiresAt = date.toISOString();
    }

    const payload = {
        invoice_id: invoiceId,
        user_id: userId,
        share_token: shareToken,
        allow_download: options.allowDownload ?? true,
        expires_at: expiresAt,
    };

    const { data, error } = await supabase
        .from('invoice_shares')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error('Error creating invoice share:', error);
        throw error;
    }

    return data as InvoiceShare;
}

/**
 * 获取该发票的所有活跃分享链接
 */
export async function getInvoiceShares(supabase: SupabaseClient, userId: string, invoiceId: string): Promise<InvoiceShare[]> {
    const { data, error } = await supabase
        .from('invoice_shares')
        .select('*')
        .eq('user_id', userId)
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invoice shares:', error);
        throw error;
    }

    return data as InvoiceShare[];
}

/**
 * 撤销分享链接
 */
export async function revokeInvoiceShare(supabase: SupabaseClient, userId: string, shareId: string): Promise<void> {
    const { error } = await supabase
        .from('invoice_shares')
        .delete()
        .eq('id', shareId)
        .eq('user_id', userId); // Ensure ownership

    if (error) {
        console.error('Error revoking invoice share:', error);
        throw error;
    }
}

/**
 * 通过Token获取分享的发票数据 (Public access)
 */
export async function getShareByToken(supabase: SupabaseClient, token: string): Promise<{ share: InvoiceShare, invoice: Invoice } | null> {
    // 1. Get share record
    const { data: shareData, error: shareError } = await supabase
        .from('invoice_shares')
        .select('*')
        .eq('share_token', token)
        .single();

    if (shareError || !shareData) {
        console.error('Error fetching share by token:', shareError);
        return null;
    }

    // Check expiration
    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
        console.warn('Share token expired');
        return null;
    }

    // 2. Get invoice data via RPC
    const { data: invoiceData, error: invoiceError } = await supabase
        .rpc('get_invoice_by_share_token', { token_input: token });

    if (invoiceError || !invoiceData) {
        console.error('Error fetching invoice via RPC:', invoiceError);

        // Fallback logic not needed here ideally, assume RPC works
        return null;
    }

    return {
        share: shareData as InvoiceShare,
        invoice: invoiceData as Invoice
    };
}

/**
 * 更新访问统计
 */
export async function incrementShareAccess(supabase: SupabaseClient, shareId: string) {
    const { error } = await supabase.rpc('increment_share_access', { share_id: shareId });
    if (error) {
        console.error('Error incrementing share access:', error);
    }
}
