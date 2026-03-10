import type { Metadata } from 'next';
import Script from 'next/script';
import { Header } from '@/components/Header';
import { TemplatesGallery } from '@/components/home/TemplatesGallery';
import { FAQ } from '@/components/home/FAQ';
import { Footer } from '@/components/Footer';
import { SeoNarrative } from '@/components/home/SeoNarrative';

export const metadata: Metadata = {
  title: 'Invoice Templates for Freelancers, Agencies & Small Businesses',
  description:
    'Explore invoice template ideas for consultants, agencies, freelancers, and service businesses. Use SmartBill to reuse structures, keep branding consistent, and export clean PDFs.',
  alternates: {
    canonical: '/invoice-templates',
  },
  openGraph: {
    title: 'SmartBill Invoice Templates',
    description:
      'Explore reusable invoice template ideas for repeat billing, branding, and clean PDF exports.',
    url: 'https://smartbillpro.com/invoice-templates',
    images: ['/og?view=templates'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartBill Invoice Templates',
    description:
      'Explore reusable invoice template ideas for repeat billing, branding, and clean PDF exports.',
    images: ['/og?view=templates'],
  },
};

export default function InvoiceTemplatesLandingPage() {
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'SmartBill Invoice Templates',
    description:
      'Public landing page about invoice templates for freelancers, agencies, consultants, and small businesses.',
    url: 'https://smartbillpro.com/invoice-templates',
  };

  return (
    <>
      <Script id="smartbill-templates-collection-schema" type="application/ld+json">
        {JSON.stringify(collectionJsonLd)}
      </Script>
      <Header />
      <main className="pt-16">
        <section className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_55%,#f8fafc_100%)] py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-blue-700">
              <i className="fas fa-layer-group"></i>
              Public SEO landing page
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Invoice templates that help you bill faster and stay consistent.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              This page is the right place to target template-related search traffic. It explains how SmartBill templates help freelancers,
              agencies, consultants, and small businesses reuse invoice structures, keep branding consistent, and export professional PDFs.
            </p>
          </div>
        </section>
        <TemplatesGallery />
        <FAQ />
        <SeoNarrative />
      </main>
      <Footer />
    </>
  );
}
