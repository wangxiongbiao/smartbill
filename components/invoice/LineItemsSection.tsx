'use client';

import React, { useState } from 'react';
import { Invoice, InvoiceItem, InvoiceColumn } from '@/types/invoice';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    TouchSensor,
    MouseSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, Plus, Trash2, GripVertical } from 'lucide-react';
import ColumnConfigurator from './ColumnConfigurator';
import { nanoid } from 'nanoid';

interface LineItemsSectionProps {
    invoice: Invoice;
    onChange: (updates: Partial<Invoice>) => void;
}

const SortableItem = ({ id, children }: { id: string; children: (props: { listeners: any; attributes: any }) => React.ReactNode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            {children({ listeners, attributes })}
        </div>
    );
};

const LineItemsSection: React.FC<LineItemsSectionProps> = ({
    invoice,
    onChange
}) => {
    const [focusItemId, setFocusItemId] = useState<string | null>(null);
    const [showColumnConfig, setShowColumnConfig] = useState(false);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = invoice.items.findIndex((item) => item.id === active.id);
            const newIndex = invoice.items.findIndex((item) => item.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                onChange({ items: arrayMove(invoice.items, oldIndex, newIndex) });
            }
        }
    };

    const addItem = () => {
        const id = nanoid();
        const newItem: InvoiceItem = { id, description: '', quantity: 1, rate: '', amount: '' };
        onChange({ items: [...invoice.items, newItem] });
        setFocusItemId(id);
    };

    const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
        const newItems = invoice.items.map(item => {
            if (item.id !== id) return item;
            const updated = { ...item, ...updates };
            if (('quantity' in updates || 'rate' in updates) && !('amount' in updates)) {
                if (!String(updated.quantity ?? '') || !String(updated.rate ?? '')) {
                    updated.amount = '';
                    return updated;
                }
                updated.amount = Number(updated.quantity || 0) * Number(updated.rate || 0);
            }
            return updated;
        });
        onChange({ items: newItems });
    };

    const updateItemAmount = (id: string, newAmount: number | string) => {
        const item = invoice.items.find(i => i.id === id);
        if (!item) return;
        if (newAmount === '') {
            updateItem(id, { amount: '', rate: '' });
            return;
        }
        const amount = Number(newAmount);
        const qty = Number(item.quantity || 1);
        updateItem(id, { rate: amount / qty, amount });
    };

    const updateCustomValue = (itemId: string, columnId: string, value: string) => {
        const item = invoice.items.find(i => i.id === itemId);
        if (!item) return;
        const newCustomValues = { ...(item.customValues || {}), [columnId]: value };
        updateItem(itemId, { customValues: newCustomValues });
    };

    const removeItem = (id: string) => {
        onChange({ items: invoice.items.filter(item => item.id !== id) });
    };

    const handleNumberInput = (value: string, callback: (val: string | number) => void) => {
        if (value === '') { callback(''); return; }
        const numberRegex = /^-?\d*\.?\d*$/;
        if (numberRegex.test(value)) {
            if (value === '-' || value === '.' || value === '-.' || value.endsWith('.')) {
                callback(value);
            } else {
                callback(Number(value));
            }
        }
    };

    const autoResizeTextarea = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        target.style.height = 'auto';
        target.style.height = target.scrollHeight + 'px';
    };

    const renderCell = (item: InvoiceItem, column: InvoiceColumn) => {
        switch (column.type) {
            case 'system-text':
                return (
                    <textarea
                        placeholder={column.label}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none overflow-hidden min-h-[40px]"
                        value={item.description}
                        autoFocus={item.id === focusItemId}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        onInput={autoResizeTextarea}
                        rows={1}
                    />
                );
            case 'system-quantity':
                return (
                    <input
                        type="text"
                        inputMode="decimal"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-center"
                        value={item.quantity}
                        onChange={(e) => handleNumberInput(e.target.value, (val) => updateItem(item.id, { quantity: val }))}
                        placeholder="0"
                    />
                );
            case 'system-rate':
                return (
                    <input
                        type="text"
                        inputMode="decimal"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-right"
                        value={item.rate}
                        onChange={(e) => handleNumberInput(e.target.value, (val) => updateItem(item.id, { rate: val }))}
                        placeholder="0.00"
                    />
                );
            case 'system-amount':
                return (
                    <input
                        type="text"
                        inputMode="decimal"
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm font-bold text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-blue-700"
                        value={item.amount || ''}
                        onChange={(e) => handleNumberInput(e.target.value, (val) => updateItemAmount(item.id, val))}
                        placeholder="0.00"
                    />
                );
            case 'custom-text':
                return (
                    <textarea
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none overflow-hidden min-h-[40px]"
                        value={item.customValues?.[column.id] || ''}
                        onChange={(e) => updateCustomValue(item.id, column.id, e.target.value)}
                        onInput={autoResizeTextarea}
                        rows={1}
                    />
                );
            default: return null;
        }
    };

    const columns = invoice.columnConfig || [];
    const sortedColumns = columns.slice().sort((a, b) => a.order - b.order);

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black tracking-widest text-slate-400">項目明細</h3>
                <div className="relative">
                    <button
                        onClick={() => setShowColumnConfig(!showColumnConfig)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showColumnConfig ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50'
                            }`}
                    >
                        <Settings className={`w-4 h-4 ${showColumnConfig ? 'animate-spin-slow' : ''}`} />
                        自定義列
                    </button>
                    {showColumnConfig && (
                        <ColumnConfigurator columns={columns} onChange={(newCols) => onChange({ columnConfig: newCols })} onClose={() => setShowColumnConfig(false)} />
                    )}
                </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={invoice.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-6">
                        {invoice.items.map((item) => {
                            const systemColumns = sortedColumns.filter(col => col.type.startsWith('system-'));
                            const customColumns = sortedColumns.filter(col => col.type.startsWith('custom-'));
                            return (
                                <SortableItem key={item.id} id={item.id}>
                                    {({ listeners }) => (
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 relative group/item shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                                            <div className="absolute top-4 -left-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <div {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-500 bg-white rounded-full shadow-md border border-slate-100">
                                                    <GripVertical className="w-4 h-4" />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-100 hover:shadow-md flex items-center justify-center rounded-full opacity-0 group-hover/item:opacity-100 transition-all z-10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <div className="space-y-2">
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                    {/* Description - take more space */}
                                                    {systemColumns.find(c => c.field === 'description') && (
                                                        <div className="md:col-span-6">
                                                            <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 mb-2 block">項目描述</label>
                                                            {renderCell(item, systemColumns.find(c => c.field === 'description')!)}
                                                        </div>
                                                    )}

                                                    <div className="md:col-span-6 grid grid-cols-3 gap-4">
                                                        {systemColumns.filter(c => c.field !== 'description').map(col => (
                                                            <div key={col.id}>
                                                                <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 mb-2 block text-center truncate">
                                                                    {col.label}
                                                                </label>
                                                                {renderCell(item, col)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Custom columns */}
                                                {customColumns.length > 0 && (
                                                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                                        {customColumns.map(col => (
                                                            <div key={col.id}>
                                                                <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 mb-2 block">{col.label}</label>
                                                                {renderCell(item, col)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </SortableItem>
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>

            <div className="flex justify-center mt-3">
                <button
                    onClick={addItem}
                    className="px-20 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all group shadow-sm"
                >
                    <Plus className="w-4 h-4 transform group-hover:rotate-90 transition-transform" />
                    <span className="font-bold tracking-wider text-xs">添加項目</span>
                </button>
            </div>
        </section>
    );
};

export default LineItemsSection;
