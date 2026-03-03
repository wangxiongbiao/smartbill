import { createClient } from '@/lib/supabase/client';
import { InvoiceTemplate, Invoice } from '../types';
import { safeDeepClean } from './utils';

const supabase = createClient();

/**
 * 创建新的发票模板
 */
export async function saveTemplate(
    userId: string,
    name: string,
    description: string,
    templateData: Partial<Invoice>
): Promise<InvoiceTemplate> {
    // Use safeDeepClean for robust sanitization of template data
    const cleanTemplateData = safeDeepClean(templateData);

    // 清理模板数据，移除不应保存的字段
    const cleanedData = {
        ...cleanTemplateData,
        id: undefined,
        invoiceNumber: undefined,
        date: undefined,
        dueDate: undefined,
        client: {
            name: '',
            email: '',
            address: '',
            phone: ''
        },
        status: 'Draft'
    };

    const { data, error } = await supabase
        .from('invoice_templates')
        .insert({
            user_id: userId,
            name,
            description,
            template_data: cleanedData
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving template:', error);
        throw error;
    }

    return data as InvoiceTemplate;
}

/**
 * 获取用户的所有模板
 */
export async function getUserTemplates(userId: string): Promise<InvoiceTemplate[]> {
    const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching templates:', error);
        throw error;
    }

    return data as InvoiceTemplate[];
}

/**
 * 获取单个模板详情
 */
export async function getTemplate(templateId: string): Promise<InvoiceTemplate | null> {
    const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('id', templateId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No rows returned
            return null;
        }
        console.error('Error fetching template:', error);
        throw error;
    }

    return data as InvoiceTemplate;
}

/**
 * 更新模板
 */
export async function updateTemplate(
    templateId: string,
    updates: Partial<InvoiceTemplate>
): Promise<void> {
    const { error } = await supabase
        .from('invoice_templates')
        .update(updates)
        .eq('id', templateId);

    if (error) {
        console.error('Error updating template:', error);
        throw error;
    }
}

/**
 * 删除模板
 */
export async function deleteTemplate(templateId: string): Promise<void> {
    const { error } = await supabase
        .from('invoice_templates')
        .delete()
        .eq('id', templateId);

    if (error) {
        console.error('Error deleting template:', error);
        throw error;
    }
}

/**
 * 增加模板使用次数
 */
export async function incrementTemplateUsage(templateId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_template_usage', {
        template_id: templateId
    });

    if (error) {
        // 如果RPC函数不存在，使用fallback方法
        console.warn('RPC function not found, using fallback method');
        const template = await getTemplate(templateId);
        if (template) {
            await updateTemplate(templateId, {
                usage_count: (template.usage_count || 0) + 1
            });
        }
    }
}
