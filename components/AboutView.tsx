'use client';
import React, { useState } from 'react';
import { Language } from '../types';

interface AboutViewProps {
  lang: Language;
  onBack: () => void;
  onCreateInvoice: () => void;
}

const AboutView: React.FC<AboutViewProps> = ({ lang, onBack, onCreateInvoice }) => {
  const copyByLang: Record<Language, {
    navTitle: string;
    heroBadge: string;
    heroDescription: string;
    invoicesProcessed: string;
    countriesSupported: string;
    builtFor: string;
    collaboration: string;
    securityBadge: string;
    securityTitle: string;
    securityDescription: string;
    craftedFor: string;
    cta: string;
  }> = {
    en: {
      navTitle: 'SmartBill / Global Vision',
      heroBadge: 'Regional Excellence',
      heroDescription: 'Deeply rooted in global markets, we provide billing solutions shaped around local business culture and regional expectations.',
      invoicesProcessed: 'Invoices Processed',
      countriesSupported: 'Countries Supported',
      builtFor: 'Built for',
      collaboration: 'Collaboration',
      securityBadge: 'Global Encryption Standard',
      securityTitle: 'Intelligence Driven, Security Without Borders',
      securityDescription: 'Whether you work from a Taipei studio or a London office, SmartBill delivers the same level of privacy protection and AI-powered billing support.',
      craftedFor: 'Crafted for Modern Entrepreneurs',
      cta: 'Launch Your Professional Billing',
    },
    'zh-TW': {
      navTitle: 'SmartBill / 全球視野',
      heroBadge: '區域專業能力',
      heroDescription: '我們深耕全球市場，透過理解在地商業文化，為不同地區的用戶提供更貼合、更專業的開票解決方案。',
      invoicesProcessed: '已處理發票',
      countriesSupported: '支援國家',
      builtFor: '專為',
      collaboration: '協作打造',
      securityBadge: '全球加密標準',
      securityTitle: '智慧驅動，安全無界',
      securityDescription: '不論你身處台北工作室還是倫敦辦公室，SmartBill 都提供同等級的隱私保護與智能生成能力。',
      craftedFor: '為現代創業者打造',
      cta: '開啟您的專業計費之旅',
    },
  };
  const copy = copyByLang[lang];

  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const handleImageLoad = (idx: number) => setLoadedImages(prev => ({ ...prev, [idx]: true }));
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
    e.currentTarget.parentElement?.classList.add('bg-opacity-100');
  };

  const marketInsightsByLang: Record<Language, { title: string; focus: string; content: string; icon: string; gradient: string; image: string }[]> = {
    en: [
      { title: 'Western Markets', focus: 'Aesthetics & Global Standards', content: 'Optimized for Western freelancers with clean, bold styles that meet all professional expectations for VAT and tax compliance.', icon: 'fa-globe-americas', gradient: 'from-blue-600 to-indigo-700', image: '/images/western-market.png' },
      { title: 'Taiwan Market', focus: 'Integrity & Local Etiquette', content: 'Crafted for Taiwan SMEs. Supports precise Traditional Chinese typography with layouts that reflect local business etiquette.', icon: 'fa-landmark', gradient: 'from-emerald-600 to-teal-700', image: '/images/taiwan-market.png' },
      { title: 'Southeast Asia', focus: 'Agility & Digital-First', content: 'Powering digital transformation in SE Asia. Flexible currency support and mobile-first operations make your business seamless.', icon: 'fa-rocket', gradient: 'from-orange-500 to-red-600', image: '/images/southeast-asia-market.png' },
    ],
    'zh-TW': [
      { title: '歐美市場', focus: '專業美學與跨國標準', content: '針對歐美自由工作者優化，模板風格簡約大氣，完全符合歐美企業對 VAT 與稅務規範的專業預期。', icon: 'fa-globe-americas', gradient: 'from-blue-600 to-indigo-700', image: '/images/western-market.png' },
      { title: '台灣市場', focus: '細膩誠信與在地禮儀', content: '專為台灣中小企業打造。支援精確的繁體中文排版，佈局優雅，符合台灣商務往來的禮儀與細節。', icon: 'fa-landmark', gradient: 'from-emerald-600 to-teal-700', image: '/images/taiwan-market.png' },
      { title: '東南亞市場', focus: '敏捷發展與數位領先', content: '助力東南亞快速增長的數位轉型。提供靈活的貨幣支援與移動優先操作，讓您的業務跨境順滑。', icon: 'fa-rocket', gradient: 'from-orange-500 to-red-600', image: '/images/southeast-asia-market.png' },
    ],
  };
  const marketInsights = marketInsightsByLang[lang];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between no-print shadow-sm">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-90"><i className="fas fa-arrow-left"></i></button>
        <span className="text-xs font-semibold text-slate-900 uppercase tracking-[0.3em]">{copy.navTitle}</span>
        <div className="w-10"></div>
      </nav>

      <section className="relative py-16 sm:py-24 px-6 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 skew-x-[-15deg] translate-x-1/4 -z-10"></div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-semibold uppercase tracking-widest shadow-xl shadow-blue-200"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>{copy.heroBadge}</div>
            <h1 className="text-5xl md:text-8xl font-semibold text-slate-900 leading-[0.85] tracking-tighter uppercase">SmartBill</h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">{copy.heroDescription}</p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-8"><div className="flex flex-col"><span className="text-4xl font-semibold text-slate-900">1.2M+</span><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{copy.invoicesProcessed}</span></div><div className="flex flex-col"><span className="text-4xl font-semibold text-slate-900">150+</span><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{copy.countriesSupported}</span></div></div>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            <div className="h-64 sm:h-[480px] rounded-[2.5rem] overflow-hidden shadow-2xl relative group sm:col-span-1 bg-slate-100">
              {!loadedImages[0] && <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>}
              <img src={marketInsights[0].image} onLoad={() => handleImageLoad(0)} onError={handleImageError} className={`w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 ${loadedImages[0] ? 'opacity-100' : 'opacity-0'}`} alt={marketInsights[0].title} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white"><p className="text-[10px] font-semibold uppercase tracking-widest opacity-70 mb-1">{marketInsights[0].title}</p><h4 className="text-xl font-semibold">{marketInsights[0].focus}</h4></div>
            </div>
            <div className="grid grid-rows-2 gap-4 h-64 sm:h-[480px]">
              {[marketInsights[1], marketInsights[2]].map((market, idx) => (
                <div key={market.title} className="rounded-[2.2rem] overflow-hidden shadow-xl relative group bg-slate-100">
                  {!loadedImages[idx + 1] && <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>}
                  <img src={market.image} onLoad={() => handleImageLoad(idx + 1)} onError={handleImageError} className={`w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 ${loadedImages[idx + 1] ? 'opacity-100' : 'opacity-0'}`} alt={market.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white"><p className="text-[10px] font-semibold uppercase tracking-widest opacity-70 mb-1">{market.title}</p><h4 className="text-base font-semibold">{market.focus}</h4></div>
                </div>
              ))}
            </div>
            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 hidden md:flex items-center gap-3"><div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100"><i className="fas fa-users-cog"></i></div><div className="flex flex-col"><span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{copy.builtFor}</span><span className="text-xs font-semibold text-slate-900">{copy.collaboration}</span></div></div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {marketInsights.map((market, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${market.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <div className={`w-14 h-14 bg-gradient-to-br ${market.gradient} rounded-2xl flex items-center justify-center text-white text-2xl mb-8 shadow-lg`}><i className={`fas ${market.icon}`}></i></div>
              <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-[0.2em] mb-3">{market.focus}</h3>
              <h4 className="text-2xl font-semibold text-slate-900 mb-6">{market.title}</h4>
              <p className="text-slate-500 leading-relaxed font-medium">{market.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full text-blue-400 text-xs font-semibold uppercase tracking-widest backdrop-blur-md"><i className="fas fa-microchip"></i> {copy.securityBadge}</div>
          <h2 className="text-3xl md:text-5xl font-semibold uppercase tracking-tight leading-none">{copy.securityTitle}</h2>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">{copy.securityDescription}</p>
        </div>
      </section>

      <footer className="py-20 px-6 text-center bg-white border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-[0.4em] mb-10">{copy.craftedFor}</h3>
        <button onClick={onCreateInvoice} className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-semibold shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest text-sm">{copy.cta}</button>
      </footer>
    </div>
  );
};

export default AboutView;
