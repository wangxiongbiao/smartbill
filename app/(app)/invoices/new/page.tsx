import { Suspense } from 'react';
import type { Metadata } from 'next';
import EditorRoute from '@/components/app/routes/EditorRoute';
import ContentSkeleton from '@/components/app/ContentSkeleton';

export const metadata: Metadata = {
  title: 'Create New Invoice',
  description: 'Create and edit a private invoice draft inside your SmartBill workspace.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<ContentSkeleton blocks={4} />}>
      <EditorRoute />
    </Suspense>
  );
}
