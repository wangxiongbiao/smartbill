import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return 'fa-check-circle';
            case 'error':
                return 'fa-exclamation-circle';
            case 'warning':
                return 'fa-exclamation-triangle';
            case 'info':
                return 'fa-info-circle';
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return 'bg-emerald-50 border-emerald-200 text-emerald-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-amber-50 border-amber-200 text-amber-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success':
                return 'text-emerald-600';
            case 'error':
                return 'text-red-600';
            case 'warning':
                return 'text-amber-600';
            case 'info':
                return 'text-blue-600';
        }
    };

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 fade-in duration-300">
            <div className={`${getColors()} border-2 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 min-w-[320px] max-w-md`}>
                <div className={`w-10 h-10 rounded-full ${getColors()} flex items-center justify-center flex-shrink-0`}>
                    <i className={`fas ${getIcon()} ${getIconColor()} text-xl`}></i>
                </div>
                <p className="font-bold text-sm flex-1 leading-relaxed">{message}</p>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors flex-shrink-0"
                >
                    <i className="fas fa-times text-sm opacity-50"></i>
                </button>
            </div>
        </div>
    );
};

export default Toast;
