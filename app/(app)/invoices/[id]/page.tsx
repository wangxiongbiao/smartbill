import type { Metadata } from 'next';
import EditorRoute from '@/components/app/routes/EditorRoute';

export const metadata: Metadata = {
  title: 'Edit Invoice',
  description: 'Update invoice details, payment information, line items, branding, and PDF-ready output in the SmartBill editor.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function InvoiceDetailPage() {
  return <EditorRoute />;
}
