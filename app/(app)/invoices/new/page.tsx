import type { Metadata } from 'next';
import EditorRoute from '@/components/app/routes/EditorRoute';

export const metadata: Metadata = {
  title: 'Create New Invoice',
  description: 'Create and edit a private invoice draft inside your SmartBill workspace.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewInvoicePage() {
  return <EditorRoute />;
}
