import React, { useState, useEffect } from 'react';

export interface CompletionModalProps {
    isOpen: boolean;
    isWin: boolean;
    attempts: number;
    resultText: string;
    onClose: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
    isOpen,
    isWin,
    attempts,
    resultText,
    onClose,
}) => {
    const [copied, setCopied] = useState(false);

    // Reset copied state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCopied(false);
        }
    }, [isOpen]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(resultText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    aria-label="Close"
                >
                    <span className="material-symbols-outlined text-slate-600">close</span>
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div
                        className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isWin ? 'bg-green-100' : 'bg-orange-100'
                            }`}
                    >
                        <span
                            className={`material-symbols-outlined text-4xl ${isWin ? 'text-green-600' : 'text-orange-600'
                                }`}
                        >
                            {isWin ? 'celebration' : 'sentiment_satisfied'}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {isWin ? '🎉 Congratulations!' : '😊 Good Try!'}
                    </h2>
                    <p className="text-slate-600">
                        {isWin
                            ? `You solved it in ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}!`
                            : `You used all 6 attempts`}
                    </p>
                </div>

                {/* Result Display */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                    <pre className="text-left font-mono text-sm whitespace-pre-line leading-relaxed text-slate-800">
                        {resultText}
                    </pre>
                </div>

                {/* Copy Button */}
                <button
                    onClick={handleCopy}
                    disabled={copied}
                    className={`w-full h-14 rounded-full font-bold text-base flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg ${copied
                            ? 'bg-green-500 text-white'
                            : 'bg-primary hover:bg-[#5a9155] active:bg-[#4d7d49] text-white'
                        }`}
                >
                    <span className="material-symbols-outlined">
                        {copied ? 'check_circle' : 'content_copy'}
                    </span>
                    {copied ? 'Copied!' : 'Copy Result'}
                </button>
            </div>
        </div>
    );
};
