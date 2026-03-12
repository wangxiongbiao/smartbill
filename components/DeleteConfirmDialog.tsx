import React, { useEffect, useRef } from 'react';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    isDeleting?: boolean;
    itemName?: string;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText,
    isDeleting = false,
    itemName,
}) => {
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isDeleting) {
                onClose();
            } else if (e.key === 'Enter' && !isDeleting) {
                onConfirm();
            } else if (e.key === 'Tab') {
                // Simple focus trap between cancel and confirm buttons
                const activeElement = document.activeElement;
                if (e.shiftKey) {
                    if (activeElement === cancelButtonRef.current) {
                        e.preventDefault();
                        confirmButtonRef.current?.focus();
                    }
                } else {
                    if (activeElement === confirmButtonRef.current) {
                        e.preventDefault();
                        cancelButtonRef.current?.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Focus the cancel button initially
        cancelButtonRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, onConfirm, isDeleting]);

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = '';
            return;
        }

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[160] flex items-center justify-center p-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 pointer-events-auto"
                onClick={!isDeleting ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div className="relative w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_28px_60px_-32px_rgba(15,23,42,0.3)] animate-scaleIn">
                <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <i className="fas fa-trash text-lg"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2
                                id="delete-dialog-title"
                                className="text-[1.35rem] font-semibold text-slate-900 tracking-tight"
                            >
                                {title}
                            </h2>
                            <p className="mt-2 max-w-[34rem] text-sm leading-7 text-slate-500">
                                {itemName ? description.replace('{item}', itemName) : description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-7">
                    <button
                        ref={cancelButtonRef}
                        onClick={onClose}
                        disabled={isDeleting}
                        className={`min-w-[132px] rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${isDeleting
                                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        aria-label={cancelText}
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmButtonRef}
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={`min-w-[148px] rounded-xl px-5 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${isDeleting
                                ? 'cursor-not-allowed bg-red-500 text-white'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        aria-label={confirmText}
                    >
                        {isDeleting ? (
                            <>
                                <i className="fas fa-circle-notch fa-spin"></i>
                                <span>{confirmText}</span>
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 200ms ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 200ms ease-out;
        }
      `}</style>
        </div>
    );
};

export default DeleteConfirmDialog;
