import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface SaveTemplateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description: string) => Promise<void>;
    lang: Language;
    isUpdating?: boolean;
}

const SaveTemplateDialog: React.FC<SaveTemplateDialogProps> = ({
    isOpen,
    onClose,
    onSave,
    lang,
    isUpdating = false
}) => {
    const t = translations[lang] || translations['en'];

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const copy = {
        subtitle: isUpdating
            ? (t.updateTemplateInfo || 'Update template information')
            : (t.saveTemplateSubtitle || 'Save this invoice configuration as a reusable template'),
        requiredError: `${t.templateName} ${t.requiredField || 'is required'}`,
        saveFailed: t.saveTemplateFailed || 'Failed to save template. Please try again.',
        cancel: t.deleteDialogCancel || 'Cancel',
        loadingText: isUpdating
            ? `${t.updateAction || 'Update'}...`
            : `${t.saveAction || 'Save'}...`,
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError(copy.requiredError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSave(name.trim(), description.trim());
            setName('');
            setDescription('');
            onClose();
        } catch (err) {
            console.error('Error saving template:', err);
            setError(copy.saveFailed);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setName('');
            setDescription('');
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all pointer-events-auto"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">
                            {isUpdating ? t.updateTemplate : t.saveAsTemplate}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            {copy.subtitle}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-widest mb-2 block">
                            {t.templateName} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.templateNamePlaceholder}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            disabled={loading}
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-widest mb-2 block">
                            {t.templateDescription}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t.templateDescPlaceholder}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            disabled={loading}
                            maxLength={500}
                        />
                        <div className="text-right text-xs text-slate-400 mt-1">
                            {description.length}/500
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                            <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                        >
                            {copy.cancel}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>{copy.loadingText}</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i>
                                    <span>{isUpdating ? t.updateTemplate : t.saveTemplate}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaveTemplateDialog;
