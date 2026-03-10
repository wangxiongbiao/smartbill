import type { Metadata } from 'next';
import EditorRoute from '@/components/app/routes/EditorRoute';

export const metadata: Metadata = {
  title: 'Invoice | SmartBill Pro',
  description: 'Edit your invoice.',
};

export default function InvoiceDetailPage() {
  return <EditorRoute />;
}
