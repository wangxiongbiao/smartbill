
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
  amount?: number | string; // Allow direct amount input for bidirectional calculation
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
  phone?: string;
  address: string;
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

export interface InvoiceRecord {
  id: string;
  user_id: string;
  invoice_number: string;
  invoice_data: Invoice;
  created_at: string;
  updated_at: string;
}


export type DocumentType = 'invoice' | 'receipt';
export type Language = 'zh-TW' | 'en';


export type PaymentFieldType = 'text' | 'textarea';

export interface PaymentInfoField {
  id: string;
  label: string;
  type: PaymentFieldType;
  order: number;
  visible: boolean;
  required: boolean; // System fields cannot be deleted
  value: string;
}

export interface PaymentInfo {
  fields?: PaymentInfoField[]; // Optional for backward compatibility
  qrCode?: string; // Payment QR code image
  // Legacy fields for backward compatibility
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
  status?: 'Draft' | 'Sent' | 'Paid';
  // Template Configuration
  template?: TemplateType;
  isHeaderReversed?: boolean;
  visibility?: Record<string, boolean>;
  columnConfig?: InvoiceColumn[];
}

export type TemplateType = 'professional' | 'minimalist' | 'modern';
export type ViewType = 'home' | 'editor' | 'records' | 'templates' | 'template-detail' | 'profile' | 'about' | 'help';
export type ImageType = 'logo' | 'qrcode';

// Invoice Template Types
export interface InvoiceTemplate {
  id: string;                    // 模板唯一ID
  user_id: string;               // 所属用户ID
  name: string;                  // 模板名称
  description?: string;          // 模板描述
  template_data: Partial<Invoice>; // 模板数据（基于现有Invoice类型）
  thumbnail?: string;            // 预览缩略图（可选，后期优化）
  created_at: string;            // 创建时间
  updated_at: string;            // 更新时间
  usage_count?: number;          // 使用次数统计（可选）
}

export interface IndustryTemplate {
  id: string;
  category: string;
  title: string;
  previewColor: string;
  backgroundImage: string;
  defaultData: Partial<Invoice>;
}

export interface ImageUpload {
  id: string;
  user_id: string;
  image_type: ImageType;
  image_data: string; // base64
  file_name?: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
}
