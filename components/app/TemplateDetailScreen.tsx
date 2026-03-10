"use client";

import React from 'react';
import { translations } from '@/i18n';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import TemplateDetailView from '@/components/TemplateDetailView';
import type { InvoiceTemplate, Language } from '@/types';

interface TemplateDetailScreenProps {
  templateId: string;
  template: InvoiceTemplate | null;
  loading?: boolean;
  lang: Language;
  onUseTemplate: (template: InvoiceTemplate) => void | Promise<void>;
  onBack: () => void;
  onDelete: (templateId: string) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function TemplateDetailScreen({ templateId, template, loading = false, lang, onUseTemplate, onBack, onDelete, showToast }: TemplateDetailScreenProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const t = translations[lang] || translations.en;

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(templateId);
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
