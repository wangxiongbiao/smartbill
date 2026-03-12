import { apiRequest } from './client';
import type { Invoice, InvoiceTemplate, TemplateCategory } from '@/types';

export async function listTemplates(userId: string) {
  return apiRequest<{ templates: InvoiceTemplate[] }>(`/api/templates?userId=${encodeURIComponent(userId)}`);
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
