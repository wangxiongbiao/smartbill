import type { Metadata } from 'next';
import Script from 'next/script';
import { Header } from '@/components/Header';
import { Hero } from '@/components/home/Hero';
import { SocialProof } from '@/components/home/SocialProof';
import { Features } from '@/components/home/Features';
import { TemplatesGallery } from '@/components/home/TemplatesGallery';
import { TargetAudience } from '@/components/home/TargetAudience';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { FAQ } from '@/components/home/FAQ';
import { Footer } from '@/components/Footer';
import { SeoNarrative } from '@/components/home/SeoNarrative';

export const metadata: Metadata = {
  title: 'Invoice Generator for Freelancers & Small Businesses',
  description:
    'Create invoices with your logo, payment details, reusable templates, and PDF export. SmartBill is built for freelancers, contractors, agencies, and small teams.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SmartBill Invoice Generator for Freelancers & Small Businesses',
    description:
      'Create branded invoices, reuse templates, manage records, and export PDFs with SmartBill.',
    url: 'https://smartbillpro.com',
    images: ['/og?view=home'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartBill Invoice Generator for Freelancers & Small Businesses',
    description:
      'Create branded invoices, reuse templates, manage records, and export PDFs with SmartBill.',
    images: ['/og?view=home'],
  },
};

export default function Home() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does SmartBill do?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SmartBill is a web-based invoice generator for freelancers and small businesses. You can create invoices, reuse templates, manage billing records, and export PDFs from one workflow.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I add my logo and payment details?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. SmartBill supports logo placement, payment information blocks, notes, and QR-based payment instructions.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I reuse a previous invoice as a template?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. SmartBill includes template workflows so you can save an invoice setup and create the next one from the same structure.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does SmartBill export invoice PDFs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. SmartBill generates invoices that can be exported as PDF documents for client delivery and record keeping.',
        },
      },
    ],
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SmartBill',
    url: 'https://smartbillpro.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://smartbillpro.com/invoice-templates?query={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <Script id="smartbill-home-faq-schema" type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <Script id="smartbill-website-schema" type="application/ld+json">
        {JSON.stringify(websiteJsonLd)}
      </Script>
      <Header />
      <main className="pt-16">
        <Hero />
        <SocialProof />
        <Features />
        <TemplatesGallery />
        <TargetAudience />
        <FeaturesGrid />
        <FAQ />
        <SeoNarrative />
      </main>
      <Footer />
    </>
  );
}
