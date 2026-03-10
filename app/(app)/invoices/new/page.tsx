import type { Metadata } from 'next';
import EditorRoute from '@/components/app/routes/EditorRoute';

export const metadata: Metadata = {
  title: 'New Invoice | SmartBill Pro',
  description: 'Create a new invoice.',
};

export default function NewInvoicePage() {
  return <EditorRoute />;
}
