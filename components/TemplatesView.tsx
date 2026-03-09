import React, { useEffect, useMemo, useState } from 'react';
import { InvoiceTemplate, Language } from '../types';
import { translations } from '../i18n';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { bumpTemplateUsage, listTemplates, removeTemplate } from '@/lib/api/template';

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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchQuery, setSearchQuery] = useState('');

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const data = await listTemplates(userId);
            setTemplates(data.templates);
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, [userId]);

    const handleUseTemplate = async (template: InvoiceTemplate) => {
        try {
            await bumpTemplateUsage(template.id);
            await loadTemplates();
        } catch (error) {
            console.error('Error using template:', error);
        }
        onUseTemplate(template);
    };

    const handleDeleteTemplate = async (template: InvoiceTemplate) => {
        setDeletingId(template.id);
        try {
            await removeTemplate(template.id);
            await loadTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === 'zh-TW' ? 'zh-TW' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredTemplates = useMemo(() => {
        if (!searchQuery) return templates;
        const lowerQuery = searchQuery.toLowerCase();
        return templates.filter(template =>
            template.name.toLowerCase().includes(lowerQuery) ||
            (template.description && template.description.toLowerCase().includes(lowerQuery))
        );
    }, [templates, searchQuery]);

    const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
    const currentTemplates = filteredTemplates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const startRecord = (currentPage - 1) * itemsPerPage + 1;
    const endRecord = Math.min(currentPage * itemsPerPage, filteredTemplates.length);

    if (loading) {
        return <div className="min-h-[60vh] flex items-center justify-center"><div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div><p className="text-slate-400 font-medium">{t.loadingHistory || 'Loading...'}</p></div></div>;
    }

    if (templates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center">
                <div className="bg-slate-100 w-28 h-28 rounded-[2rem] flex items-center justify-center text-slate-300 text-5xl mb-8 shadow-inner -rotate-3"><i className="fas fa-file-contract"></i></div>
                <h2 className="text-3xl font-black text-slate-900 mb-3">{t.noTemplates}</h2>
                <p className="text-slate-500 mt-3 text-lg font-medium max-w-md mx-auto">{t.noTemplatesDesc}</p>
                <button onClick={onNewDoc} className="mt-10 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3"><i className="fas fa-plus"></i><span>{t.newInvoice}</span></button>
            </div>
        );
    }

    return (
        <>
            <div className="px-6 py-6">
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button onClick={onNewDoc} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"><i className="fas fa-plus-circle"></i><span>{t.newInvoice || 'Create New'}</span></button>
                        <div className="flex w-full sm:w-auto items-center gap-3">
                            <div className="relative flex-1 sm:w-80">
                                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                <input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400" />
                            </div>
                            <button className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"><i className="fas fa-filter text-xs"></i><span>{t.filter}</span></button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {currentTemplates.map((template) => (
                        <div key={template.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col xl:flex-row items-center gap-6 xl:gap-0 hover:shadow-lg transition-all group cursor-pointer" onClick={() => onViewDetail(template)}>
                            <div className="flex items-center gap-5 w-full xl:w-[25%]"><div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><i className="fas fa-file-contract"></i></div><div className="flex flex-col"><span className="font-black text-slate-900 text-lg tracking-tight leading-snug mb-1">{template.name}</span><span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">{t.templateBadge}</span></div></div>
                            <div className="flex flex-col w-full xl:w-[30%] pl-0 xl:pl-4 border-l-0 xl:border-l border-slate-50"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.colDescription}</span><p className="text-sm font-medium text-slate-600 truncate pr-4">{template.description || t.noTemplatesDesc}</p></div>
                            <div className="flex flex-col w-full xl:w-[15%]"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.colUsage}</span><div className="flex items-center gap-2"><div className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1"><i className="fas fa-sync-alt text-[10px]"></i><span>{template.usage_count || 0}</span></div></div></div>
                            <div className="flex flex-col w-full xl:w-[15%]"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.colCreated}</span><div className="flex items-center gap-2"><i className="fas fa-calendar text-slate-300 text-xs"></i><span className="font-bold text-slate-700 text-sm">{formatDate(template.created_at)}</span></div></div>
                            <div className="flex items-center gap-2 w-full xl:w-[15%] justify-end" onClick={(e) => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); handleUseTemplate(template); }} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors" title={t.useTemplate}><i className="fas fa-plus text-xs"></i></button>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteTemplateItem(template); }} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors" title={t.deleteTemplate}><i className="fas fa-trash text-xs"></i></button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTemplates.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col gap-1"><span className="text-[16px]  text-slate-500">{t.showingRecords.replace('{start}', startRecord.toString()).replace('{end}', endRecord.toString()).replace('{count}', filteredTemplates.length.toString())}</span></div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-xl border border-slate-200 disabled:opacity-50">Prev</button>
                            <span className="text-sm font-bold text-slate-500">{currentPage} / {Math.max(totalPages, 1)}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-4 py-2 rounded-xl border border-slate-200 disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            <DeleteConfirmDialog
                isOpen={!!deleteTemplateItem}
                onClose={() => setDeleteTemplateItem(null)}
                onConfirm={() => deleteTemplateItem && handleDeleteTemplate(deleteTemplateItem)}
                title={t.deleteDialogTitle?.replace('Invoice', 'Template') || 'Delete Template?'}
                description={t.deleteDialogDescription?.replace('invoice', 'template') || 'Are you sure you want to delete template {item}? This action cannot be undone.'}
                confirmText={t.deleteDialogConfirm || 'Delete'}
                cancelText={t.deleteDialogCancel || 'Cancel'}
                itemName={deleteTemplateItem?.name || ''}
                isDeleting={!!deletingId}
            />
        </>
    );
};

export default TemplatesView;
