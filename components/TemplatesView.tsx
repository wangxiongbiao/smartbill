import React, { useEffect, useState } from 'react';
import { InvoiceTemplate, Language } from '../types';
import { translations } from '../i18n';
import TemplateCard from './TemplateCard';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { getUserTemplates, deleteTemplate, incrementTemplateUsage } from '@/lib/supabase-templates';

interface TemplatesViewProps {
    lang: Language;
    userId: string;
    onUseTemplate: (template: InvoiceTemplate) => void;
    onViewDetail: (template: InvoiceTemplate) => void;
    onNewDoc: () => void;
}

const TemplatesView: React.FC<TemplatesViewProps> = ({
    lang,
    userId,
    onUseTemplate,
    onViewDetail,
    onNewDoc
}) => {
    const t = translations[lang] || translations['en'];
    const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteTemplateItem, setDeleteTemplateItem] = useState<InvoiceTemplate | null>(null);

    // Load templates
    useEffect(() => {
        loadTemplates();
    }, [userId]);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const data = await getUserTemplates(userId);
            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUseTemplate = async (template: InvoiceTemplate) => {
        try {
            // Increment usage count
            await incrementTemplateUsage(template.id);
            // Reload to get updated count
            await loadTemplates();
            // Notify parent to create invoice
            onUseTemplate(template);
        } catch (error) {
            console.error('Error using template:', error);
            onUseTemplate(template);
        }
    };

    const handleDeleteTemplate = async (template: InvoiceTemplate) => {
        setDeletingId(template.id);
        try {
            await deleteTemplate(template.id);
            await loadTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
            // Error will be shown in the full-page overlay if needed
        } finally {
            setDeletingId(null);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium">{t.loadingHistory || 'Loading...'}</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (templates.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                        <i className="fas fa-file-contract"></i>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">{t.noTemplates}</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        {t.noTemplatesDesc}
                    </p>
                    <button
                        onClick={onNewDoc}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 inline-flex items-center gap-3"
                    >
                        <i className="fas fa-plus"></i>
                        <span>{t.newInvoice}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">{t.myTemplates}</h1>
                        <p className="text-slate-500 font-medium">
                            {t.totalCount?.replace('{count}', templates.length.toString()) || `Total ${templates.length} items`}
                        </p>
                    </div>
                    <button
                        onClick={onNewDoc}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i>
                        <span>{t.newInvoice}</span>
                    </button>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onUse={() => handleUseTemplate(template)}
                            onDetail={() => onViewDetail(template)}
                            onDelete={() => setDeleteTemplateItem(template)}
                            lang={lang}
                        />
                    ))}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteTemplateItem && (
                <DeleteConfirmDialog
                    isOpen={true}
                    onClose={() => setDeleteTemplateItem(null)}
                    onConfirm={() => {
                        handleDeleteTemplate(deleteTemplateItem);
                        setDeleteTemplateItem(null);
                    }}
                    title={t.deleteDialogTitle?.replace('Invoice', 'Template') || 'Delete Template?'}
                    description={t.deleteDialogDescription?.replace('invoice', 'template') || 'Are you sure you want to delete template {item}? This action cannot be undone.'}
                    confirmText={t.deleteDialogConfirm || 'Delete'}
                    cancelText={t.deleteDialogCancel || 'Cancel'}
                    isDeleting={deletingId === deleteTemplateItem.id}
                    itemName={deleteTemplateItem.name}
                />
            )}

            {/* Full-page Deletion Loading Overlay */}
            {deletingId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-6 animate-in zoom-in slide-in-from-bottom-8 duration-500">
                        <div className="relative">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 text-3xl">
                                <i className="fas fa-trash-alt animate-bounce"></i>
                            </div>
                            <div className="absolute inset-0 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin"></div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t.deleting}</h3>
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Processing...</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default TemplatesView;
