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
import type { Language } from '@/types';

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
  const copyByLang: Record<Language, { faq: { question: string; answer: string }[]; websiteName: string }> = {
    en: {
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
    },
    'zh-CN': {
      faq: [
        {
          question: 'SmartBill 能做什么？',
          answer: 'SmartBill 是给自由职业者与小型企业使用的网页版发票工具。你可以在同一套流程里创建发票、复用模板、管理记录并导出 PDF。',
        },
        {
          question: '可以加入 logo 和收款信息吗？',
          answer: '可以。SmartBill 支持 logo、收款信息区块、备注，以及 QR 付款指引。',
        },
        {
          question: '我可以把旧发票存成模板吗？',
          answer: '可以。SmartBill 支持模板流程，让你把一份发票结构保存下来，之后快速创建下一张。',
        },
        {
          question: 'SmartBill 可以导出发票 PDF 吗？',
          answer: '可以。SmartBill 可将发票导出为 PDF，方便发送给客户与留档。',
        },
      ],
      websiteName: 'SmartBill',
    },
    'zh-TW': {
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
    },
    th: {
      faq: [
        {
          question: 'SmartBill ทำอะไรได้บ้าง?',
          answer: 'SmartBill เป็นเครื่องมือสร้างใบแจ้งหนี้บนเว็บสำหรับฟรีแลนซ์และธุรกิจขนาดเล็ก คุณสามารถสร้างใบแจ้งหนี้ ใช้เทมเพลตซ้ำ จัดการบันทึก และส่งออก PDF ได้ในเวิร์กโฟลว์เดียว',
        },
        {
          question: 'ฉันสามารถเพิ่มโลโก้และข้อมูลการชำระเงินได้หรือไม่?',
          answer: 'ได้ SmartBill รองรับการใส่โลโก้ บล็อกข้อมูลการชำระเงิน หมายเหตุ และคำแนะนำการชำระเงินผ่าน QR',
        },
        {
          question: 'ฉันสามารถนำใบแจ้งหนี้เดิมมาใช้เป็นเทมเพลตได้หรือไม่?',
          answer: 'ได้ SmartBill มีเวิร์กโฟลว์เทมเพลตให้คุณบันทึกโครงสร้างใบแจ้งหนี้ไว้ แล้วสร้างใบถัดไปจากรูปแบบเดิมได้อย่างรวดเร็ว',
        },
        {
          question: 'SmartBill ส่งออกใบแจ้งหนี้เป็น PDF ได้หรือไม่?',
          answer: 'ได้ SmartBill สร้างใบแจ้งหนี้ที่สามารถส่งออกเป็น PDF เพื่อส่งให้ลูกค้าและเก็บบันทึกได้',
        },
      ],
      websiteName: 'SmartBill',
    },
    id: {
      faq: [
        {
          question: 'Apa yang dilakukan SmartBill?',
          answer: 'SmartBill adalah pembuat invoice berbasis web untuk freelancer dan bisnis kecil. Anda dapat membuat invoice, menggunakan ulang template, mengelola catatan penagihan, dan mengekspor PDF dalam satu alur kerja.',
        },
        {
          question: 'Bisakah saya menambahkan logo dan detail pembayaran?',
          answer: 'Bisa. SmartBill mendukung logo, blok informasi pembayaran, catatan, dan instruksi pembayaran berbasis QR.',
        },
        {
          question: 'Bisakah saya memakai invoice lama sebagai template?',
          answer: 'Bisa. SmartBill memiliki alur template sehingga Anda dapat menyimpan satu susunan invoice dan membuat invoice berikutnya dari struktur yang sama.',
        },
        {
          question: 'Apakah SmartBill bisa mengekspor invoice PDF?',
          answer: 'Bisa. SmartBill menghasilkan invoice yang dapat diekspor sebagai dokumen PDF untuk dikirim ke klien dan disimpan sebagai arsip.',
        },
      ],
      websiteName: 'SmartBill',
    },
  };
  const copy = copyByLang[lang];

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
      target: `${buildAbsoluteLangUrl('/invoice-templates', lang)}${buildAbsoluteLangUrl('/invoice-templates', lang).includes('?') ? '&' : '?'}query={search_term_string}`,
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
