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
import { MarketingAuthProvider } from '@/components/marketing/MarketingAuthProvider';
import { MarketingLanguageProvider } from '@/components/marketing/MarketingLanguageProvider';
import { buildAbsoluteLangUrl, getPublicPageMetadata, resolveLanguage } from '@/lib/marketing';

interface HomePageProps {
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const sp = (await searchParams) || {};
  return getPublicPageMetadata('home', resolveLanguage(sp.lang));
}

export default async function Home({ searchParams }: HomePageProps) {
  const sp = (await searchParams) || {};
  const lang = resolveLanguage(sp.lang);
  const copy = lang === 'zh-TW'
    ? {
        faq: [
          {
            question: 'SmartBill 能做什麼？',
            answer: 'SmartBill 是給自由工作者與小型企業使用的網頁版發票工具。你可以在同一套流程裡建立發票、重用模板、管理記錄並匯出 PDF。',
          },
          {
            question: '可以加入 logo 和收款資訊嗎？',
            answer: '可以。SmartBill 支援 logo、收款資訊區塊、備註，以及 QR 付款指示。',
          },
          {
            question: '我可以把舊發票存成模板嗎？',
            answer: '可以。SmartBill 支援模板流程，讓你把一份發票結構保存下來，之後快速建立下一張。',
          },
          {
            question: 'SmartBill 可以匯出發票 PDF 嗎？',
            answer: '可以。SmartBill 可將發票匯出為 PDF，方便傳送給客戶與留存。',
          },
        ],
        websiteName: 'SmartBill',
      }
    : {
        faq: [
          {
            question: 'What does SmartBill do?',
            answer: 'SmartBill is a web-based invoice generator for freelancers and small businesses. You can create invoices, reuse templates, manage billing records, and export PDFs from one workflow.',
          },
          {
            question: 'Can I add my logo and payment details?',
            answer: 'Yes. SmartBill supports logo placement, payment information blocks, notes, and QR-based payment instructions.',
          },
          {
            question: 'Can I reuse a previous invoice as a template?',
            answer: 'Yes. SmartBill includes template workflows so you can save an invoice setup and create the next one from the same structure.',
          },
          {
            question: 'Does SmartBill export invoice PDFs?',
            answer: 'Yes. SmartBill generates invoices that can be exported as PDF documents for client delivery and record keeping.',
          },
        ],
        websiteName: 'SmartBill',
      };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang,
    mainEntity: copy.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    inLanguage: lang,
    name: copy.websiteName,
    url: buildAbsoluteLangUrl('/', lang),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${buildAbsoluteLangUrl('/invoice-templates', lang)}${lang === 'zh-TW' ? '&' : '?'}query={search_term_string}`,
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
      <MarketingAuthProvider>
        <MarketingLanguageProvider initialLang={lang}>
          <Header />
          <main className="bg-white pt-16">
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
        </MarketingLanguageProvider>
      </MarketingAuthProvider>
    </>
  );
}
