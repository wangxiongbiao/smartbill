import type { Metadata } from 'next';
import SchoolPosterEditorRoute from '@/components/app/routes/SchoolPosterEditorRoute';

export const metadata: Metadata = {
  title: 'Edit School Poster | SmartBill Pro',
  description: 'Edit school poster content with structured cards and a live poster preview.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SchoolPosterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SchoolPosterEditorRoute posterId={id} />;
}
