'use client';
import React from 'react';
import { ViewType, Invoice, Language } from '../types';
import { translations } from '../i18n';
import SaveStatusIndicator from './SaveStatusIndicator';

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
    onLangChange,
    onBack
}) => {
    const t = translations[lang];

    // Language display map
    const langMap: Record<Language, { label: string; flag: string }> = {
        'en': { label: 'EN', flag: '🇺🇸' },
        'zh-TW': { label: '繁', flag: '🇨🇳' },
    };

    const getBreadcrumbs = () => {
        const crumbs = [
            <span key="home" className="text-slate-400 font-bold uppercase tracking-widest text-xs">SMARTBILL PRO</span>
        ];

        if (activeView === 'records') {
            crumbs.push(
                <i key="sep1" className="fas fa-chevron-right text-[10px] text-slate-300"></i>,
                <span key="records" className="text-slate-400 font-bold uppercase tracking-widest text-xs">RECORDS</span>
            );
        } else if (activeView === 'editor' && invoice) {
            crumbs.push(
                <i key="sep1" className="fas fa-chevron-right text-[10px] text-slate-300"></i>,
                <span key="records" className="text-slate-400 font-bold uppercase tracking-widest text-xs cursor-pointer hover:text-blue-600 transition-colors" onClick={onBack}>RECORDS</span>,
                <i key="sep2" className="fas fa-chevron-right text-[10px] text-slate-300"></i>,
                <div key="current" className="flex items-center gap-3">
                    <span className="text-slate-900 font-black text-sm">
                        Editing: {invoice.invoiceNumber}
                    </span>
                    <div className="scale-75 origin-left">
                        <SaveStatusIndicator status={saveStatus} lang={lang} lastSavedTime={lastSavedTime} />
                    </div>
                </div>
            );
        } else if (activeView === 'profile') {
            crumbs.push(
                <i key="sep1" className="fas fa-chevron-right text-[10px] text-slate-300"></i>,
                <span key="profile" className="text-slate-900 font-black uppercase tracking-widest text-xs">PROFILE</span>
            );
        } else if (activeView === 'templates') {
            crumbs.push(
                <i key="sep1" className="fas fa-chevron-right text-[10px] text-slate-300"></i>,
                <span key="templates" className="text-slate-900 font-black uppercase tracking-widest text-xs">TEMPLATES</span>
            );
        }

        return crumbs;
    };

    return (
        <div className="sticky top-0 z-40 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-3">
                {getBreadcrumbs()}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {activeView === 'editor' && (
                    <>
                        <button
                            onClick={onShare}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-2"
                        >
                            <i className="fas fa-share-alt"></i>
                            <span>{t.shareLink?.split(' ')[0] || 'Share'}</span>
                        </button>

                        <button
                            onClick={onSaveTemplate}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-2"
                        >
                            <i className="fas fa-bookmark"></i>
                            <span>{t.saveAsTemplate || 'Save Template'}</span>
                        </button>

                        <button
                            onClick={onExportPdf}
                            disabled={isExporting}
                            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm shadow-blue-200 disabled:opacity-70"
                        >
                            {isExporting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-file-pdf"></i>}
                            <span>{isExporting ? t.generating : t.exportPdf}</span>
                        </button>

                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    </>
                )}

                {/* Language Selector */}
                <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <span className="text-lg">{langMap[lang].flag}</span>
                        <span className="text-xs font-bold text-slate-600">{langMap[lang].label}</span>
                        <i className="fas fa-chevron-down text-[10px] text-slate-400"></i>
                    </button>

                    <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block transition-all">
                        <button
                            onClick={() => onLangChange('en')}
                            className="w-full px-4 py-3 text-left text-xs font-bold flex items-center gap-3 hover:bg-slate-50 text-slate-600"
                        >
                            <span>🇺🇸</span> English
                        </button>
                        <button
                            onClick={() => onLangChange('zh-TW')}
                            className="w-full px-4 py-3 text-left text-xs font-bold flex items-center gap-3 hover:bg-slate-50 text-slate-600"
                        >
                            <span>🇨🇳</span> 繁体中文
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
