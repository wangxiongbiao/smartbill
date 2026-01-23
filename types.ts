
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number | string; // Allow string for easier form handling (empty inputs)
  rate: number | string;
  [key: string]: any;
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

export interface Invoice {
  id: string;
  type: DocumentType;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  sender: Sender;
  client: Client;
  items: InvoiceItem[];
  taxRate: number;
  currency: string;
  notes: string;
  status?: 'Draft' | 'Sent' | 'Paid';
  // Template Configuration
  template?: TemplateType;
  isHeaderReversed?: boolean;
  isHeaderReversed?: boolean;
  visibility?: Record<string, boolean>;
  columns?: InvoiceColumn[];
}

export interface InvoiceColumn {
  id: string;
  label: string;
  dataIndex: string;
  type: 'text' | 'number' | 'amount';
  isCustom?: boolean;
}

// Allow dynamic properties effectively by indexing, although strict interface is cleaner.
// We keep core props strictly typed and allow extras if needed, or just rely on 'any' casting in UI loops
// typically modifying InvoiceItem to have an index signature is most flexible:
// export interface InvoiceItem { [key: string]: any; id: string; ... }
// But for now, let's keep it clean and maybe just assume additional props are managed via casting or updates.
// Actually, let's add the index signature to InvoiceItem:


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
