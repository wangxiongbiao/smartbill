import type { Metadata } from 'next';
import TemplatesRoute from '@/components/app/routes/TemplatesRoute';

export const metadata: Metadata = {
  title: 'Template Library',
  description: 'Manage your private SmartBill template library for recurring invoice workflows.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TemplatesPage() {
  return <TemplatesRoute />;
}
