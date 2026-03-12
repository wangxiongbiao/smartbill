"use client";

import React from 'react';
import { translations } from '@/i18n';
import InvoiceForm from '@/components/InvoiceForm';
import InvoicePreview from '@/components/InvoicePreview';
import ScalableInvoiceContainer from '@/components/ScalableInvoiceContainer';
import AIChat from '@/components/AIChat';
import ShareDialog from '@/components/ShareDialog';
import EmailDialog from '@/components/EmailDialog';
import SaveTemplateDialog from '@/components/SaveTemplateDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { Invoice, Language, TemplateType, User } from '@/types';

interface InvoiceEditorWorkspaceProps {
  invoice: Invoice;
  records: Invoice[];
  template: TemplateType;
  isHeaderReversed: boolean;
  lang: Language;
  onBack: () => void;
  userId?: User['id'];
  isExporting: boolean;
  isAIChatOpen: boolean;
  isShareDialogOpen: boolean;
  isEmailDialogOpen: boolean;
  isSaveTemplateDialogOpen: boolean;
  isNewInvoiceConfirmOpen: boolean;
  isCreatingNewInvoice: boolean;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onUpdateInvoice: (updates: Partial<Invoice>) => void;
  onToggleAIChat: () => void;
  onCloseAIChat: () => void;
  onCloseShareDialog: () => void;
  onCloseEmailDialog: () => void;
  onCloseSaveTemplateDialog: () => void;
  onCloseNewInvoiceConfirm: () => void;
  onSaveTemplate: (name: string, description: string) => Promise<void>;
  onConfirmCreateInvoice: () => Promise<void>;
  onExportPdf: () => void;
}

export default function InvoiceEditorWorkspace(props: InvoiceEditorWorkspaceProps) {
  return (
    <div className="container mx-auto flex flex-col gap-6 relative p-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={props.onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          <i className="fas fa-arrow-left text-xs"></i>
          <span>{translations[props.lang].backToRecords || 'Back to invoices'}</span>
        </button>
      </div>
      <div className="lg:flex gap-4">
        <div className="lg:w-1/2 flex flex-col gap-6">
          <InvoiceForm invoice={props.invoice} records={props.records} onChange={props.onUpdateInvoice} lang={props.lang} userId={props.userId} showToast={props.showToast} />
          <div className="sm:hidden mt-10 mb-16 px-2">
            <button onClick={props.onExportPdf} disabled={props.isExporting} className="w-full py-5 bg-blue-600 text-white font-semibold rounded-2xl shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 transition-all active:scale-95 active:shadow-inner">
              <span className="text-lg">{props.isExporting ? translations[props.lang].generating : translations[props.lang].exportPdf}</span>
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 lg:sticky lg:top-24 self-start">
          <div className="min-h-[450px] sm:min-h-[500px] flex justify-center items-start overflow-x-hidden overflow-y-auto">
            <ScalableInvoiceContainer>
              <InvoicePreview invoice={props.invoice} template={props.template} isHeaderReversed={props.isHeaderReversed} lang={props.lang} editable onChange={props.onUpdateInvoice} />
            </ScalableInvoiceContainer>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
        <div className={`pointer-events-auto transition-all duration-300 origin-bottom-right ${props.isAIChatOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none hidden'}`}>
          <div className="w-[90vw] sm:w-[380px] h-[500px] max-h-[70vh] shadow-2xl shadow-blue-900/20 rounded-2xl overflow-hidden">
            <AIChat currentInvoice={props.invoice} onUpdateInvoice={props.onUpdateInvoice} lang={props.lang} onClose={props.onCloseAIChat} />
          </div>
        </div>
        <ShareDialog isOpen={props.isShareDialogOpen} onClose={props.onCloseShareDialog} invoice={props.invoice} lang={props.lang} />
        <EmailDialog isOpen={props.isEmailDialogOpen} onClose={props.onCloseEmailDialog} invoice={props.invoice} lang={props.lang} showToast={props.showToast} />
        <SaveTemplateDialog isOpen={props.isSaveTemplateDialogOpen} onClose={props.onCloseSaveTemplateDialog} onSave={props.onSaveTemplate} lang={props.lang} />
        <ConfirmDialog
          isOpen={props.isNewInvoiceConfirmOpen}
          onClose={props.onCloseNewInvoiceConfirm}
          onConfirm={props.onConfirmCreateInvoice}
          title={translations[props.lang].newInvoiceConfirm || '创建新发票？'}
          description={translations[props.lang].newInvoiceConfirmDesc || '当前发票将自动保存，然后创建新发票。确定继续吗？'}
          confirmText={translations[props.lang].confirm || '确认'}
          cancelText={translations[props.lang].cancel || '取消'}
          variant="info"
          isProcessing={props.isCreatingNewInvoice}
        />
        <button onClick={props.onToggleAIChat} className={`pointer-events-auto w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${props.isAIChatOpen ? 'bg-slate-800 text-white rotate-90 shadow-slate-900/30' : 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-blue-500/40 animate-pulse-slow'}`}>
          {props.isAIChatOpen ? <i className="fas fa-times text-xl"></i> : <i className="fas fa-magic text-xl"></i>}
        </button>
      </div>
    </div>
  );
}
