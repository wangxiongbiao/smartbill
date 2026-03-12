import React, { useState } from 'react';
import { TEMPLATE_TYPE_OPTIONS } from '@/lib/template-types';
import { translations } from '../i18n';
import type { Language, TemplateCategory } from '../types';

interface SaveTemplateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description: string, templateType: TemplateCategory) => Promise<void>;
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
    const [templateType, setTemplateType] = useState<TemplateCategory | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const copyByLang: Record<Language, {
        subtitle: string;
        requiredNameError: string;
        requiredTypeError: string;
        saveFailed: string;
        cancel: string;
        loadingText: string;
        typeLabel: string;
        typePlaceholder: string;
    }> = {
        en: {
            subtitle: isUpdating
                ? (t.updateTemplateInfo || 'Update template information')
                : (t.saveTemplateSubtitle || 'Save this invoice configuration as a reusable template'),
            requiredNameError: `${t.templateName} ${t.requiredField || 'is required'}`,
            requiredTypeError: 'Template type is required',
            saveFailed: t.saveTemplateFailed || 'Failed to save template. Please try again.',
            cancel: t.deleteDialogCancel || 'Cancel',
            loadingText: isUpdating
                ? `${t.updateAction || 'Update'}...`
                : `${t.saveAction || 'Save'}...`,
            typeLabel: 'Template Type',
            typePlaceholder: 'Select a template type',
        },
        'zh-CN': {
            subtitle: isUpdating
                ? (t.updateTemplateInfo || '更新模板信息')
                : (t.saveTemplateSubtitle || '将发票配置保存为可重复使用的模板'),
            requiredNameError: `${t.templateName} ${t.requiredField || '为必填项'}`,
            requiredTypeError: '模板类型不能为空',
            saveFailed: t.saveTemplateFailed || '保存模板失败，请重试。',
            cancel: t.deleteDialogCancel || '取消',
            loadingText: isUpdating
                ? `${t.updateAction || '更新'}...`
                : `${t.saveAction || '保存'}...`,
            typeLabel: '模板类型',
            typePlaceholder: '请选择模板类型',
        },
        'zh-TW': {
            subtitle: isUpdating
                ? (t.updateTemplateInfo || '更新模板資訊')
                : (t.saveTemplateSubtitle || '將發票配置保存為可重複使用的模板'),
            requiredNameError: `${t.templateName} ${t.requiredField || '為必填項'}`,
            requiredTypeError: '模板類型不能為空',
            saveFailed: t.saveTemplateFailed || '保存模板失敗，請重試。',
            cancel: t.deleteDialogCancel || '取消',
            loadingText: isUpdating
                ? `${t.updateAction || '更新'}...`
                : `${t.saveAction || '保存'}...`,
            typeLabel: '模板類型',
            typePlaceholder: '請選擇模板類型',
        },
        th: {
            subtitle: isUpdating
                ? (t.updateTemplateInfo || 'อัปเดตข้อมูลเทมเพลต')
                : (t.saveTemplateSubtitle || 'บันทึกการกำหนดค่านี้เป็นเทมเพลตที่นำมาใช้ซ้ำได้'),
            requiredNameError: `${t.templateName} ${t.requiredField || 'จำเป็นต้องกรอก'}`,
            requiredTypeError: 'จำเป็นต้องเลือกประเภทเทมเพลต',
            saveFailed: t.saveTemplateFailed || 'ไม่สามารถบันทึกเทมเพลต โปรดลองอีกครั้ง',
            cancel: t.deleteDialogCancel || 'ยกเลิก',
            loadingText: isUpdating
                ? `${t.updateAction || 'อัปเดต'}...`
                : `${t.saveAction || 'บันทึก'}...`,
            typeLabel: 'ประเภทเทมเพลต',
            typePlaceholder: 'เลือกประเภทเทมเพลต',
        },
        id: {
            subtitle: isUpdating
                ? (t.updateTemplateInfo || 'Perbarui informasi templat')
                : (t.saveTemplateSubtitle || 'Simpan konfigurasi ini sebagai templat yang dapat digunakan kembali'),
            requiredNameError: `${t.templateName} ${t.requiredField || 'wajib diisi'}`,
            requiredTypeError: 'Jenis templat wajib dipilih',
            saveFailed: t.saveTemplateFailed || 'Gagal menyimpan templat. Silakan coba lagi.',
            cancel: t.deleteDialogCancel || 'Batal',
            loadingText: isUpdating
                ? `${t.updateAction || 'Perbarui'}...`
                : `${t.saveAction || 'Simpan'}...`,
            typeLabel: 'Jenis Templat',
            typePlaceholder: 'Pilih jenis templat',
        },
    };

    const copy = copyByLang[lang] || copyByLang.en;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError(copy.requiredNameError);
            return;
        }

        if (!templateType) {
            setError(copy.requiredTypeError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSave(name.trim(), description.trim(), templateType);
            setName('');
            setDescription('');
            setTemplateType('');
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
            setTemplateType('');
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
                        <label className="text-[0.625rem] uppercase font-semibold text-slate-400 tracking-widest mb-2 block">
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
                        <label className="text-[0.625rem] uppercase font-semibold text-slate-400 tracking-widest mb-2 block">
                            {copy.typeLabel} <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={templateType}
                            onChange={(e) => setTemplateType(e.target.value as TemplateCategory | '')}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            disabled={loading}
                        >
                            <option value="">{copy.typePlaceholder}</option>
                            {TEMPLATE_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[0.625rem] uppercase font-semibold text-slate-400 tracking-widest mb-2 block">
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
                            disabled={loading || !name.trim() || !templateType}
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
