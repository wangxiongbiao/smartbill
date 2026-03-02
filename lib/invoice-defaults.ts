import { Invoice } from "@/types/invoice";
import { nanoid } from "nanoid";

export const createDefaultInvoice = (userId?: string): Invoice => {
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + 30);

    return {
        id: nanoid(),
        type: 'invoice',
        invoiceNumber: `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
        date: now.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        currency: 'USD',
        taxRate: 0,
        items: [
            {
                id: nanoid(),
                description: '',
                quantity: 1,
                rate: '',
                amount: ''
            }
        ],
        sender: {
            name: '',
            email: '',
            address: '',
            disclaimerText: 'This is a computer generated document and no signature is required.\n此为电脑生成文件，无需签名。'
        },
        client: {
            name: '',
            email: '',
            address: '',
        },
        paymentInfo: {
            fields: [
                { id: 'bankName', label: 'Bank Name', type: 'text', order: 0, visible: true, required: true, value: '' },
                { id: 'accountName', label: 'Account Name', type: 'text', order: 1, visible: true, required: true, value: '' },
                { id: 'accountNumber', label: 'Account Number', type: 'text', order: 2, visible: true, required: true, value: '' },
                { id: 'extra', label: 'SWIFT/IBAN', type: 'text', order: 3, visible: true, required: false, value: '' },
            ]
        },
        notes: '',
        status: 'Draft',
        visibility: {
            date: true,
            dueDate: true,
            invoiceNumber: true,
            paymentInfo: false,
            signature: false,
            disclaimer: true
        }
    };
};
