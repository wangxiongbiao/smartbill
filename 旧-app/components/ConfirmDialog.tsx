import React, { useEffect, useRef, useState } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  isProcessing?: boolean;
  variant?: 'warning' | 'info' | 'danger';
  itemName?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  isProcessing = false,
  variant = 'info',
  itemName,
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [shake, setShake] = useState(false);

  // Icon and color based on variant
  const variantConfig = {
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      icon: 'fa-exclamation-triangle',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800',
      buttonShadow: 'shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300',
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: 'fa-info-circle',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
      buttonShadow: 'shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300',
    },
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      icon: 'fa-exclamation-triangle',
      buttonBg: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
      buttonShadow: 'shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300',
    },
  };

  const config = variantConfig[variant];

  // Handle close with animation
  const handleClose = () => {
    if (isProcessing) {
      // Shake animation to indicate can't close while processing
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  // Handle confirm with better UX
  const handleConfirm = () => {
    if (!isProcessing) {
      onConfirm();
    }
  };

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'Enter' && !isProcessing) {
        e.preventDefault();
        handleConfirm();
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

    // Focus the cancel button initially (safer default)
    setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isProcessing]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-[150] flex items-center justify-center p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
        }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200 pointer-events-auto ${isClosing ? 'opacity-0' : 'opacity-100'
          }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className={`relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 transition-all duration-200 pointer-events-auto ${isClosing ? 'animate-scaleOut' : 'animate-scaleIn'
          } ${shake ? 'animate-shake' : ''}`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center transition-transform duration-300 ${!isClosing ? 'animate-iconPop' : ''
              }`}
          >
            <i className={`fas ${config.icon} ${config.iconColor} text-2xl`}></i>
          </div>
        </div>

        {/* Title */}
        <h2
          id="confirm-dialog-title"
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
            onClick={handleClose}
            disabled={isProcessing}
            className={`flex-1 px-6 py-3.5 rounded-xl font-bold transition-all duration-200 ${isProcessing
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-slate-300 focus:ring-offset-2'
              }`}
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`relative overflow-hidden flex-1 px-6 py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${isProcessing
              ? 'opacity-70 cursor-not-allowed'
              : `${config.buttonBg} text-white hover:scale-105 active:scale-95 ${config.buttonShadow} focus:ring-2 focus:ring-offset-2 ${variant === 'info'
                ? 'focus:ring-blue-500'
                : variant === 'danger'
                  ? 'focus:ring-red-500'
                  : 'focus:ring-amber-500'
              }`
              }`}
            aria-label={confirmText}
          >
            {/* Ripple effect container */}
            <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200"></span>

            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="relative">{confirmText}</span>
              </>
            ) : (
              <span className="relative">{confirmText}</span>
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

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes scaleOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
        }

        @keyframes iconPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 200ms ease-out;
        }

        .animate-fadeOut {
          animation: fadeOut 200ms ease-in;
        }

        .animate-scaleIn {
          animation: scaleIn 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-scaleOut {
          animation: scaleOut 200ms ease-in;
        }

        .animate-iconPop {
          animation: iconPop 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
          animation-delay: 100ms;
          animation-fill-mode: both;
        }

        .animate-shake {
          animation: shake 400ms ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
