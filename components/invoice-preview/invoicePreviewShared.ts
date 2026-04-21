import type { Language, Invoice } from '@/types';

export interface InvoicePreviewCopy {
  addPhone: string;
  addEmail: string;
  addValue: string;
  addDisclaimer: string;
  paymentQrCode: string;
  signatureAlt: string;
  logoAlt: string;
  subtotal: string;
}

export interface InvoicePreviewStyles {
  header: string;
  tableHeader: string;
  accentColor: string;
  signatureBorder: string;
}

export const invoicePreviewCopyByLang = {
  en: {
    addPhone: 'Add phone',
    addEmail: 'Add email',
    addValue: 'Add value',
    addDisclaimer: 'Add disclaimer',
    paymentQrCode: 'Payment QR Code',
    signatureAlt: 'Signature',
    logoAlt: 'Logo',
    subtotal: 'Subtotal',
  },
  'zh-CN': {
    addPhone: '添加电话',
    addEmail: '添加电子邮箱',
    addValue: '添加内容',
    addDisclaimer: '添加免责声明',
    paymentQrCode: '付款 QR Code',
    signatureAlt: '签名',
    logoAlt: 'Logo',
    subtotal: '小计',
  },
  'zh-TW': {
    addPhone: '新增電話',
    addEmail: '新增電子郵件',
    addValue: '新增內容',
    addDisclaimer: '新增免責聲明',
    paymentQrCode: '付款 QR Code',
    signatureAlt: '簽名',
    logoAlt: 'Logo',
    subtotal: '小計',
  },
  th: {
    addPhone: 'เพิ่มโทรศัพท์',
    addEmail: 'เพิ่มอีเมล',
    addValue: 'เพิ่มข้อมูล',
    addDisclaimer: 'เพิ่มข้อจำกัดความรับผิดชอบ',
    paymentQrCode: 'คิวอาร์โค้ดชำระเงิน',
    signatureAlt: 'ลายเซ็น',
    logoAlt: 'โลโก้',
    subtotal: 'ยอดรวมย่อย',
  },
  id: {
    addPhone: 'Tambah telepon',
    addEmail: 'Tambah email',
    addValue: 'Tambah isi',
    addDisclaimer: 'Tambah disclaimer',
    paymentQrCode: 'QR Code pembayaran',
    signatureAlt: 'Tanda tangan',
    logoAlt: 'Logo',
    subtotal: 'Subtotal',
  },
} satisfies Record<Language, InvoicePreviewCopy>;

export const invoicePreviewStyles: InvoicePreviewStyles = {
  header: 'border-b-4 border-slate-900 px-12 pb-10 pt-10',
  tableHeader: 'bg-slate-50 text-slate-900 border-b border-slate-200',
  accentColor: 'slate-900',
  signatureBorder: 'border-slate-900',
};

export function getInvoiceDocumentTitle(invoice: Invoice, t: any) {
  return invoice.customStrings?.invoiceTitle
    || (invoice.type === 'invoice' ? t.invoiceMode.split(' ')[0].toUpperCase() : t.receiptMode.split(' ')[0].toUpperCase());
}
