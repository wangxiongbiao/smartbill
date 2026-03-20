import { API_BASE_URL } from '@/shared/auth/config';
import type {
  BillingProfile,
  BillingProfileKind,
  Client,
  Invoice,
  InvoiceTemplateRecord,
  Profile,
  Sender,
  TemplateCategory,
} from '@/shared/types';

type RemoteTemplateRecord = {
  id: string | number;
  name: string;
  description?: string | null;
  template_type?: TemplateCategory | null;
  template_data?: Partial<Invoice> | null;
  source_invoice_id?: string | null;
  usage_count?: number | null;
  created_at: string;
  updated_at: string;
};

type AuthMePayload = {
  user?: {
    id?: string;
    email?: string;
  };
  profile?: {
    id?: string;
    full_name?: string | null;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
  } | null;
};

export type RemoteInvoiceShare = {
  id: string;
  invoice_id?: string;
  share_token: string;
  allow_download?: boolean;
  expires_at?: string | null;
  revoked_at?: string | null;
  created_at: string;
};

async function apiRequest<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function normalizeTemplateRecord(record: RemoteTemplateRecord): InvoiceTemplateRecord {
  return {
    id: String(record.id),
    name: record.name || 'Untitled template',
    description: record.description || '',
    templateType: record.template_type || 'business',
    templateData: record.template_data || {},
    sourceInvoiceId: record.source_invoice_id || undefined,
    usageCount: record.usage_count || 0,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export async function fetchInvoices(accessToken: string) {
  const payload = await apiRequest<{ invoices?: Invoice[] }>('/api/invoices', accessToken);
  return payload.invoices || [];
}

export async function saveInvoiceRemote(accessToken: string, invoice: Invoice) {
  await apiRequest<{ success: boolean }>('/api/invoices', accessToken, {
    method: 'POST',
    body: JSON.stringify({ invoice }),
  });
}

export async function deleteInvoiceRemote(accessToken: string, id: string) {
  await apiRequest<{ success: boolean }>(`/api/invoices?id=${encodeURIComponent(id)}`, accessToken, {
    method: 'DELETE',
  });
}

export async function fetchTemplates(accessToken: string) {
  const payload = await apiRequest<{ templates?: RemoteTemplateRecord[] }>('/api/templates', accessToken);
  return (payload.templates || []).map(normalizeTemplateRecord);
}

export async function saveTemplateRemote(
  accessToken: string,
  input: {
    name: string;
    description?: string;
    templateType: TemplateCategory;
    templateData: Partial<Invoice>;
  }
) {
  const payload = await apiRequest<{ template: RemoteTemplateRecord }>('/api/templates', accessToken, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return normalizeTemplateRecord(payload.template);
}

export async function fetchBillingProfiles(accessToken: string) {
  const payload = await apiRequest<{ profiles?: BillingProfile[] }>('/api/billing-profiles', accessToken);
  return payload.profiles || [];
}

export async function saveBillingProfileRemote(
  accessToken: string,
  kind: BillingProfileKind,
  profile: Partial<Sender | Client>,
  makeDefault = false
) {
  const payload = await apiRequest<{ profile?: BillingProfile | null }>('/api/billing-profiles', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      kind,
      profile,
      makeDefault,
    }),
  });

  return payload.profile ?? null;
}

export async function fetchProfile(accessToken: string) {
  const payload = await apiRequest<{ profile?: Profile | null }>('/api/profile', accessToken);
  return payload.profile ?? null;
}

export async function fetchAuthMe(accessToken: string) {
  return apiRequest<AuthMePayload>('/api/auth/me', accessToken);
}

export async function bumpTemplateUsageRemote(accessToken: string, id: string) {
  await apiRequest<{ success: boolean }>(
    `/api/templates/${encodeURIComponent(id)}/usage`,
    accessToken,
    {
      method: 'POST',
    }
  );
}

export async function deleteTemplateRemote(accessToken: string, id: string) {
  await apiRequest<{ success: boolean }>(
    `/api/templates/${encodeURIComponent(id)}`,
    accessToken,
    {
      method: 'DELETE',
    }
  );
}

export async function createInvoiceShareRemote(
  accessToken: string,
  invoiceId: string,
  options?: {
    allowDownload?: boolean;
    expiresInDays?: number | null;
  }
) {
  const payload = await apiRequest<{ share?: RemoteInvoiceShare | null }>(
    '/api/share/create',
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        invoiceId,
        options: {
          allowDownload: options?.allowDownload ?? true,
          expiresInDays: options?.expiresInDays ?? null,
        },
      }),
    }
  );

  return payload.share ?? null;
}

export async function sendInvoiceShareEmailRemote(
  accessToken: string,
  input: {
    email: string;
    invoiceNumber: string;
    shareUrl: string;
    senderName: string;
  }
) {
  return apiRequest<{ success?: boolean; message?: string; mock?: boolean }>(
    '/api/share/email',
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
}
