import React from 'react';
import { InvoiceTemplate, Language } from '../types';
import { translations } from '../i18n';

interface TemplateCardProps {
    template: InvoiceTemplate;
    onUse: () => void;
    onDetail: () => void;
    onDelete: () => void;
    lang: Language;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
    template,
    onUse,
    onDetail,
    onDelete,
    lang
}) => {
    const t = translations[lang] || translations['en'];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === 'zh-TW' ? 'zh-TW' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div
            className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
            onClick={onDetail}
        >
            {/* Card Header */}
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {template.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {template.description || t.noTemplatesDesc}
                        </p>
                    </div>

                    {/* Usage Badge */}
                    {template.usage_count !== undefined && template.usage_count > 0 && (
                        <div className="flex-shrink-0 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1">
                            <i className="fas fa-sync-alt text-[10px]"></i>
                            <span>{template.usage_count}</span>
                        </div>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                        <i className="fas fa-calendar text-[10px]"></i>
                        <span>{formatDate(template.created_at)}</span>
                    </div>
                    {template.template_data.type && (
                        <div className="flex items-center gap-1.5">
                            <i className="fas fa-file-invoice text-[10px]"></i>
                            <span className="capitalize">{template.template_data.type}</span>
                        </div>
                    )}
                    {template.template_data.currency && (
                        <div className="flex items-center gap-1.5">
                            <i className="fas fa-dollar-sign text-[10px]"></i>
                            <span>{template.template_data.currency}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Card Actions */}
            <div className="px-6 pb-6 pt-2 flex gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onUse();
                    }}
                    className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
                >
                    <i className="fas fa-plus text-xs"></i>
                    <span>{t.useTemplate}</span>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                >
                    <i className="fas fa-trash text-xs"></i>
                </button>
            </div>
        </div>
    );
};

export default TemplateCard;
