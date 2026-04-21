import type { Metadata } from 'next';
import TemplateDetailRoute from '@/components/app/routes/TemplateDetailRoute';

export const metadata: Metadata = {
  title: 'Template Detail',
  description: 'View a private invoice template inside your SmartBill workspace.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TemplateDetailRoute templateId={id} />;
}
