export type ColumnType =
  | "system-quantity"
  | "system-rate"
  | "system-amount"
  | "system-text"
  | "custom-text"
  | "custom-number";

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
  provider: "email" | "facebook" | "google";
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

export type DocumentType = "invoice" | "receipt";
export type Language = "zh-CN" | "zh-TW" | "en" | "th" | "id";

export type PaymentFieldType = "text" | "textarea";

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
  status?: "Pending" | "Paid" | "Draft" | "Sent";
  // Template Configuration
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

export interface SchoolPosterBrand {
  logo?: string;
  title: string;
  subtitle: string;
}

export interface SchoolPosterInfo {
  nameCn: string;
  nameEn: string;
}

export interface SchoolPosterStudent {
  name: string;
  age: string;
  city: string;
  applicationPeriod: string;
  transferPath: string;
}

export interface SchoolPosterOfferRow {
  id: string;
  item: string;
  amount: string;
  dueDate: string;
}

export type SchoolPosterLayoutId = 'offer-poster' | 'letter-poster';
export type SchoolPosterDocumentMode = 'offer-table' | 'image';

export interface SchoolPosterShellVisibility {
  brand: boolean;
  school: boolean;
  student: boolean;
  footer: boolean;
  qr: boolean;
}

export interface SchoolPosterDocument {
  mode: SchoolPosterDocumentMode;
  logo?: string;
  image?: string;
  fileName?: string;
  richText: string;
  date: string;
  reference: string;
  recipient: string;
  title: string;
  greeting: string;
  introduction: string;
  confirmation: string;
  paymentNote: string;
  totalLabel: string;
  rows: SchoolPosterOfferRow[];
}

export interface SchoolPosterShellFooter {
  tuition: string;
  pathway: string;
  highlights: string;
}

export interface SchoolPosterImageCrop {
  x: number;
  y: number;
  zoom: number;
}

export interface SchoolPosterDocumentFrame {
  variant: 'placeholder';
}

export interface SchoolPosterShell {
  brand: SchoolPosterBrand;
  school: SchoolPosterInfo;
  student: SchoolPosterStudent;
  heroImage?: string;
  heroImageOriginal?: string;
  heroImageCrop?: SchoolPosterImageCrop;
  qrCode?: string;
  footer: SchoolPosterShellFooter;
  documentFrame: SchoolPosterDocumentFrame;
  visibility: SchoolPosterShellVisibility;
}

export interface SchoolPoster {
  id: string;
  createdAt: string;
  updatedAt: string;
  layoutId: SchoolPosterLayoutId;
  shell: SchoolPosterShell;
  document: SchoolPosterDocument;
}

export type TemplateType = "minimalist";
export type TemplateCategory =
  | "business"
  | "commercial"
  | "service"
  | "freelance"
  | "contractor"
  | "catering"
  | "consultation";
export type ViewType =
  | "home"
  | "editor"
  | "records"
  | "school-records"
  | "school-editor"
  | "templates"
  | "template-detail"
  | "profile"
  | "about"
  | "help"
  | "login";
export type ImageType = "logo" | "qrcode";

// Invoice Template Types
export interface InvoiceTemplate {
  id: string; // 模板唯一ID
  user_id: string; // 所属用户ID
  name: string; // 模板名称
  description?: string; // 模板描述
  template_type?: TemplateCategory | null; // 模板分类
  template_data: Partial<Invoice>; // 模板数据（基于现有Invoice类型）
  thumbnail?: string; // 预览缩略图（可选，后期优化）
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
  usage_count?: number; // 使用次数统计（可选）
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
