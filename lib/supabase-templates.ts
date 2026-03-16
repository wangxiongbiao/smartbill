import { resolveTemplateType } from './template-types';
import type { Invoice, InvoiceTemplate, TemplateCategory } from '../types';
import { safeDeepClean } from './utils';

type SupabaseClientLike = any;

function isMissingTemplatesTableError(error: { code?: string; message?: string } | null) {
    return error?.code === '42P01' || error?.message?.includes('invoice_templates');
}

function hydrateTemplateRecord(template: InvoiceTemplate): InvoiceTemplate {
    return {
        ...template,
        template_type: resolveTemplateType(template.template_type)
    };
}

/**
 * 创建新的发票模板
 */
export async function saveTemplate(
    supabase: SupabaseClientLike,
    userId: string,
    name: string,
    description: string,
    templateType: TemplateCategory,
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
        status: 'Pending'
    };

    const { data, error } = await supabase
        .from('invoice_templates')
        .insert({
            user_id: userId,
            name,
            description,
            template_type: templateType,
            template_data: cleanedData
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving template:', error);
        throw error;
    }

    return hydrateTemplateRecord(data as InvoiceTemplate);
}

/**
 * 获取用户的所有模板
 */
export async function getUserTemplates(supabase: SupabaseClientLike, userId: string): Promise<InvoiceTemplate[]> {
    const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        if (isMissingTemplatesTableError(error)) {
            console.warn('[getUserTemplates] invoice_templates table is missing, returning empty list');
            return [];
        }
        console.error('Error fetching templates:', error);
        throw error;
    }

    return (data as InvoiceTemplate[]).map(hydrateTemplateRecord);
}

export async function getUserTemplatesCount(supabase: SupabaseClientLike, userId: string): Promise<number> {
    const { count, error } = await supabase
        .from('invoice_templates')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (error) {
        if (isMissingTemplatesTableError(error)) {
            console.warn('[getUserTemplatesCount] invoice_templates table is missing, returning 0');
            return 0;
        }
        console.error('Error fetching template count:', error);
        throw error;
    }

    return count || 0;
}

export async function getUserTemplatesPage(
    supabase: SupabaseClientLike,
    userId: string,
    params: {
        page: number;
        pageSize: number;
        templateType?: TemplateCategory | null;
    }
): Promise<{ templates: InvoiceTemplate[]; totalCount: number; overallCount: number }> {
    const page = Math.max(1, Math.floor(params.page));
    const pageSize = Math.max(1, Math.min(100, Math.floor(params.pageSize)));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('invoice_templates')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (params.templateType) {
        query = query.eq('template_type', params.templateType);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
        if (isMissingTemplatesTableError(error)) {
            console.warn('[getUserTemplatesPage] invoice_templates table is missing, returning empty page');
            return { templates: [], totalCount: 0, overallCount: 0 };
        }
        console.error('Error fetching template page:', error);
        throw error;
    }

    let overallCount = count || 0;

    if (params.templateType) {
        const { count: rawOverallCount, error: overallCountError } = await supabase
            .from('invoice_templates')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (overallCountError) {
            if (isMissingTemplatesTableError(overallCountError)) {
                console.warn('[getUserTemplatesPage] invoice_templates table is missing while counting all templates');
                overallCount = 0;
            } else {
                console.error('Error fetching overall template count:', overallCountError);
                throw overallCountError;
            }
        } else {
            overallCount = rawOverallCount || 0;
        }
    }

    return {
        templates: (data as InvoiceTemplate[]).map(hydrateTemplateRecord),
        totalCount: count || 0,
        overallCount,
    };
}

/**
 * 获取单个模板详情
 */
export async function getTemplate(supabase: SupabaseClientLike, templateId: string): Promise<InvoiceTemplate | null> {
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

    return hydrateTemplateRecord(data as InvoiceTemplate);
}

/**
 * 更新模板
 */
export async function updateTemplate(
    supabase: SupabaseClientLike,
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
export async function deleteTemplate(supabase: SupabaseClientLike, templateId: string, userId?: string): Promise<void> {
    let query = supabase
        .from('invoice_templates')
        .delete()
        .eq('id', templateId);

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
        console.error('Error deleting template:', error);
        throw error;
    }
}

/**
 * 增加模板使用次数
 */
export async function incrementTemplateUsage(supabase: SupabaseClientLike, templateId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_template_usage', {
        template_id: templateId
    });

    if (error) {
        // 如果RPC函数不存在，使用fallback方法
        console.warn('RPC function not found, using fallback method');
        const template = await getTemplate(supabase, templateId);
        if (template) {
            await updateTemplate(supabase, templateId, {
                usage_count: (template.usage_count || 0) + 1
            });
        }
    }
}
