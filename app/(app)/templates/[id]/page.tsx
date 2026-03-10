import type { Metadata } from 'next';
import TemplateDetailRoute from '@/components/app/routes/TemplateDetailRoute';

export const metadata: Metadata = {
  title: 'Template Detail | SmartBill Pro',
  description: 'View and use a saved invoice template.',
};

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TemplateDetailRoute templateId={id} />;
}
