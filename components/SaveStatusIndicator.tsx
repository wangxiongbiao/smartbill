import React, { useEffect, useState } from 'react';
import { translations } from '../i18n';
import { Language } from '../types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStatusIndicatorProps {
    status: SaveStatus;
    lang: Language;
    lastSavedTime?: Date;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status, lang, lastSavedTime }) => {
    const t = translations[lang] || translations['en'];

    const getStatusConfig = () => {
        switch (status) {
            case 'idle':
                return {
                    icon: 'fa-cloud',
                    text: t.autoSaved || 'Auto Saved', // Assuming translation key exists or fallback
                    bgColor: 'bg-slate-50',
                    textColor: 'text-slate-500',
                    borderColor: 'border-slate-200'
                };
            case 'saving':
                return {
                    icon: 'fa-circle-notch fa-spin',
                    text: t.saving,
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-700',
                    borderColor: 'border-blue-200'
                };
            case 'saved':
                return {
                    icon: 'fa-check-circle',
                    text: lastSavedTime ? `${t.saved_status} ${formatTime(lastSavedTime, t)}` : t.saved_status,
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-700',
                    borderColor: 'border-green-200'
                };
            case 'error':
                return {
                    icon: 'fa-exclamation-triangle',
                    text: t.save_failed,
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-700',
                    borderColor: 'border-red-200'
                };
            default:
                return {
                    icon: 'fa-cloud',
                    text: 'Auto Save',
                    bgColor: 'bg-slate-50',
                    textColor: 'text-slate-400',
                    borderColor: 'border-slate-100'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div
            className={`
                flex items-center gap-2
                px-4 py-2 rounded-full
                border shadow-sm
                transition-colors duration-300
                ${config.bgColor} ${config.textColor} ${config.borderColor}
            `}
        >
            <i className={`fas ${config.icon} text-sm`}></i>
            <span className="text-xs font-black tracking-wide whitespace-nowrap uppercase">{config.text}</span>
        </div>
    );
};

const formatTime = (date: Date, t: any): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return t.just_now;
    if (diff < 3600) return t.mins_ago.replace('{mins}', Math.floor(diff / 60).toString());

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

export default SaveStatusIndicator;
