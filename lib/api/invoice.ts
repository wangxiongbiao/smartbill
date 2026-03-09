import { apiRequest } from './client';
import type { Invoice, Profile } from '@/types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export async function getProfile(userId: string) {
  return apiRequest<{ profile: Profile | null }>(`/api/profile?userId=${encodeURIComponent(userId)}`);
}

export async function updateProfile(fullName: string) {
  return apiRequest<{ success: true; profile: Profile | null }>(`/api/profile`, {
    method: 'PATCH',
    body: JSON.stringify({ fullName })
  });
}

export async function listInvoices(userId: string) {
  return apiRequest<{ invoices: Invoice[] }>(`/api/invoices?userId=${encodeURIComponent(userId)}`);
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

export async function batchSaveInvoiceRecords(invoices: Invoice[]) {
  return apiRequest<{ success: true }>(`/api/invoices/batch`, {
    method: 'POST',
    body: JSON.stringify({ invoices })
  });
}
