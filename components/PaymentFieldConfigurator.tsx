import React, { useState } from 'react';
import { PaymentInfoField, PaymentFieldType, Language } from '../types';
import { translations } from '../i18n';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { nanoid } from 'nanoid';

interface PaymentFieldConfiguratorProps {
    fields: PaymentInfoField[];
    onChange: (fields: PaymentInfoField[]) => void;
    onClose: () => void;
    lang: Language;
}

const SortableFieldItem = ({
    field,
    onToggleVisibility,
    onRename,
    onDelete,
    t
}: {
    field: PaymentInfoField;
    onToggleVisibility: (id: string) => void;
    onRename: (id: string, newLabel: string) => void;
    onDelete: (id: string) => void;
    t: any;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg mb-2">
            <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 px-1">
                <i className="fas fa-grip-vertical"></i>
            </div>

            <button
                onClick={() => onToggleVisibility(field.id)}
                className={`p-1 rounded ${field.visible ? 'text-blue-600' : 'text-slate-300'}`}
                title={field.visible ? t.visible : t.hidden}
            >
                <i className={`fas fa-eye${field.visible ? '' : '-slash'}`}></i>
            </button>

            {field.required ? (
                <span className="flex-1 text-sm font-medium text-slate-700 px-3 py-2">
                    {field.label}
                </span>
            ) : (
                <input
                    value={field.label}
                    onChange={(e) => onRename(field.id, e.target.value)}
                    className="flex-1 text-sm border-none focus:ring-0 bg-transparent font-medium text-slate-700"
                    placeholder={t.fieldName || 'Field Name'}
                />
            )}

            {!field.required && (
                <button
                    onClick={() => onDelete(field.id)}
                    className="text-slate-300 hover:text-red-500 p-1"
                    title={t.deleteField || 'Delete Field'}
                >
                    <i className="fas fa-trash-alt"></i>
                </button>
            )}

            {field.required && (
                <span className="text-xs text-slate-300 px-1 select-none" title={t.systemField || 'System Field'}>
                    <i className="fas fa-lock"></i>
                </span>
            )}
        </div>
    );
};

const PaymentFieldConfigurator: React.FC<PaymentFieldConfiguratorProps> = ({ fields, onChange, onClose, lang }) => {
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldType, setNewFieldType] = useState<PaymentFieldType>('textarea');
    const t = translations[lang] || translations['en'];

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = fields.findIndex((f) => f.id === active.id);
            const newIndex = fields.findIndex((f) => f.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newFields = arrayMove(fields, oldIndex, newIndex).map((f, index) => ({
                    ...f,
                    order: index
                }));
                onChange(newFields);
            }
        }
    };

    const toggleVisibility = (id: string) => {
        const newFields = fields.map(f =>
            f.id === id ? { ...f, visible: !f.visible } : f
        );
        onChange(newFields);
    };

    const renameField = (id: string, newLabel: string) => {
        const newFields = fields.map(f =>
            f.id === id ? { ...f, label: newLabel } : f
        );
        onChange(newFields);
    };

    const deleteField = (id: string) => {
        const newFields = fields.filter(f => f.id !== id);
        onChange(newFields);
    };

    const addField = () => {
        if (!newFieldName.trim()) return;

        const newField: PaymentInfoField = {
            id: nanoid(),
            label: newFieldName,
            type: newFieldType,
            order: fields.length,
            visible: true,
            required: false,
            value: ''
        };

        onChange([...fields, newField]);
        setNewFieldName('');
    };

    return (
        <div className="absolute right-0 top-10 z-[100] w-120 bg-white rounded-xl shadow-xl border border-slate-200 p-4 animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700">{t.configurePaymentFields || 'Configure Payment Fields'}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div className="max-h-[600px] overflow-y-auto mb-4 pr-1">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={fields.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {fields.map((f) => (
                            <SortableFieldItem
                                key={f.id}
                                field={f}
                                onToggleVisibility={toggleVisibility}
                                onRename={renameField}
                                onDelete={deleteField}
                                t={t}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex gap-2">
                    <input
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder={t.newFieldName || 'New Field Name'}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && addField()}
                    />
                    {/* <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as PaymentFieldType)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    >
                        <option value="text">Text</option>
                        <option value="textarea">Textarea</option>
                    </select> */}
                    <button
                        onClick={addField}
                        disabled={!newFieldName.trim()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t.add}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFieldConfigurator;
