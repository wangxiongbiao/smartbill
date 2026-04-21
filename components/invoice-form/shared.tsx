import type { BillingProfile, CustomField, Invoice, InvoiceColumn, InvoiceItem, Language } from '@/types';

export type InvoiceChange = (updates: Partial<Invoice>) => void;
export type NumberInputHandler = (value: string, callback: (val: string | number) => void) => void;
export type AutoResizeHandler = (textarea: HTMLTextAreaElement | null) => void;

interface SharedBaseProps {
  invoice: Invoice;
  lang: Language;
  t: any;
  onChange: InvoiceChange;
}

export interface InvoiceDetailsSectionProps extends SharedBaseProps {
  dateInputRef: React.RefObject<HTMLInputElement | null>;
  dueDateInputRef: React.RefObject<HTMLInputElement | null>;
}

export type BasicInfoSectionProps = InvoiceDetailsSectionProps & {
  isUploadingLogo: boolean;
  onOpenLogoPicker: () => void;
  onRemoveLogo: () => void;
};

export interface SenderSectionProps extends SharedBaseProps {
  isUploadingLogo: boolean;
  onOpenLogoPicker: () => void;
  onRemoveLogo: () => void;
  profiles: BillingProfile[];
  profilesLoading: boolean;
  onApplyProfile: (profile: BillingProfile) => void;
}

export interface RecipientSectionProps extends SharedBaseProps {
  profiles: BillingProfile[];
  profilesLoading: boolean;
  onApplyProfile: (profile: BillingProfile) => void;
}

export interface ItemsSectionProps extends SharedBaseProps {
  columns: InvoiceColumn[];
  sortedColumns: InvoiceColumn[];
  sensors: any;
  focusItemId: string | null;
  showColumnConfig: boolean;
  setShowColumnConfig: (value: boolean) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  handleDragEnd: (event: any) => void;
  renderCell: (item: InvoiceItem, column: InvoiceColumn) => React.ReactNode;
}

export type InvoiceSummarySectionProps = SharedBaseProps;

export interface PaymentInfoSectionProps extends SharedBaseProps {
  autoResizeTextarea: AutoResizeHandler;
  showPaymentFieldConfig: boolean;
  setShowPaymentFieldConfig: (value: boolean) => void;
  isUploadingQRCode: boolean;
  onOpenQRCodePicker: () => void;
  onRemoveQRCode: () => void;
}

export type PaymentSectionProps = PaymentInfoSectionProps & SignatureSectionProps & DisclaimerSectionProps & {
  autoResizeTextarea: AutoResizeHandler;
  showPaymentFieldConfig: boolean;
  setShowPaymentFieldConfig: (value: boolean) => void;
  isUploadingQRCode: boolean;
  onOpenQRCodePicker: () => void;
  onRemoveQRCode: () => void;
};

export interface SignatureSectionProps extends SharedBaseProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  startDrawing: (e: React.MouseEvent | React.TouchEvent) => void;
  draw: (e: React.MouseEvent | React.TouchEvent) => void;
  stopDrawing: () => void;
  signatureInputRef: React.RefObject<HTMLInputElement | null>;
  handleSignatureUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSignature: () => void;
}

export type DisclaimerSectionProps = SharedBaseProps;

export function upsertCustomField(fields: CustomField[] | undefined, index: number, field: CustomField) {
  const next = [...(fields || [])];
  next[index] = field;
  return next;
}
