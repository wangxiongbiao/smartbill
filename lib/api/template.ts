import { apiRequest } from './client';
import type { Invoice, InvoiceTemplate, TemplateCategory } from '@/types';

export async function listTemplates() {
  return apiRequest<{ templates: InvoiceTemplate[] }>(`/api/templates`);
}

export async function getTemplatesCount() {
  return apiRequest<{ totalCount: number }>(`/api/templates?countOnly=1`);
}

export async function listTemplatesPage(params: {
  page: number;
  pageSize: number;
  templateType?: TemplateCategory;
}) {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  });

  if (params.templateType) searchParams.set('templateType', params.templateType);

  return apiRequest<{ templates: InvoiceTemplate[]; totalCount: number; overallCount: number; page: number; pageSize: number }>(`/api/templates?${searchParams.toString()}`);
}

export async function getTemplateById(id: string) {
  return apiRequest<{ template: InvoiceTemplate | null }>(`/api/templates/${encodeURIComponent(id)}`);
}

export async function createTemplate(
  name: string,
  description: string,
  templateType: TemplateCategory,
  templateData: Partial<Invoice>
) {
  return apiRequest<{ template: InvoiceTemplate }>(`/api/templates`, {
    method: 'POST',
    body: JSON.stringify({ name, description, templateType, templateData })
  });
}

export async function removeTemplate(id: string) {
  return apiRequest<{ success: true }>(`/api/templates/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function bumpTemplateUsage(id: string) {
  return apiRequest<{ success: true }>(`/api/templates/${encodeURIComponent(id)}/usage`, {
    method: 'POST'
  });
}
