
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Client {
  name: string;
  email: string;
  address: string;
  phone?: string;
}

export interface Sender {
  name: string;
  email: string;
  address: string;
  logo?: string;
  signature?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'facebook';
}

export type DocumentType = 'invoice' | 'receipt';
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
