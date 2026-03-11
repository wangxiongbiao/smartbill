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
import type { Language } from '@/types';

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
  const copyByLang: Record<Language, { name: string; description: string }> = {
    en: {
      name: 'SmartBill Invoice Templates',
      description: 'Public landing page about invoice templates for freelancers, agencies, consultants, and small businesses.',
    },
    'zh-CN': {
      name: 'SmartBill 发票模板',
      description: '面向自由职业者、代理商、顾问与小型企业的公开发票模板落地页。',
    },
    'zh-TW': {
      name: 'SmartBill 發票模板',
      description: '面向自由工作者、代理商、顧問與小型企業的公開發票模板落地頁。',
    },
    th: {
      name: 'เทมเพลตใบแจ้งหนี้ SmartBill',
      description: 'หน้าแลนดิ้งเพจสาธารณะเกี่ยวกับเทมเพลตใบแจ้งหนี้สำหรับฟรีแลนซ์ เอเจนซี ที่ปรึกษา และธุรกิจขนาดเล็ก',
    },
    id: {
      name: 'Template Invoice SmartBill',
      description: 'Landing page publik tentang template invoice untuk freelancer, agensi, konsultan, dan bisnis kecil.',
    },
  };
  const copy = copyByLang[lang];

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
