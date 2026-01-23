
export type ColumnType = 'system-quantity' | 'system-rate' | 'system-amount' | 'system-text' | 'custom-text' | 'custom-number';

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
  quantity: number | string; // Allow string for easier form handling (empty inputs)
  rate: number | string;
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
  logo?: string;
  signature?: string;
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

export interface InvoiceRecord {
  id: string;
  user_id: string;
  invoice_number: string;
  invoice_data: Invoice;
  created_at: string;
  updated_at: string;
}

export type DocumentType = 'invoice' | 'receipt' | 'custom';
export type Language = 'zh-TW' | 'en' | 'fr' | 'de' | 'ja';

export interface PaymentInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
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
  status?: 'Draft' | 'Sent' | 'Paid';
  // Template Configuration
  template?: TemplateType;
  isHeaderReversed?: boolean;
  visibility?: Record<string, boolean>;
  columnConfig?: InvoiceColumn[];
}

export type TemplateType = 'professional' | 'minimalist' | 'modern';
export type ViewType = 'home' | 'editor' | 'records' | 'profile' | 'about' | 'help';

export interface IndustryTemplate {
  id: string;
  category: string;
  title: string;
  previewColor: string;
  backgroundImage: string;
  defaultData: Partial<Invoice>;
}
