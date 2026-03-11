import type { Metadata } from 'next';
import Script from 'next/script';
import { Header } from '@/components/Header';
import { TemplatesGallery } from '@/components/home/TemplatesGallery';
import { FAQ } from '@/components/home/FAQ';
import { Footer } from '@/components/Footer';
import { SeoNarrative } from '@/components/home/SeoNarrative';
import { TemplatesLandingHero } from '@/components/home/TemplatesLandingHero';
import { MarketingAuthProvider } from '@/components/marketing/MarketingAuthProvider';
import { MarketingLanguageProvider } from '@/components/marketing/MarketingLanguageProvider';
import { buildAbsoluteLangUrl, getPublicPageMetadata, resolveLanguage } from '@/lib/marketing';

interface InvoiceTemplatesPageProps {
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: InvoiceTemplatesPageProps): Promise<Metadata> {
  const sp = (await searchParams) || {};
  return getPublicPageMetadata('templates', resolveLanguage(sp.lang));
}

export default async function InvoiceTemplatesLandingPage({ searchParams }: InvoiceTemplatesPageProps) {
  const sp = (await searchParams) || {};
  const lang = resolveLanguage(sp.lang);
  const copy = lang === 'zh-TW'
    ? {
        name: 'SmartBill 發票模板',
        description: '面向自由工作者、代理商、顧問與小型企業的公開發票模板落地頁。',
      }
    : {
        name: 'SmartBill Invoice Templates',
        description: 'Public landing page about invoice templates for freelancers, agencies, consultants, and small businesses.',
      };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    inLanguage: lang,
    name: copy.name,
    description: copy.description,
    url: buildAbsoluteLangUrl('/invoice-templates', lang),
  };

  return (
    <>
      <Script id="smartbill-templates-collection-schema" type="application/ld+json">
        {JSON.stringify(collectionJsonLd)}
      </Script>
      <MarketingAuthProvider>
        <MarketingLanguageProvider initialLang={lang}>
          <Header />
          <main className="bg-white pt-16">
            <TemplatesLandingHero />
            <TemplatesGallery />
            <FAQ />
            <SeoNarrative />
          </main>
          <Footer />
        </MarketingLanguageProvider>
      </MarketingAuthProvider>
    </>
  );
}
