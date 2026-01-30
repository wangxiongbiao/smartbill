import React from 'react';
import { InvoiceTemplate, Language } from '../types';
import { translations } from '../i18n';
import InvoicePreview from './InvoicePreview';
import ScalableInvoiceContainer from './ScalableInvoiceContainer';

interface TemplateDetailViewProps {
    template: InvoiceTemplate;
    lang: Language;
    onUseTemplate: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onBack: () => void;
}

const TemplateDetailView: React.FC<TemplateDetailViewProps> = ({
    template,
    lang,
    onUseTemplate,
    onEdit,
    onDelete,
    onBack
}) => {
    const t = translations[lang] || translations['en'];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === 'zh-TW' ? 'zh-TW' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Create a preview invoice from template data
    const previewInvoice = {
        ...template.template_data,
        id: template.id,
        invoiceNumber: 'PREVIEW-001',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        client: template.template_data.client || {
            name: 'Sample Client',
            email: 'client@example.com',
            address: '123 Client Street'
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors group"
            >
                <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                <span>{t.backToTemplates}</span>
            </button>

            <div className="lg:flex gap-8">
                {/* Left Panel - Template Info */}
                <div className="lg:w-2/5 mb-8 lg:mb-0">
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 sticky top-8">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-black text-slate-900 mb-3">{template.name}</h1>
                            <p className="text-slate-600 leading-relaxed">
                                {template.description || t.noTemplatesDesc}
                            </p>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-4 mb-8 pb-8 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                    {t.createdAt}
                                </span>
                                <span className="text-sm font-medium text-slate-700">
                                    {formatDate(template.created_at)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                    {t.updatedAt}
                                </span>
                                <span className="text-sm font-medium text-slate-700">
                                    {formatDate(template.updated_at)}
                                </span>
                            </div>

                            {template.usage_count !== undefined && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                        {t.usageCount}
                                    </span>
                                    <div className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg flex items-center gap-2">
                                        <i className="fas fa-sync-alt text-xs"></i>
                                        <span>{t.usageTimes?.replace('{count}', template.usage_count.toString()) || `${template.usage_count} times`}</span>
                                    </div>
                                </div>
                            )}

                            {template.template_data.type && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                        Type
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 capitalize">
                                        {template.template_data.type}
                                    </span>
                                </div>
                            )}

                            {template.template_data.currency && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                        Currency
                                    </span>
                                    <span className="text-sm font-medium text-slate-700">
                                        {template.template_data.currency}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={onUseTemplate}
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <i className="fas fa-plus"></i>
                                <span>{t.useTemplate}</span>
                            </button>

                            <button
                                onClick={onEdit}
                                className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <i className="fas fa-edit"></i>
                                <span>{t.editTemplate}</span>
                            </button>

                            <button
                                onClick={onDelete}
                                className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <i className="fas fa-trash"></i>
                                <span>{t.deleteTemplate}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Preview */}
                <div className="lg:w-3/5">
                    <div className=" bg-slate-50 rounded-xl min-h-[450px] sm:min-h-[500px] flex justify-center items-start overflow-x-hidden overflow-y-auto shadow-sm border border-slate-200">
                        <ScalableInvoiceContainer>
                            <InvoicePreview
                                invoice={previewInvoice as any}
                                template={template.template_data.template || 'minimalist'}
                                isHeaderReversed={template.template_data.isHeaderReversed ?? true}
                                lang={lang}
                            />
                        </ScalableInvoiceContainer>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TemplateDetailView;
