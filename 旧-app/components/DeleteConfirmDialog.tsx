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

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200"
                onClick={!isDeleting ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 animate-scaleIn">
                {/* Warning Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                    </div>
                </div>

                {/* Title */}
                <h2
                    id="delete-dialog-title"
                    className="text-2xl font-black text-slate-900 text-center mb-3 tracking-tight"
                >
                    {title}
                </h2>

                {/* Description */}
                <p className="text-slate-600 text-center mb-8 leading-relaxed">
                    {itemName ? description.replace('{item}', itemName) : description}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        ref={cancelButtonRef}
                        onClick={onClose}
                        disabled={isDeleting}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${isDeleting
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95'
                            }`}
                        aria-label={cancelText}
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmButtonRef}
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isDeleting
                                ? 'bg-red-400 text-white cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-lg shadow-red-200'
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
