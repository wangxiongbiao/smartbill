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
    const [isVisible, setIsVisible] = useState(false);
    const t = translations[lang] || translations['en'];

    useEffect(() => {
        if (status === 'saving' || status === 'error') {
            setIsVisible(true);
        } else if (status === 'saved') {
            setIsVisible(true);
            // Auto-hide after 1 second (as per user modification)
            const timer = setTimeout(() => setIsVisible(false), 1000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [status]);

    if (!isVisible && status === 'idle') return null;

    const getStatusConfig = () => {
        switch (status) {
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
                return null;
        }
    };

    const config = getStatusConfig();
    if (!config) return null;

    return (
        <div
            className={`
                flex items-center gap-2
                px-4 py-2 rounded-full
                border shadow-sm
                transition-all duration-300 ease-out
                ${config.bgColor} ${config.textColor} ${config.borderColor}
                ${isVisible
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-90 w-0 p-0 border-0 overflow-hidden'}
            `}
        >
            <i className={`fas ${config.icon} text-sm`}></i>
            <span className="text-xs font-black tracking-wide whitespace-nowrap uppercase">{config.text}</span>
        </div >
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
