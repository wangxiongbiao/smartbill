'use client';

import React, { useState, useRef, useEffect } from 'react';
import { InvoiceColumn } from '@/types/invoice';
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
import { GripVertical, Eye, EyeOff, Trash2, Lock, X } from 'lucide-react';

interface ColumnConfiguratorProps {
    columns: InvoiceColumn[];
    onChange: (columns: InvoiceColumn[]) => void;
    onClose: () => void;
}

const SortableColumnItem = ({
    column,
    onToggleVisibility,
    onRename,
    onDelete
}: {
    column: InvoiceColumn;
    onToggleVisibility: (id: string) => void;
    onRename: (id: string, newLabel: string) => void;
    onDelete: (id: string) => void;
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
                <GripVertical className="w-4 h-4" />
            </div>

            <button
                onClick={() => onToggleVisibility(column.id)}
                className={`p-1 rounded ${column.visible ? 'text-blue-600' : 'text-slate-300'}`}
                title={column.visible ? '可見' : '已隱藏'}
            >
                {column.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            <input
                value={column.label}
                onChange={(e) => onRename(column.id, e.target.value)}
                className="flex-1 text-sm border-none focus:ring-0 bg-transparent font-medium text-slate-700"
                placeholder="列名稱"
            />

            {!column.required && (
                <button
                    onClick={() => onDelete(column.id)}
                    className="text-slate-300 hover:text-red-500 p-1"
                    title="刪除列"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            {column.required && (
                <span className="text-xs text-slate-300 px-1 select-none" title="系統列 (不可刪除)">
                    <Lock className="w-3 h-3" />
                </span>
            )}
        </div>
    );
};

const ColumnConfigurator: React.FC<ColumnConfiguratorProps> = ({ columns, onChange, onClose }) => {
    const [newColumnName, setNewColumnName] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

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
            field: `customValues.${nanoid()}`,
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
        <div
            ref={containerRef}
            className="absolute right-0 top-10 z-100 w-80 sm:w-[480px] bg-white rounded-xl shadow-xl border border-slate-200 p-4 animate-in fade-in zoom-in duration-200 origin-top-right"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700">自定義列</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
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
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
                <input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="新列名稱"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && addColumn()}
                />
                <button
                    onClick={addColumn}
                    disabled={!newColumnName.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    新增
                </button>
            </div>
        </div>
    );
};

export default ColumnConfigurator;
