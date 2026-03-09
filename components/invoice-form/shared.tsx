import type { Invoice, InvoiceColumn, InvoiceItem, Language, PaymentInfoField, CustomField } from '@/types';

export type InvoiceChange = (updates: Partial<Invoice>) => void;
export type NumberInputHandler = (value: string, callback: (val: string | number) => void) => void;
export type AutoResizeHandler = (textarea: HTMLTextAreaElement | null) => void;
export type UpdateItemHandler = (id: string, updates: Partial<InvoiceItem>) => void;
export type UpdateItemAmountHandler = (id: string, newAmount: number | string) => void;
export type UpdateCustomValueHandler = (itemId: string, columnId: string, value: string) => void;

export interface BasicInfoSectionProps {
  invoice: Invoice;
  lang: Language;
  t: any;
  onChange: InvoiceChange;
  dateInputRef: React.RefObject<HTMLInputElement | null>;
  dueDateInputRef: React.RefObject<HTMLInputElement | null>;
  isUploadingLogo: boolean;
  onOpenLogoPicker: () => void;
  onRemoveLogo: () => void;
}

export interface ItemsSectionProps {
  invoice: Invoice;
  t: any;
  lang: Language;
  columns: InvoiceColumn[];
  sortedColumns: InvoiceColumn[];
  sensors: any;
  focusItemId: string | null;
  showColumnConfig: boolean;
  setShowColumnConfig: (value: boolean) => void;
  onChange: InvoiceChange;
  addItem: () => void;
  removeItem: (id: string) => void;
  handleDragEnd: (event: any) => void;
  renderCell: (item: InvoiceItem, column: InvoiceColumn) => React.ReactNode;
}

export interface PaymentSectionProps {
  invoice: Invoice;
  lang: Language;
  t: any;
  onChange: InvoiceChange;
  autoResizeTextarea: AutoResizeHandler;
  showPaymentFieldConfig: boolean;
  setShowPaymentFieldConfig: (value: boolean) => void;
  isUploadingQRCode: boolean;
  onOpenQRCodePicker: () => void;
  onRemoveQRCode: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  startDrawing: (e: React.MouseEvent | React.TouchEvent) => void;
  draw: (e: React.MouseEvent | React.TouchEvent) => void;
  stopDrawing: () => void;
  signatureInputRef: React.RefObject<HTMLInputElement | null>;
  handleSignatureUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSignature: () => void;
}

export function upsertCustomField(fields: CustomField[] | undefined, index: number, field: CustomField) {
  const next = [...(fields || [])];
  next[index] = field;
  return next;
}
