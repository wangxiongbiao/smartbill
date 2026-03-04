'use client';

import React, { useState, useEffect } from 'react';
import { Invoice, PaymentInfoField } from '@/types/invoice';
import SenderSection from './SenderSection';
import RecipientSection from './RecipientSection';
import InvoiceDetailsSection from './InvoiceDetailsSection';
import LineItemsSection from './LineItemsSection';
import InvoiceSummarySection from './InvoiceSummarySection';
import PaymentInfoSection from './PaymentInfoSection';
import SignatureSection from './SignatureSection';
import DisclaimerSection from './DisclaimerSection';

interface InvoiceFormProps {
    invoice: Invoice;
    onChange: (updates: Partial<Invoice>) => void;
    userId?: string;
    showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    onShowLogoPicker?: () => void;
    onShowQRCodePicker?: () => void;
    showLogoPicker?: boolean;
    setShowLogoPicker?: (show: boolean) => void;
    showQRCodePicker?: boolean;
    setShowQRCodePicker?: (show: boolean) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
    invoice,
    onChange,
    onShowLogoPicker,
    onShowQRCodePicker,
}) => {
    const [showPaymentFieldConfig, setShowPaymentFieldConfig] = useState(false);

    // Initialize default columns if not present
    useEffect(() => {
        if (!invoice.columnConfig) {
            onChange({
                columnConfig: [
                    { id: 'desc', field: 'description', label: '項目描述', type: 'system-text', order: 0, visible: true, required: true },
                    { id: 'qty', field: 'quantity', label: '數量', type: 'system-quantity', order: 1, visible: true, required: true },
                    { id: 'rate', field: 'rate', label: '單價', type: 'system-rate', order: 2, visible: true, required: true },
                    { id: 'amt', field: 'amount', label: '金額', type: 'system-amount', order: 3, visible: true, required: true },
                ]
            });
        }
    }, [invoice.columnConfig, onChange]);

    // Migrate and initialize payment fields
    useEffect(() => {
        try {
            if (!invoice.paymentInfo?.fields) {
                const oldInfo = invoice.paymentInfo as any;
                const migratedFields: PaymentInfoField[] = [
                    { id: 'bankName', label: '銀行名稱', type: 'text', order: 0, visible: true, required: true, value: oldInfo?.bankName || '' },
                    { id: 'accountName', label: '賬戶名稱', type: 'text', order: 1, visible: true, required: true, value: oldInfo?.accountName || '' },
                    { id: 'accountNumber', label: '銀行賬號', type: 'text', order: 2, visible: true, required: true, value: oldInfo?.accountNumber || '' },
                    { id: 'address', label: '詳細地址', type: 'textarea', order: 3, visible: true, required: true, value: '' },
                    { id: 'extraInfo', label: '備註信息 (SWIFT/IBAN)', type: 'textarea', order: 4, visible: true, required: false, value: oldInfo?.extraInfo || '' },
                ];

                if (oldInfo?.customFields) {
                    oldInfo.customFields.forEach((cf: any, idx: number) => {
                        migratedFields.push({
                            id: cf.id,
                            label: cf.label,
                            type: 'text',
                            order: 5 + idx,
                            visible: true,
                            required: false,
                            value: cf.value
                        });
                    });
                }

                onChange({
                    paymentInfo: {
                        fields: migratedFields,
                        qrCode: oldInfo?.qrCode
                    }
                });
            } else {
                const labelMap: Record<string, string> = {
                    'Bank Name': '銀行名稱',
                    'Account Name': '賬戶名稱',
                    'Account Number': '銀行賬號',
                    'SWIFT/IBAN': '附加信息 (SWIFT/IBAN)',
                    'Additional Info (SWIFT/IBAN)': '附加信息 (SWIFT/IBAN)'
                };

                let hasChanges = false;
                const updatedFields = invoice.paymentInfo.fields.map(field => {
                    if (labelMap[field.label]) {
                        hasChanges = true;
                        return { ...field, label: labelMap[field.label] };
                    }
                    return field;
                });

                if (hasChanges) {
                    onChange({ paymentInfo: { ...invoice.paymentInfo, fields: updatedFields } });
                }
            }
        } catch (error) {
            console.error('Migration error:', error);
        }
    }, [invoice.paymentInfo, onChange]);

    return (
        <div className="space-y-4">
            {/* Sender & Receiver */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SenderSection
                    sender={invoice.sender}
                    onChange={(updates) => onChange({ sender: { ...invoice.sender, ...updates } })}
                    onShowLogoPicker={onShowLogoPicker}
                />
                <RecipientSection
                    client={invoice.client}
                    onChange={(updates) => onChange({ client: { ...invoice.client, ...updates } })}
                />
            </section>

            {/* Core Invoice Metadata */}
            <InvoiceDetailsSection
                invoice={invoice}
                onChange={onChange}
            />

            {/* Line Items & Totals Card */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm">
                <LineItemsSection
                    invoice={invoice}
                    onChange={onChange}
                />
                <InvoiceSummarySection
                    invoice={invoice}
                    onChange={onChange}
                />
            </div>

            {/* Payment Info Card */}
            <PaymentInfoSection
                invoice={invoice}
                onChange={onChange}
                onShowQRCodePicker={onShowQRCodePicker}
                showPaymentFieldConfig={showPaymentFieldConfig}
                setShowPaymentFieldConfig={setShowPaymentFieldConfig}
            />

            {/* Signature Card */}
            <SignatureSection
                invoice={invoice}
                onChange={onChange}
            />

            {/* Disclaimer Card */}
            <DisclaimerSection
                invoice={invoice}
                onChange={onChange}
            />
        </div>
    );
};

export default InvoiceForm;
