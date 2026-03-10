import type { Metadata } from 'next';
import TemplatesRoute from '@/components/app/routes/TemplatesRoute';

export const metadata: Metadata = {
  title: 'Templates | SmartBill Pro',
  description: 'Manage your invoice templates.',
};

export default function TemplatesPage() {
  return <TemplatesRoute />;
}
