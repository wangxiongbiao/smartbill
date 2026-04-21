import type { Metadata } from 'next';
import SchoolPosterRecordsRoute from '@/components/app/routes/SchoolPosterRecordsRoute';

export const metadata: Metadata = {
  title: 'School Posters | SmartBill Pro',
  description: 'Create and manage school poster layouts with a split editor and live preview.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SchoolPostersPage() {
  return <SchoolPosterRecordsRoute />;
}
