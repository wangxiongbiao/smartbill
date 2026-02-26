import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Spline_Sans } from 'next/font/google';
import './globals.css';

const splineSans = Spline_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-spline',
});

const siteTitle = 'Help Wordle - Free AI Solver & Best Starting Words | Today\'s Hints';
const siteDescription =
  'Need help with Wordle? Our free AI solver filters answers instantly based on your color feedback. Get smart starting words, strategic hints, and win every game—works for classic and hard mode!';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.helpwordle.org';

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  keywords: [
    // 核心品牌词
    'help wordle',
    'wordle helper',
    // 主要功能词
    'wordle solver',
    'wordle hints',
    'wordle answer finder',
    // 长尾高价值词
    'best wordle starting word',
    'wordle hard mode helper',
    'how to win wordle',
    'how to solve wordle',
    // 功能特性词
    'wordle strategy',
    'wordle tips',
    'wordle letter frequency',
    'daily wordle help',
    'free wordle solver',
    'AI wordle solver',
  ],
  metadataBase: new URL(siteUrl),
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: 'Help Wordle',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Help Wordle Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/', // 使用相对路径，结合 metadataBase 自动生成完整 URL
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Help Wordle - Free AI Solver',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    description: siteDescription,
    url: siteUrl,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'AI-powered Wordle solver with instant answer filtering',
      'Smart color feedback system for precise results',
      'Best starting word recommendations',
      'Letter frequency analysis and insights',
      'Strategic next-move hints',
      'Full support for classic and hard mode',
      '100% free to use',
    ],
    keywords: metadata.keywords,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the Wordle helper work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Enter your guess and click on each letter to set its color (green for correct position, yellow for wrong position, gray for not in word). Our AI instantly filters all possible answers based on your feedback and suggests the best next words.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best starting word for Wordle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Words like CRANE, SLATE, TRACE, and ADIEU are excellent starting words as they contain common letters (vowels and frequent consonants). Our helper suggests the statistically best options based on letter frequency analysis.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this Wordle helper work for hard mode?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Our helper fully supports Wordle hard mode. When you switch to hard mode, all suggestions automatically follow the hard mode rules - using confirmed letters in their correct positions and including all present letters.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this Wordle helper free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Help Wordle is completely free to use with no limitations. You can solve unlimited Wordle puzzles without any registration or payment required.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I use the color feedback system?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'After typing your word, click on each tile to cycle through colors: Gray (letter not in word), Yellow (letter in word but wrong position), Green (letter in correct position). The helper will instantly update suggestions based on your feedback.',
        },
      },
    ],
  };

  return (
    <html lang="en" className={splineSans.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* Preconnect to external origins */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Material Symbols - keeping as external since it's a specialized font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="bg-slate-50 font-[var(--font-spline)] text-slate-900 min-h-screen flex flex-col overflow-x-hidden selection:bg-primary selection:text-white">
        {children}
        {/* Google Analytics - deferred loading */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DYE4KPE05K"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DYE4KPE05K');
          `}
        </Script>
      </body>
    </html>
  );
}
