'use client';
import React from 'react';
import LanguageToggle from '@/components/LanguageToggle';
import { ViewType, Invoice, Language } from '../types';
import { translations } from '../i18n';
import { getHeaderBreadcrumbs, isEditorActionView } from '@/lib/header';

interface DashboardHeaderProps {
    user: any;
    lang: Language;
    activeView: ViewType;
    invoice?: Invoice;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    lastSavedTime?: Date;
    isExporting: boolean;
    onExportPdf: () => void;
    onSaveTemplate: () => void;
    onShare: () => void;
    onSendEmail: () => void;
    onLangChange: (lang: Language) => void;
    onBack?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    user,
    lang,
    activeView,
    invoice,
    saveStatus,
    lastSavedTime,
    isExporting,
    onExportPdf,
    onSaveTemplate,
    onShare,
    onSendEmail,
    onLangChange,
    onBack
}) => {
    const t = translations[lang];
    const copyByLang = {
        en: {
            share: 'Share',
            language: 'Language switcher',
        },
        'zh-CN': {
            share: '分享',
            language: '语言切换',
        },
        'zh-TW': {
            share: '分享',
            language: '語言切換',
        },
        th: {
            share: 'แชร์',
            language: 'ตัวสลับภาษา',
        },
        id: {
            share: 'Bagikan',
            language: 'Pengalih bahasa',
        },
    } satisfies Record<Language, { share: string; language: string }>;
    const copy = copyByLang[lang];

    const breadcrumbs = getHeaderBreadcrumbs({
        activeView,
        invoice,
        lang,
        saveStatus,
        lastSavedTime,
        onBack
    });

    return (
        <div className="sticky top-0 z-40 flex-shrink-0 bg-white border-b border-slate-100 px-6 h-[4.5rem] flex items-center justify-between shadow-[0_0.25rem_1.25rem_-0.625rem_rgba(0,0,0,0.05)]" data-ui-header>
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-3">
                {breadcrumbs}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {isEditorActionView(activeView) && (
                    <>
                        <button
                            onClick={onSendEmail}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg hover:border-blue-200 hover:text-blue-700 transition-all flex items-center gap-2"
                        >
                            <i className="fas fa-envelope"></i>
                            <span>{t.sendEmail || 'Send'}</span>
                        </button>
                        <button
                            onClick={onShare}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg hover:border-blue-200 hover:text-blue-700 transition-all flex items-center gap-2"
                        >
                            <i className="fas fa-share-alt"></i>
                            <span>{copy.share}</span>
                        </button>

                        <button
                            onClick={onSaveTemplate}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg hover:border-blue-200 hover:text-blue-700 transition-all flex items-center gap-2"
                        >
                            <i className="fas fa-bookmark"></i>
                            <span>{t.saveAsTemplate || 'Save Template'}</span>
                        </button>

                        <button
                            onClick={onExportPdf}
                            disabled={isExporting}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-[0_0.875rem_1.625rem_-1.125rem_rgba(37,99,235,0.58)] disabled:opacity-70"
                        >
                            {isExporting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-file-pdf"></i>}
                            <span>{isExporting ? t.generating : t.exportPdf}</span>
                        </button>



                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    </>
                )}

                {/* Language Selector */}
                <LanguageToggle lang={lang} onChange={onLangChange} ariaLabel={copy.language} />
            </div>
        </div>
    );
};

export default DashboardHeader;
