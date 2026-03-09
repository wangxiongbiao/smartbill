import { supabase } from './supabase-browser';
import { safeDeepClean } from './utils';
import { TemplateType, Invoice } from '@/types/invoice';
import { createDefaultInvoice } from './invoice-defaults';

export interface InvoiceTemplateRecord {
  id: string;
  userId: string;
  baseTemplate: TemplateType;
  name: string;
  description: string;
  category: string;
  isDefault: boolean;
  preview: string;
  colors: string[];
  lastUsed: string;
  invoice: Invoice;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateInput {
  name: string;
  description: string;
  category: string;
  baseTemplate: TemplateType;
  invoice: Invoice;
  colors?: string[];
}

const STORAGE_PREFIX = 'invoice_template_';

const DEFAULT_TEMPLATE_META: Array<Pick<InvoiceTemplateRecord, 'id' | 'name' | 'description' | 'preview' | 'category' | 'isDefault' | 'colors' | 'baseTemplate'>> = [
  {
    id: 'minimalist',
    baseTemplate: 'minimalist',
    name: '极简版 (Minimalist)',
    description: '黑白灰极简设计，专注信息呈现，适合独立开发者与极简主义者',
    preview: '/templates/minimalist.png',
    category: '通用',
    isDefault: true,
    colors: ['#ffffff', '#0f172a', '#94a3b8']
  },
  {
    id: 'modern',
    baseTemplate: 'modern',
    name: '现代护眼版 (Modern)',
    description: '低对比较柔和的莫兰迪配色，时尚不刺眼，适合创意及设计行业',
    preview: '/templates/modern.png',
    category: '创意',
    isDefault: false,
    colors: ['#fafafa', '#a1aedf', '#4b5563']
  },
  {
    id: 'professional',
    baseTemplate: 'professional',
    name: '商务严谨版 (Professional)',
    description: '经典大气的海军蓝配色，分栏明确，适合严谨的B2B企业与金融行业',
    preview: '/templates/professional.png',
    category: '商务',
    isDefault: false,
    colors: ['#ffffff', '#1e3a8a', '#1e40af']
  }
];

function createDefaultTemplateInvoice(baseTemplate: TemplateType): Invoice {
  const invoice = createDefaultInvoice();
  invoice.template = baseTemplate;
  invoice.client = {
    name: '示例客户公司',
    email: 'client@example.com',
    address: '上海市浦东新区张江高科技园区 100 号',
    phone: '138-0000-0000'
  };
  invoice.sender = {
    name: '您的公司名称',
    email: 'contact@yourcompany.com',
    address: '北京市朝阳区望京 SOHO',
    phone: '400-888-8888',
    disclaimerText: '感谢您的惠顾，这是系统自动生成的模板预览。'
  };
  invoice.items = [
    { id: '1', description: '网站高端定制开发服务', quantity: 1, rate: 15000, amount: 15000 },
    { id: '2', description: '一年的服务器托管及技术支持', quantity: 1, rate: 5000, amount: 5000 }
  ];
  return invoice;
}

export function getDefaultTemplates(userId = 'system'): InvoiceTemplateRecord[] {
  return DEFAULT_TEMPLATE_META.map((template) => ({
    ...template,
    userId,
    lastUsed: '2026-03-06',
    invoice: createDefaultTemplateInvoice(template.baseTemplate)
  }));
}

function localStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

function readLocalTemplates(userId: string): InvoiceTemplateRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(localStorageKey(userId));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as InvoiceTemplateRecord[];
    return parsed.map((template) => ({
      ...template,
      userId,
      invoice: {
        ...template.invoice,
        template: template.baseTemplate
      }
    }));
  } catch {
    return [];
  }
}

function writeLocalTemplates(userId: string, templates: InvoiceTemplateRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(localStorageKey(userId), JSON.stringify(templates));
}

async function listFromSupabase(userId: string): Promise<InvoiceTemplateRecord[] | null> {
  const { data, error } = await supabase
    .from('invoice_templates')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') return null;
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || '',
    category: row.category || '自定义',
    baseTemplate: (row.base_template || 'minimalist') as TemplateType,
    isDefault: !!row.is_default,
    preview: row.preview || '/templates/minimalist.png',
    colors: row.colors || ['#ffffff', '#0f172a', '#94a3b8'],
    lastUsed: row.last_used || row.updated_at,
    invoice: {
      ...(row.invoice_data as Invoice),
      template: (row.base_template || 'minimalist') as TemplateType
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getUserTemplates(userId: string): Promise<InvoiceTemplateRecord[]> {
  const localTemplates = readLocalTemplates(userId);

  try {
    const cloudTemplates = await listFromSupabase(userId);
    if (cloudTemplates) {
      writeLocalTemplates(userId, cloudTemplates);
      return [...getDefaultTemplates(userId), ...cloudTemplates];
    }
  } catch {
    // Fall back to local templates silently.
  }

  return [...getDefaultTemplates(userId), ...localTemplates];
}

export async function createTemplate(userId: string, input: TemplateInput): Promise<InvoiceTemplateRecord> {
  const now = new Date().toISOString();
  const id = `tpl_${now.replace(/[-:.TZ]/g, '').slice(0, 14)}_${Math.random().toString(36).slice(2, 8)}`;
  const record: InvoiceTemplateRecord = {
    id,
    userId,
    name: input.name,
    description: input.description,
    category: input.category,
    baseTemplate: input.baseTemplate,
    isDefault: false,
    preview: `/templates/${input.baseTemplate}.png`,
    colors: input.colors || ['#ffffff', '#0f172a', '#94a3b8'],
    lastUsed: now,
    invoice: {
      ...safeDeepClean(input.invoice),
      id,
      template: input.baseTemplate,
      updatedAt: now
    },
    createdAt: now,
    updatedAt: now
  };

  await persistTemplate(record);
  const templates = readLocalTemplates(userId).filter((template) => template.id !== id);
  writeLocalTemplates(userId, [record, ...templates]);
  return record;
}

export async function updateTemplate(userId: string, templateId: string, patch: Partial<TemplateInput>): Promise<InvoiceTemplateRecord> {
  const templates = readLocalTemplates(userId);
  const existing = templates.find((template) => template.id === templateId);
  if (!existing) {
    throw new Error('模板不存在');
  }

  const updated: InvoiceTemplateRecord = {
    ...existing,
    name: patch.name ?? existing.name,
    description: patch.description ?? existing.description,
    category: patch.category ?? existing.category,
    baseTemplate: patch.baseTemplate ?? existing.baseTemplate,
    colors: patch.colors ?? existing.colors,
    preview: `/templates/${patch.baseTemplate ?? existing.baseTemplate}.png`,
    invoice: {
      ...(patch.invoice ? safeDeepClean(patch.invoice) : existing.invoice),
      template: patch.baseTemplate ?? existing.baseTemplate,
      updatedAt: new Date().toISOString()
    },
    lastUsed: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await persistTemplate(updated);
  writeLocalTemplates(userId, [updated, ...templates.filter((template) => template.id !== templateId)]);
  return updated;
}

export async function deleteTemplate(userId: string, templateId: string): Promise<void> {
  const templates = readLocalTemplates(userId).filter((template) => template.id !== templateId);
  writeLocalTemplates(userId, templates);

  try {
    const { error } = await supabase.from('invoice_templates').delete().eq('user_id', userId).eq('id', templateId);
    if (error && error.code !== '42P01' && error.code !== 'PGRST205') throw error;
  } catch {
    // Keep local state even if cloud delete is unavailable.
  }
}

export async function markTemplateUsed(userId: string, templateId: string): Promise<void> {
  const templates = readLocalTemplates(userId);
  const target = templates.find((template) => template.id === templateId);
  if (!target) return;
  await updateTemplate(userId, templateId, {
    invoice: target.invoice,
    baseTemplate: target.baseTemplate,
    name: target.name,
    description: target.description,
    category: target.category,
    colors: target.colors
  });
}

async function persistTemplate(record: InvoiceTemplateRecord): Promise<void> {
  try {
    const { error } = await supabase.from('invoice_templates').upsert({
      id: record.id,
      user_id: record.userId,
      name: record.name,
      description: record.description,
      category: record.category,
      base_template: record.baseTemplate,
      invoice_data: safeDeepClean(record.invoice),
      preview: record.preview,
      colors: record.colors,
      is_default: record.isDefault,
      last_used: record.lastUsed,
      updated_at: record.updatedAt || new Date().toISOString()
    }, { onConflict: 'id' });

    if (error && error.code !== '42P01' && error.code !== 'PGRST205') throw error;
  } catch {
    // Ignore cloud persistence failures and rely on local storage.
  }
}
