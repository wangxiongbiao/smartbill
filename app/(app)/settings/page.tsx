import type { Metadata } from 'next';
import ProfileRoute from '@/components/app/routes/ProfileRoute';

export const metadata: Metadata = {
  title: 'Settings | SmartBill Pro',
  description: 'Manage your SmartBill account settings.',
};

export default function SettingsPage() {
  return <ProfileRoute />;
}
