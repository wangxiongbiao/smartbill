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
            case 'saved':
                return {
                    icon: null,
                    text: t.autoSaved || 'AUTO-SAVED',
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-600',
                    borderColor: 'border-green-100'
                };
            case 'saving':
                return {
                    icon: 'fa-circle-notch fa-spin',
                    text: t.saving,
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-600',
                    borderColor: 'border-blue-100'
                };
            case 'error':
                return {
                    icon: 'fa-exclamation-triangle',
                    text: t.save_failed,
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-600',
                    borderColor: 'border-red-100'
                };
            default:
                return {
                    icon: null,
                    text: 'AUTO SAVE',
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
                px-3 py-1 rounded-md
                border
                transition-colors duration-300
                ${config.bgColor} ${config.textColor} ${config.borderColor}
            `}
        >
            {config.icon && <i className={`fas ${config.icon} text-xs`}></i>}
            <span className="text-[10px] sm:text-xs font-black tracking-wider whitespace-nowrap uppercase">{config.text}</span>
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
