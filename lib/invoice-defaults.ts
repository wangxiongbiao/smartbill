import { Invoice, TemplateType } from "@/types/invoice";
import { nanoid } from "nanoid";

interface CreateDefaultInvoiceOptions {
    id?: string;
    template?: TemplateType;
}

export const createDefaultInvoice = (_userId?: string, options: CreateDefaultInvoiceOptions = {}): Invoice => {
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + 30);

    const invoice: Invoice = {
        id: options.id ?? nanoid(),
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
            disclaimerText: '此為電腦生成文件，無需簽名。'
        },
        client: {
            name: '',
            email: '',
            address: '',
        },
        paymentInfo: {
            fields: [
                { id: 'bankName', label: '銀行名稱', type: 'text', order: 0, visible: true, required: true, value: '' },
                { id: 'accountName', label: '賬戶名稱', type: 'text', order: 1, visible: true, required: true, value: '' },
                { id: 'accountNumber', label: '銀行賬號', type: 'text', order: 2, visible: true, required: true, value: '' },
                { id: 'extra', label: '附加信息 (SWIFT/IBAN)', type: 'text', order: 3, visible: true, required: false, value: '' },
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

    if (options.template) {
        invoice.template = options.template;
    }

    return invoice;
};
