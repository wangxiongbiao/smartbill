'use client';

import React, { useEffect, useCallback } from 'react';

export interface ModalProps {
    /** Controls whether the modal is visible */
    isOpen: boolean;
    /** Callback fired when the modal requests to be closed */
    onClose: () => void;
    /** Content of the modal */
    children: React.ReactNode;
    /** Title displayed at the top of the modal */
    title?: React.ReactNode;
    /** Optional description displayed below the title */
    description?: React.ReactNode;
    /** Optional maximum width of the modal. Defaults to 'max-w-md' */
    maxWidth?: string;
    /** Optional icon or brand element to display above the title */
    icon?: React.ReactNode;
}

export function Modal({
    isOpen,
    onClose,
    children,
    title,
    description,
    maxWidth = 'max-w-md',
    icon
}: ModalProps) {

    // Handle Escape key press
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    // Manage body scroll and event listener
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
            {/* Backdrop with blur effect */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[6px]"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Card */}
            <div
                className={`relative z-10 w-full ${maxWidth}`}
                style={{ animation: 'slideUp 0.25s ease-out' }}
                role="dialog"
                aria-modal="true"
            >
                <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
                        aria-label="Close modal"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M12 4L4 12M4 4l8 8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>

                    {/* Header Section (Icon + Title + Description) */}
                    {(icon || title || description) && (
                        <div className="flex flex-col items-center text-center w-full">
                            {icon && <div className="mb-4">{icon}</div>}

                            {title && (
                                <h2 className="text-xl font-bold text-slate-900 mb-1">
                                    {title}
                                </h2>
                            )}

                            {description && (
                                <p className="text-sm text-slate-500">
                                    {description}
                                </p>
                            )}

                            {/* Divider if we have a header and children */}
                            {children && (
                                <div className="w-full border-t border-slate-100 mt-6" />
                            )}
                        </div>
                    )}

                    {/* Content Section */}
                    {children && (
                        <div className="w-full">
                            {children}
                        </div>
                    )}
                </div>
            </div>

            {/* Scoped Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @media (prefers-reduced-motion: reduce) {
                    [style*="animation"] { animation: none !important; }
                }
            `}</style>
        </div>
    );
}
