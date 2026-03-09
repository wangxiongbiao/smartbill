import React from 'react';
import { Invoice, InvoiceColumn, InvoiceItem } from '@/types/invoice';
import { InvoiceTheme } from '@/lib/invoice-theme';
import EditableText from './EditableText';

interface PreviewLineItemsProps {
    invoice: Invoice;
    theme: InvoiceTheme;
    currencyFormatter: Intl.NumberFormat;
    currencySymbol: string;
    onChange?: (updates: Partial<Invoice>) => void;
}

const defaultColumns: InvoiceColumn[] = [
    { id: 'desc', field: 'description', label: '項目描述', type: 'system-text', order: 0, visible: true, required: true },
    { id: 'qty', field: 'quantity', label: '數量', type: 'system-quantity', order: 1, visible: true, required: true },
    { id: 'rate', field: 'rate', label: '單價', type: 'system-rate', order: 2, visible: true, required: true },
    { id: 'amt', field: 'amount', label: '金額', type: 'system-amount', order: 3, visible: true, required: true },
];

const PreviewLineItems: React.FC<PreviewLineItemsProps> = ({
    invoice,
    theme,
    currencyFormatter,
    currencySymbol,
    onChange
}) => {
    const columns = invoice.columnConfig || defaultColumns;
    const visibleColumns = columns.filter(col => col.visible).sort((a, b) => a.order - b.order);

    const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
        if (!onChange) return;
        const newItems = invoice.items.map(item => item.id === id ? { ...item, ...updates } : item);
        onChange({ items: newItems });
    };

    const renderCell = (item: InvoiceItem, column: InvoiceColumn) => {
        if (!onChange) {
            switch (column.type) {
                case 'system-text': return item.description || '...';
                case 'system-quantity': return item.quantity;
                case 'system-rate': return currencyFormatter.format(Number(item.rate));
                case 'system-amount':
                    const amt = (item.amount !== undefined && item.amount !== '')
                        ? Number(item.amount)
                        : Number(item.quantity) * Number(item.rate);
                    return currencyFormatter.format(amt);
                case 'custom-text':
                case 'custom-number': return item.customValues?.[column.id] || '';
                default: return null;
            }
        }

        switch (column.type) {
            case 'system-text':
                return (
                    <EditableText
                        value={item.description}
                        onChange={(val) => updateItem(item.id, { description: val })}
                        multiline
                    />
                );
            case 'system-quantity':
                return (
                    <EditableText
                        value={String(item.quantity)}
                        onChange={(val) => updateItem(item.id, { quantity: Number(val) || 0 })}
                        className="justify-center text-center"
                        type="number"
                    />
                );
            case 'system-rate':
                return (
                    <div className="flex items-center justify-center gap-1 group/rate relative text-[10px]">
                        <span>{currencySymbol}</span>
                        <EditableText
                            value={String(item.rate)}
                            onChange={(val) => updateItem(item.id, { rate: val })}
                            className="text-center font-bold"
                            type="number"
                        />
                    </div>
                );
            case 'system-amount':
                const amt = (item.amount !== undefined && item.amount !== '')
                    ? Number(item.amount)
                    : Number(item.quantity) * Number(item.rate);
                return <span className="text-right block w-full">{currencyFormatter.format(amt)}</span>;
            case 'custom-text':
            case 'custom-number':
                return (
                    <EditableText
                        value={(item.customValues?.[column.id] as any) || ''}
                        onChange={(val) => updateItem(item.id, { customValues: { ...item.customValues, [column.id]: val } })}
                        type={column.type === 'custom-number' ? 'number' : 'text'}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <table className="w-full text-left mb-10 border-collapse">
            <thead>
                <tr
                    className="border-b text-[10px] font-black tracking-widest"
                    style={{ backgroundColor: theme.tableHeaderFill, color: theme.tableHeaderText, borderColor: theme.borderColor }}
                >
                    {visibleColumns.map(col => (
                        <th key={col.id} className={`px-6 py-5 ${col.type === 'system-amount' ? 'text-right' : (col.type === 'system-quantity' || col.type === 'system-rate' ? 'text-center' : '')}`}>
                            {col.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: theme.borderColor }}>
                {invoice.items.map((item) => (
                    <tr key={item.id} className="text-[11px]" style={{ color: theme.mutedColor }}>
                        {visibleColumns.map(col => (
                            <td
                                key={col.id}
                                className={`px-6 py-5 ${col.type === 'system-amount' ? 'text-right text-sm font-black' : (col.type === 'system-quantity' || col.type === 'system-rate' ? 'text-center font-bold' : 'font-medium')} ${col.type === 'system-text' || col.type === 'custom-text' ? 'max-w-[300px] whitespace-pre-wrap leading-relaxed' : ''}`}
                                style={{ color: col.type === 'system-amount' ? theme.textColor : undefined }}
                            >
                                {renderCell(item, col)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default PreviewLineItems;
