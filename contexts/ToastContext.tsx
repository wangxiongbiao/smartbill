import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastType } from '../components/Toast';

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
    hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { toast, showToast, hideToast } = useToast();

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToastContext must be used within ToastProvider');
    }
    return context;
};
