'use client';

import React from 'react';
import { Invoice, TemplateType } from '@/types/invoice';
import { getCurrencyDetails } from './CurrencySelector';
import { getInvoiceTheme } from '@/lib/invoice-theme';
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
    const activeTemplate = invoice.template || template;
    const theme = getInvoiceTheme(activeTemplate);
    const subtotal = invoice.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
    const tax = subtotal * (invoice.taxRate / 100);
    const total = subtotal + tax;

    const currencyDetails = getCurrencyDetails(invoice.currency);
    const currencyFormatter = new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: invoice.currency,
    });

    return (
        <div
            className={`${isForPdf ? 'min-h-[296mm]' : 'min-h-[297mm]'} mx-auto flex flex-col overflow-hidden animate-in fade-in duration-700`}
            style={{ backgroundColor: theme.pageBackground, color: theme.textColor }}
        >
            {/* Header */}
            <PreviewHeader
                invoice={invoice}
                theme={theme}
                onChange={onChange}
                onShowLogoPicker={onShowLogoPicker}
            />

            <div
                className="mx-12 h-[3px]"
                style={{ backgroundColor: theme.id === 'professional' ? theme.accentColor : theme.borderColor }}
            />

            <div className="px-12 py-10 flex-1 flex flex-col">
                {/* Client & Dates */}
                <PreviewClientInfo
                    invoice={invoice}
                    theme={theme}
                    onChange={onChange}
                />

                {/* Line Items Table */}
                <PreviewLineItems
                    invoice={invoice}
                    theme={theme}
                    currencyFormatter={currencyFormatter}
                    currencySymbol={currencyDetails.symbol}
                    onChange={onChange}
                />

                <div
                    className="mt-auto flex items-end justify-between pt-12"
                    style={{ borderTop: `1px solid ${theme.borderColor}` }}
                >
                    {/* Signature */}
                    <PreviewSignature
                        invoice={invoice}
                        theme={theme}
                        onChange={onChange}
                    />

                    {/* Totals */}
                    <PreviewTotals
                        invoice={invoice}
                        theme={theme}
                        subtotal={subtotal}
                        tax={tax}
                        total={total}
                        currencyFormatter={currencyFormatter}
                    />
                </div>

                {/* Payment Info */}
                <PreviewPaymentInfo
                    invoice={invoice}
                    theme={theme}
                    onChange={onChange}
                    onShowQRCodePicker={onShowQRCodePicker}
                />
            </div>

            {/* Disclaimer */}
            <PreviewDisclaimer
                invoice={invoice}
                theme={theme}
                onChange={onChange}
            />
        </div>
    );
};

export default InvoicePreview;
