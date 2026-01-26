import React, { useState } from 'react';
import { InvoiceColumn, ColumnType, Language } from '../types';
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

interface ColumnConfiguratorProps {
    columns: InvoiceColumn[];
    onChange: (columns: InvoiceColumn[]) => void;
    onClose: () => void;
    lang: Language;
}

const SortableColumnItem = ({
    column,
    onToggleVisibility,
    onRename,
    onDelete,
    t
}: {
    column: InvoiceColumn;
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
    } = useSortable({ id: column.id });

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
                onClick={() => onToggleVisibility(column.id)}
                className={`p-1 rounded ${column.visible ? 'text-blue-600' : 'text-slate-300'}`}
                title={column.visible ? t.visible : t.hidden}
            >
                <i className={`fas fa-eye${column.visible ? '' : '-slash'}`}></i>
            </button>

            <input
                value={column.label}
                onChange={(e) => onRename(column.id, e.target.value)}
                className="flex-1 text-sm border-none focus:ring-0 bg-transparent font-medium text-slate-700"
                placeholder={t.columnName}
            />

            {!column.required && (
                <button
                    onClick={() => onDelete(column.id)}
                    className="text-slate-300 hover:text-red-500 p-1"
                    title={t.deleteColumn}
                >
                    <i className="fas fa-trash-alt"></i>
                </button>
            )}

            {column.required && (
                <span className="text-xs text-slate-300 px-1 select-none" title={t.systemColumn}>
                    <i className="fas fa-lock"></i>
                </span>
            )}
        </div>
    );
};

const ColumnConfigurator: React.FC<ColumnConfiguratorProps> = ({ columns, onChange, onClose, lang }) => {
    const [newColumnName, setNewColumnName] = useState('');
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
            const oldIndex = columns.findIndex((col) => col.id === active.id);
            const newIndex = columns.findIndex((col) => col.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newColumns = arrayMove(columns, oldIndex, newIndex).map((col, index) => ({
                    ...col,
                    order: index
                }));
                onChange(newColumns);
            }
        }
    };

    const toggleVisibility = (id: string) => {
        const newColumns = columns.map(col =>
            col.id === id ? { ...col, visible: !col.visible } : col
        );
        onChange(newColumns);
    };

    const renameColumn = (id: string, newLabel: string) => {
        const newColumns = columns.map(col =>
            col.id === id ? { ...col, label: newLabel } : col
        );
        onChange(newColumns);
    };

    const deleteColumn = (id: string) => {
        const newColumns = columns.filter(col => col.id !== id);
        onChange(newColumns);
    };

    const addColumn = () => {
        if (!newColumnName.trim()) return;

        const newCol: InvoiceColumn = {
            id: nanoid(),
            field: `customValues.${nanoid()}`, // unique field key
            label: newColumnName,
            type: 'custom-text',
            order: columns.length,
            visible: true,
            required: false
        };

        onChange([...columns, newCol]);
        setNewColumnName('');
    };

    return (
        <div className="absolute right-0 top-10 z-[100] w-120 bg-white rounded-xl shadow-xl border border-slate-200 p-4 animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700">{t.customizeColumns}</h3>
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
                        items={columns.map(col => col.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {columns.map((col) => (
                            <SortableColumnItem
                                key={col.id}
                                column={col}
                                onToggleVisibility={toggleVisibility}
                                onRename={renameColumn}
                                onDelete={deleteColumn}
                                t={t}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
                <input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder={t.newColumnName}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && addColumn()}
                />
                <button
                    onClick={addColumn}
                    disabled={!newColumnName.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t.add}
                </button>
            </div>
        </div>
    );
};

export default ColumnConfigurator;
