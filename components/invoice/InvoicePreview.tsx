'use client';

import React from 'react';
import { Invoice, TemplateType } from '@/types/invoice';
import { getCurrencyDetails } from './CurrencySelector';
import PreviewHeader from './preview/PreviewHeader';
import PreviewClientInfo from './preview/PreviewClientInfo';
import PreviewLineItems from './preview/PreviewLineItems';
import PreviewTotals from './preview/PreviewTotals';
import PreviewPaymentInfo from './preview/PreviewPaymentInfo';
import PreviewSignature from './preview/PreviewSignature';
import PreviewDisclaimer from './preview/PreviewDisclaimer';

interface InvoicePreviewProps {
    invoice: Invoice;
    template: TemplateType;
    isHeaderReversed?: boolean;
    isForPdf?: boolean;
    onChange?: (updates: Partial<Invoice>) => void;
    onShowLogoPicker?: () => void;
    onShowQRCodePicker?: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
    invoice,
    template, // Keep for future styling
    isHeaderReversed = false,
    isForPdf = false,
    onChange,
    onShowLogoPicker,
    onShowQRCodePicker
}) => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
    const tax = subtotal * (invoice.taxRate / 100);
    const total = subtotal + tax;

    const currencyDetails = getCurrencyDetails(invoice.currency);
    const currencyFormatter = new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: invoice.currency,
    });

    return (
        <div className={`${isForPdf ? 'min-h-[296mm]' : 'min-h-[297mm]'} bg-white mx-auto text-slate-800 flex flex-col overflow-hidden  animate-in fade-in duration-700`}>
            {/* Header */}
            <PreviewHeader
                invoice={invoice}
                onChange={onChange}
                onShowLogoPicker={onShowLogoPicker}
            />

            <div className="h-[3px] bg-slate-900 mx-12" />

            <div className="px-12 py-10 flex-1 flex flex-col">
                {/* Client & Dates */}
                <PreviewClientInfo
                    invoice={invoice}
                    onChange={onChange}
                />

                {/* Line Items Table */}
                <PreviewLineItems
                    invoice={invoice}
                    currencyFormatter={currencyFormatter}
                    currencySymbol={currencyDetails.symbol}
                    onChange={onChange}
                />

                <div className="flex justify-between pt-12 border-t border-slate-100 mt-auto items-end">
                    {/* Signature */}
                    <PreviewSignature
                        invoice={invoice}
                        onChange={onChange}
                    />

                    {/* Totals */}
                    <PreviewTotals
                        invoice={invoice}
                        subtotal={subtotal}
                        tax={tax}
                        total={total}
                        currencyFormatter={currencyFormatter}
                    />
                </div>

                {/* Payment Info */}
                <PreviewPaymentInfo
                    invoice={invoice}
                    onChange={onChange}
                    onShowQRCodePicker={onShowQRCodePicker}
                />
            </div>

            {/* Disclaimer */}
            <PreviewDisclaimer
                invoice={invoice}
                onChange={onChange}
            />
        </div>
    );
};

export default InvoicePreview;
