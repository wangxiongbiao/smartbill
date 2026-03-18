
export type ColumnType =
  | 'system-quantity'
  | 'system-rate'
  | 'system-amount'
  | 'system-text'
  | 'custom-text'
  | 'custom-number';

export interface InvoiceColumn {
  id: string;
  field: string;
  label: string;
  type: ColumnType;
  order: number;
  visible: boolean;
  required: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number | string;
  rate: number | string;
  amount?: number | string;
  customValues?: Record<string, string | number>;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface Client {
  name: string;
  email: string;
  address: string;
  phone?: string;
  customFields?: CustomField[];
}

export interface Sender {
  name: string;
  email: string;
  address: string;
  phone?: string;
  logo?: string;
  signature?: string;
  disclaimerText?: string;
  customFields?: CustomField[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'facebook' | 'google';
  profile?: Profile;
}

// Supabase Database Types
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type BillingProfileKind = 'sender' | 'client';

export interface BillingProfile {
  id: string;
  userId: string;
  kind: BillingProfileKind;
  name: string;
  email: string;
  phone?: string;
  address: string;
  customFields?: CustomField[];
  isDefault: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRecord {
  id: string;
  user_id: string;
  invoice_number: string;
  invoice_data: Invoice;
  created_at: string;
  updated_at: string;
}

export type DocumentType = 'invoice' | 'receipt';
export type Language = 'zh-TW' | 'en' | 'fr' | 'de' | 'ja';

export type PaymentFieldType = 'text' | 'textarea';

export interface PaymentInfoField {
  id: string;
  label: string;
  type: PaymentFieldType;
  order: number;
  visible: boolean;
  required: boolean;
  value: string;
}

export interface PaymentInfo {
  fields?: PaymentInfoField[];
  qrCode?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  extraInfo?: string;
  customFields?: CustomField[];
}

export interface Invoice {
  id: string;
  type: DocumentType;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  sender: Sender;
  client: Client;
  paymentInfo?: PaymentInfo;
  items: InvoiceItem[];
  taxRate: number;
  currency: string;
  notes: string;
  status?: 'Pending' | 'Draft' | 'Sent' | 'Paid';
  template?: TemplateType;
  isHeaderReversed?: boolean;
  visibility?: Record<string, boolean>;
  columnConfig?: InvoiceColumn[];
  customStrings?: {
    invoiceTitle?: string;
    dateLabel?: string;
    dueDateLabel?: string;
  };
}

export type TemplateType = 'professional' | 'minimalist' | 'modern';
export type TemplateCategory =
  | 'business'
  | 'commercial'
  | 'service'
  | 'freelance'
  | 'contractor'
  | 'catering'
  | 'consultation';
export type ViewType = 'home' | 'editor' | 'records' | 'profile' | 'about' | 'help';

export interface InvoiceTemplateRecord {
  id: string;
  name: string;
  description?: string;
  templateType: TemplateCategory;
  templateData: Partial<Invoice>;
  sourceInvoiceId?: string;
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IndustryTemplate {
  id: string;
  category: string;
  title: string;
  previewColor: string;
  backgroundImage: string;
  defaultData: Partial<Invoice>;
}
