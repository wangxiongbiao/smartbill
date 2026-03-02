'use client';

import React from 'react';
import { CustomField, Language } from '@/types/invoice';
import { translations } from '@/lib/i18n';
import { Plus, Trash2, Tag } from 'lucide-react';
import { nanoid } from 'nanoid';

interface CustomFieldsEditorProps {
    fields: CustomField[];
    onChange: (fields: CustomField[]) => void;
    lang: Language;
}

const CustomFieldsEditor: React.FC<CustomFieldsEditorProps> = ({ fields, onChange, lang }) => {
    const t = translations[lang] || translations['en'];

    const addField = () => {
        const newField: CustomField = {
            id: nanoid(),
            label: '',
            value: ''
        };
        onChange([...fields, newField]);
    };

    const updateField = (id: string, updates: Partial<CustomField>) => {
        onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        onChange(fields.filter(f => f.id !== id));
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    {/* t.customFields or a fallback label */}
                    {translations[lang]?.customFields || 'Custom Fields'}
                </span>
                <button
                    onClick={addField}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Add Custom Field"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="space-y-3">
                {fields.map((field) => (
                    <div key={field.id} className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex-1 space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                            <div className="relative">
                                <Tag className="absolute top-2.5 left-3 w-3 h-3 text-slate-300" />
                                <input
                                    placeholder="Label (e.g., VAT ID)"
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 uppercase tracking-widest focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <input
                                placeholder="Value"
                                value={field.value}
                                onChange={(e) => updateField(field.id, { value: e.target.value })}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => removeField(field.id)}
                            className="self-center p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {fields.length === 0 && (
                    <div className="text-[10px] italic text-slate-300 ml-1">
                        Any extra information from or for this party.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomFieldsEditor;
