import type { Metadata } from 'next';
import HomeRoute from '@/components/app/routes/HomeRoute';

export const metadata: Metadata = {
  title: 'Invoice Dashboard',
  description: 'View invoice activity, revenue trends, overdue amounts, and recent billing records inside your SmartBill dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <HomeRoute />;
}
