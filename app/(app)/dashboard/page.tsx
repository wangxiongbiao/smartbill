import type { Metadata } from 'next';
import HomeRoute from '@/components/app/routes/HomeRoute';

export const metadata: Metadata = {
  title: 'Dashboard | SmartBill Pro',
  description: 'Overview of your invoices, templates, and activity.',
};

export default function DashboardPage() {
  return <HomeRoute />;
}
