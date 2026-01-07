
'use client';
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface AboutViewProps {
  lang: Language;
  onBack: () => void;
}

const AboutView: React.FC<AboutViewProps> = ({ lang, onBack }) => {
  const t = translations[lang] || translations['en'];

  // 追踪每张图片的加载状态
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  const handleImageLoad = (idx: number) => {
    setLoadedImages(prev => ({ ...prev, [idx]: true }));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
    e.currentTarget.parentElement?.classList.add('bg-opacity-100');
  };

  const marketInsights = [
    {
      title: lang === 'zh-TW' ? '歐美市場' : 'Western Markets',
      focus: lang === 'zh-TW' ? '專業美學與跨國標準' : 'Aesthetics & Global Standards',
      content: lang === 'zh-TW' 
        ? '針對歐美自由職業者優化，模版風格簡約大氣，完全符合歐美企業對 VAT 與稅務規範的專業預期。' 
        : 'Optimized for Western freelancers with clean, bold styles that meet all professional expectations for VAT and tax compliance.',
      icon: 'fa-globe-americas',
      gradient: 'from-blue-600 to-indigo-700',
      // 更新为极其稳定的欧美商务协作大图
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80'
    },
    {
      title: lang === 'zh-TW' ? '台灣市場' : 'Taiwan Market',
      focus: lang === 'zh-TW' ? '細膩誠信與在地禮儀' : 'Integrity & Local Etiquette',
      content: lang === 'zh-TW' 
        ? '專為台灣中小企業打造。支持精確的繁體中文排版，佈局優雅，符合台灣商務往來的禮儀與細節。' 
        : 'Crafted for Taiwan SMEs. Supports precise Traditional Chinese typography with layouts that reflect local business etiquette.',
      icon: 'fa-landmark',
      gradient: 'from-emerald-600 to-teal-700',
      // 保持不变：台湾/亚洲商务结算
      image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1000&q=80'
    },
    {
      title: lang === 'zh-TW' ? '東南亞市場' : 'Southeast Asia',
      focus: lang === 'zh-TW' ? '敏捷發展與數位領先' : 'Agility & Digital-First',
      content: lang === 'zh-TW' 
        ? '助力東南亞快速增長的數位轉型。提供靈活的貨幣支持與移動優先操作，讓您的業務跨境順滑。' 
        : 'Powering digital transformation in SE Asia. Flexible currency support and mobile-first operations make your business seamless.',
      icon: 'fa-rocket',
      gradient: 'from-orange-500 to-red-600',
      // 保持不变：数字化办公协作
      image: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&w=1000&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 頂部導航 */}
      <nav className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between no-print shadow-sm">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-90"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <span className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">SmartBill Pro / Global Vision</span>
        <div className="w-10"></div>
      </nav>

      {/* Hero 視覺區 */}
      <section className="relative py-16 sm:py-24 px-6 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 skew-x-[-15deg] translate-x-1/4 -z-10"></div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Regional Excellence
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.85] tracking-tighter uppercase">
              SmartBill <br /><span className="text-blue-600">Pro</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
              {lang === 'zh-TW' 
                ? '我們深耕全球市場，通過對在地商業文化的理解，為不同區域的用戶提供最契合、最專業的計費解決方案。' 
                : 'Deeply rooted in global markets, we provide the most professional billing solutions tailored to local business cultures across regions.'}
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-8">
               <div className="flex flex-col">
                 <span className="text-4xl font-black text-slate-900">1.2M+</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoices Processed</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-4xl font-black text-slate-900">150+</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Countries Supported</span>
               </div>
            </div>
          </div>

          {/* 三格拼貼展示區：客戶場景照片佈局 */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
             {/* 歐美場景 - 大圖 (两人协作，重新生成的稳定链接) */}
             <div className="h-64 sm:h-[480px] rounded-[2.5rem] overflow-hidden shadow-2xl relative group sm:col-span-1 bg-slate-100">
                {!loadedImages[0] && <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>}
                <img 
                  src={marketInsights[0].image} 
                  onLoad={() => handleImageLoad(0)}
                  onError={handleImageError}
                  className={`w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 ${loadedImages[0] ? 'opacity-100' : 'opacity-0'}`} 
                  alt="Western Customer Collaboration" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Western Market</p>
                   <h4 className="text-xl font-bold">Standardized & Professional</h4>
                </div>
             </div>

             {/* 台灣與東南亞場景 - 小圖列 (保持不变) */}
             <div className="grid grid-rows-2 gap-4 h-64 sm:h-[480px]">
                {/* 台灣場景 */}
                <div className="rounded-[2.2rem] overflow-hidden shadow-xl relative group bg-emerald-50">
                  {!loadedImages[1] && <div className="absolute inset-0 bg-emerald-100 animate-pulse"></div>}
                  <img 
                    src={marketInsights[1].image} 
                    onLoad={() => handleImageLoad(1)}
                    onError={handleImageError}
                    className={`w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 ${loadedImages[1] ? 'opacity-100' : 'opacity-0'}`} 
                    alt="Business collaboration in Taiwan" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Taiwan Market</p>
                    <h4 className="text-base font-bold">Refined Local Integrity</h4>
                  </div>
                </div>

                {/* 東南亞場景 */}
                <div className="rounded-[2.2rem] overflow-hidden shadow-xl relative group bg-orange-50">
                  {!loadedImages[2] && <div className="absolute inset-0 bg-orange-100 animate-pulse"></div>}
                  <img 
                    src={marketInsights[2].image} 
                    onLoad={() => handleImageLoad(2)}
                    onError={handleImageError}
                    className={`w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 ${loadedImages[2] ? 'opacity-100' : 'opacity-0'}`} 
                    alt="Digital billing in SE Asia" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">SE Asia Market</p>
                    <h4 className="text-base font-bold">Fast Digital Agility</h4>
                  </div>
                </div>
             </div>
             
             {/* 裝飾背書標籤 */}
             <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 hidden md:flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                 <i className="fas fa-users-cog"></i>
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Built for</span>
                 <span className="text-xs font-bold text-slate-900">Collaboration</span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 區域市場深度內容 */}
      <section className="py-24 px-6 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {marketInsights.map((market, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${market.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <div className={`w-14 h-14 bg-gradient-to-br ${market.gradient} rounded-2xl flex items-center justify-center text-white text-2xl mb-8 shadow-lg`}>
                <i className={`fas ${market.icon}`}></i>
              </div>
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-3">{market.focus}</h3>
              <h4 className="text-2xl font-black text-slate-900 mb-6">{market.title}</h4>
              <p className="text-slate-500 leading-relaxed font-medium">
                {market.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 技術與安全背書 */}
      <section className="py-24 px-6 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest backdrop-blur-md">
            <i className="fas fa-microchip"></i> Global Encryption Standard
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none">
            {lang === 'zh-TW' ? '智慧驅動，安全無界' : 'Intelligence Driven, Security Without Borders'}
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            {lang === 'zh-TW' 
              ? '不論您是在台北的工作室，還是倫敦的辦公樓，SmartBill Pro 都為您提供同樣高等級的隱私保護與智能生成技術。數據安全是我們承諾的核心價值。' 
              : 'Whether in a Taipei studio or a London office, SmartBill Pro provides the same high-level privacy and AI technology. Data security is the core value of our promise.'}
          </p>
          <div className="flex flex-wrap justify-center gap-12 pt-8 opacity-30">
             <i className="fab fa-apple text-5xl hover:opacity-100 transition-opacity cursor-pointer"></i>
             <i className="fab fa-google text-5xl hover:opacity-100 transition-opacity cursor-pointer"></i>
             <i className="fab fa-stripe text-5xl hover:opacity-100 transition-opacity cursor-pointer"></i>
             <i className="fab fa-paypal text-5xl hover:opacity-100 transition-opacity cursor-pointer"></i>
          </div>
        </div>
      </section>

      {/* 底部行動引導 */}
      <footer className="py-20 px-6 text-center bg-white border-t border-slate-100">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Crafted for Modern Entrepreneurs</h3>
        <button 
          onClick={onBack}
          className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest text-sm"
        >
          {lang === 'zh-TW' ? '開啟您的專業計費之旅' : 'Launch Your Professional Billing'}
        </button>
      </footer>
    </div>
  );
};

export default AboutView;
