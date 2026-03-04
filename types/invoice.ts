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
    provider: 'email' | 'facebook' | 'google' | 'supabase';
    profile?: Profile;
}

export interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
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
    customTitle?: string;
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
    template?: TemplateType;
    isHeaderReversed?: boolean;
    visibility?: Record<string, boolean>;
    columnConfig?: InvoiceColumn[];
    updatedAt?: string;
    syncStatus?: 'synced' | 'pending' | 'error';
}

export type TemplateType = 'minimalist' | 'modern' | 'professional';
export type ViewType = 'home' | 'editor' | 'records' | 'templates' | 'template-detail' | 'profile' | 'about' | 'help' | 'login';
export type ImageType = 'logo' | 'qrcode';
