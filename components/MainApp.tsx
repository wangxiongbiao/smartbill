"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { translations } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useInvoiceWorkspace } from '@/hooks/useInvoiceWorkspace';
import DashboardShell from '@/components/app/DashboardShell';
import AuthView from '@/components/AuthView';
import AboutView from '@/components/AboutView';
import HelpView from '@/components/HelpView';
import HomeView from '@/components/HomeView';
import RecordsView from '@/components/RecordsView';
import ProfileView from '@/components/ProfileView';
import TemplatesView from '@/components/TemplatesView';
import TemplateDetailView from '@/components/TemplateDetailView';
import InvoiceForm from '@/components/InvoiceForm';
import InvoicePreview from '@/components/InvoicePreview';
import ScalableInvoiceContainer from '@/components/ScalableInvoiceContainer';
import AIChat from '@/components/AIChat';
import ShareDialog from '@/components/ShareDialog';
import EmailDialog from '@/components/EmailDialog';
import SaveTemplateDialog from '@/components/SaveTemplateDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { getTemplateById, removeTemplate } from '@/lib/api/template';
import type { InvoiceTemplate, Language, ViewType } from '@/types';

declare var html2pdf: any;

function TemplateDetailViewWrapper({
  templateId,
  lang,
  onUseTemplate,
  onBack,
  showToast
}: {
  templateId: string;
  lang: Language;
  onUseTemplate: (template: InvoiceTemplate) => void;
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}) {
  const [template, setTemplate] = React.useState<InvoiceTemplate | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const t = translations[lang] || translations.en;

  React.useEffect(() => {
    const loadTemplate = async () => {
      try {
        const data = await getTemplateById(templateId);
        setTemplate(data.template);
      } catch (error) {
        console.error('Error loading template:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTemplate();
  }, [templateId]);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await removeTemplate(templateId);
      onBack();
    } catch (error) {
      console.error('Error deleting template:', error);
      showToast('Failed to delete template', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!template) return <div className="min-h-[60vh] flex items-center justify-center"><button onClick={onBack} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">Back to Templates</button></div>;

  return (
    <>
      <TemplateDetailView template={template} lang={lang} onUseTemplate={() => onUseTemplate(template)} onEdit={() => undefined} onDelete={() => setDeleteConfirmOpen(true)} onBack={onBack} />
      <DeleteConfirmDialog isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} onConfirm={handleDeleteConfirm} title={t.deleteDialogTitle?.replace('Invoice', 'Template') || 'Delete Template?'} description={t.deleteDialogDescription?.replace('invoice', 'template') || 'Are you sure you want to delete template {item}? This action cannot be undone.'} confirmText={t.deleteDialogConfirm || 'Delete'} cancelText={t.deleteDialogCancel || 'Cancel'} isDeleting={isDeleting} itemName={template.name} />
    </>
  );
}

export default function MainApp() {
  const [lang, setLang] = useState<Language>('en');
  const [prevView, setPrevView] = useState<ViewType>('records');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [isNewInvoiceConfirmOpen, setIsNewInvoiceConfirmOpen] = useState(false);
  const [isCreatingNewInvoice, setIsCreatingNewInvoice] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const { toast, showToast, hideToast } = useToast();
  const auth = useAuthSession();
  const workspace = useInvoiceWorkspace({
    user: auth.user,
    records: auth.records,
    setRecords: auth.setRecords,
    activeView: auth.activeView,
    setActiveView: auth.setActiveView,
    lang,
    showToast
  });

  const setView = (view: ViewType) => {
    setPrevView(auth.activeView);
    auth.setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportPdf = async () => {
    if (!printAreaRef.current || workspace.isExporting) return;
    workspace.actions.setIsExporting(true);
    const filename = `${workspace.invoice.client.name ? workspace.invoice.client.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s_-]/g, '') : 'Client'}_${workspace.invoice.invoiceNumber}.pdf`;
    try {
      await html2pdf().set({ margin: 0, filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(printAreaRef.current).save();
    } catch (error) {
      console.error('PDF Generation failed', error);
      window.print();
    } finally {
      workspace.actions.setIsExporting(false);
    }
  };

  if (!auth.isInitialized) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-100 animate-bounce"><i className="fas fa-file-invoice"></i></div></div>;
  }

  if (auth.isLoggingOut) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center"><h3 className="text-lg font-bold text-slate-900 mb-1">Signing out...</h3><p className="text-slate-400 text-xs uppercase tracking-widest font-bold">See you soon</p></div></div>;
  }

  if (auth.activeView === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md p-4">
          <div className="mb-8 text-center flex flex-col items-center"><div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-4"><i className="fas fa-file-invoice text-xl"></i></div><h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1><p className="text-slate-500 font-medium mt-2">Sign in to access your dashboard</p></div>
          <AuthView lang={lang} targetView="records" showToast={showToast} />
          <div className="mt-8 text-center"><Link href="/" className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors inline-flex items-center"><i className="fas fa-arrow-left mr-2"></i>Back to Home</Link></div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (auth.activeView) {
      case 'home':
        return <HomeView onSelectTemplate={workspace.actions.createInvoice} onCreateEmpty={() => workspace.actions.createInvoice()} lang={lang} />;
      case 'records':
        if (!auth.user) return <AuthView lang={lang} targetView="records" showToast={showToast} />;
        return <RecordsView records={auth.records} lang={lang} isDeletingId={workspace.isDeletingId} onEdit={(record) => { workspace.actions.setInvoice(record); if (record.template) workspace.actions.setTemplate(record.template); workspace.actions.setIsHeaderReversed(record.isHeaderReversed ?? true); setView('editor'); }} onDuplicate={workspace.actions.duplicateInvoice} onDelete={workspace.actions.removeInvoice} onExport={(record) => { workspace.actions.setInvoice(record); setTimeout(handleExportPdf, 200); }} onNewDoc={() => workspace.actions.createInvoice()} />;
      case 'profile':
        if (!auth.user) return <AuthView lang={lang} targetView="profile" showToast={showToast} />;
        return <ProfileView recordsCount={auth.records.length} user={auth.user} onLogout={auth.logout} onUpdateUser={auth.setUser} lang={lang} showToast={showToast} />;
      case 'templates':
        if (!auth.user) return <AuthView lang={lang} targetView="templates" showToast={showToast} />;
        return <TemplatesView lang={lang} userId={auth.user.id} onUseTemplate={workspace.actions.useTemplate} onViewDetail={(template) => { setActiveTemplateId(template.id); setView('template-detail'); }} onNewDoc={() => workspace.actions.createInvoice()} />;
      case 'template-detail':
        if (!activeTemplateId) return null;
        return <TemplateDetailViewWrapper templateId={activeTemplateId} lang={lang} onUseTemplate={workspace.actions.useTemplate} onBack={() => { setView('templates'); setActiveTemplateId(null); }} showToast={showToast} />;
      case 'about':
        return <AboutView lang={lang} onBack={() => setView(prevView)} onCreateInvoice={() => workspace.actions.createInvoice()} />;
      case 'help':
        return <HelpView lang={lang} onBack={() => setView(prevView)} />;
      case 'editor':
      default:
        return (
          <div className="container mx-auto flex flex-col gap-6 relative p-6">
            <div className="lg:flex gap-4" style={{ zoom: 0.9 } as React.CSSProperties}>
              <div className="lg:w-1/2 flex flex-col gap-6">
                <InvoiceForm invoice={workspace.invoice} onChange={workspace.actions.updateInvoice} lang={lang} userId={auth.user?.id} />
                <div className="sm:hidden mt-10 mb-16 px-2"><button onClick={handleExportPdf} disabled={workspace.isExporting} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 transition-all active:scale-95 active:shadow-inner"><span className="text-lg">{workspace.isExporting ? translations[lang].generating : translations[lang].exportPdf}</span></button></div>
              </div>
              <div className="lg:w-1/2 lg:sticky lg:top-24 self-start"><div className="bg-slate-50 rounded-xl min-h-[450px] sm:min-h-[500px] flex justify-center items-start overflow-x-hidden overflow-y-auto shadow-sm border border-slate-200"><ScalableInvoiceContainer><InvoicePreview invoice={workspace.invoice} template={workspace.template} isHeaderReversed={workspace.isHeaderReversed} lang={lang} /></ScalableInvoiceContainer></div></div>
            </div>

            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
              <div className={`pointer-events-auto transition-all duration-300 origin-bottom-right ${isAIChatOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none hidden'}`}><div className="w-[90vw] sm:w-[380px] h-[500px] max-h-[70vh] shadow-2xl shadow-blue-900/20 rounded-2xl overflow-hidden"><AIChat currentInvoice={workspace.invoice} onUpdateInvoice={workspace.actions.updateInvoice} lang={lang} onClose={() => setIsAIChatOpen(false)} /></div></div>
              <ShareDialog isOpen={isShareDialogOpen} onClose={() => setIsShareDialogOpen(false)} invoice={workspace.invoice} lang={lang} />
              <EmailDialog isOpen={isEmailDialogOpen} onClose={() => setIsEmailDialogOpen(false)} invoice={workspace.invoice} lang={lang} showToast={showToast} />
              <SaveTemplateDialog isOpen={isSaveTemplateDialogOpen} onClose={() => setIsSaveTemplateDialogOpen(false)} onSave={workspace.actions.saveAsTemplate} lang={lang} />
              <ConfirmDialog isOpen={isNewInvoiceConfirmOpen} onClose={() => setIsNewInvoiceConfirmOpen(false)} onConfirm={async () => { setIsCreatingNewInvoice(true); try { if (auth.user?.id && workspace.invoice.id) await workspace.actions.saveCurrentInvoice(); await workspace.actions.createInvoice(); setIsNewInvoiceConfirmOpen(false); showToast(translations[lang].newInvoiceCreated || '新发票创建成功！', 'success'); } catch (error) { console.error(error); showToast(translations[lang].createInvoiceFailed || '创建发票失败，请重试', 'error'); } finally { setIsCreatingNewInvoice(false); } }} title={translations[lang].newInvoiceConfirm || '创建新发票？'} description={translations[lang].newInvoiceConfirmDesc || '当前发票将自动保存，然后创建新发票。确定继续吗？'} confirmText={translations[lang].confirm || '确认'} cancelText={translations[lang].cancel || '取消'} variant="info" isProcessing={isCreatingNewInvoice} />
              <button onClick={() => setIsAIChatOpen(!isAIChatOpen)} className={`pointer-events-auto w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isAIChatOpen ? 'bg-slate-800 text-white rotate-90 shadow-slate-900/30' : 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-blue-500/40 animate-pulse-slow'}`}>{isAIChatOpen ? <i className="fas fa-times text-xl"></i> : <i className="fas fa-magic text-xl"></i>}</button>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardShell user={auth.user} lang={lang} activeView={auth.activeView} invoice={workspace.invoice} saveStatus={workspace.saveStatus} lastSavedTime={workspace.lastSavedTime} isExporting={workspace.isExporting} onSetView={setView} onSetLang={setLang} onLogout={auth.logout} onNewInvoice={() => workspace.actions.createInvoice()} onExportPdf={handleExportPdf} onSaveTemplate={() => setIsSaveTemplateDialogOpen(true)} onShare={() => setIsShareDialogOpen(true)} onSendEmail={() => setIsEmailDialogOpen(true)} toast={toast} onCloseToast={hideToast} printArea={<div className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1]"><div ref={printAreaRef} style={{ width: '210mm' }}><InvoicePreview invoice={workspace.invoice} template={workspace.template} isHeaderReversed={workspace.isHeaderReversed} isForPdf={true} lang={lang} /></div></div>}>
      {renderContent()}
    </DashboardShell>
  );
}
