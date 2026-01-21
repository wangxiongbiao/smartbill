import InvoiceForm from '@/components/InvoiceForm';
import { Invoice } from '@/shared/types';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INITIAL_INVOICE: Invoice = {
    id: '',
    type: 'invoice',
    invoiceNumber: 'INV-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sender: {
        name: '',
        email: '',
        address: ''
    },
    client: {
        name: '',
        email: '',
        address: ''
    },
    items: [
        { id: 'item-1', description: 'Web Development', quantity: 1, rate: 0 }
    ],
    taxRate: 0,
    currency: 'USD',
    notes: 'Thank you for your business!',
    status: 'Draft'
};

export default function EditorScreen() {
    const [invoice, setInvoice] = useState<Invoice>(INITIAL_INVOICE);

    const updateInvoice = (updates: Partial<Invoice>) => {
        setInvoice((prev: Invoice) => ({ ...prev, ...updates }));
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{ title: 'New Invoice', headerBackTitle: 'Back' }} />
            <InvoiceForm invoice={invoice} onChange={updateInvoice} lang="en" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
