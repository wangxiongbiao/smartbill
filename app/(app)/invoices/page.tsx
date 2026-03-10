import type { Metadata } from 'next';
import RecordsRoute from '@/components/app/routes/RecordsRoute';

export const metadata: Metadata = {
  title: 'Invoices | SmartBill Pro',
  description: 'Browse and manage your invoices.',
};

export default function InvoicesPage() {
  return <RecordsRoute />;
}
