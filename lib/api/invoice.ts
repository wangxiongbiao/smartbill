import { apiRequest } from './client';
import type { Invoice, Profile } from '@/types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export async function getProfile() {
  return apiRequest<{ profile: Profile | null }>(`/api/profile`);
}

export async function updateProfile(fullName: string) {
  return apiRequest<{ success: true; profile: Profile | null }>(`/api/profile`, {
    method: 'PATCH',
    body: JSON.stringify({ fullName })
  });
}

export async function listInvoices() {
  return apiRequest<{ invoices: Invoice[] }>(`/api/invoices`);
}

export async function listInvoicesPage(params: {
  page: number;
  pageSize: number;
  search?: string;
  month?: number | 'all';
}) {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  });

  if (params.search?.trim()) searchParams.set('search', params.search.trim());
  if (typeof params.month === 'number') searchParams.set('month', params.month.toString());

  return apiRequest<{ invoices: Invoice[]; totalCount: number; page: number; pageSize: number }>(`/api/invoices?${searchParams.toString()}`);
}

export async function saveInvoiceRecord(invoice: Invoice) {
  return apiRequest<{ success: true }>(`/api/invoices`, {
    method: 'POST',
    body: JSON.stringify({ invoice })
  });
}

export async function deleteInvoiceRecord(invoiceId: string) {
  return apiRequest<{ success: true }>(`/api/invoices?id=${encodeURIComponent(invoiceId)}`, {
    method: 'DELETE'
  });
}
