
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
    westernMarket: string;
    westernTag: string;
    taiwanMarket: string;
    taiwanTag: string;
    southeastAsiaMarket: string;
    southeastAsiaTag: string;
    builtFor: string;
    collaboration: string;
    securityBadge: string;
    securityTitle: string;
    securityDescription: string;
    craftedFor: string;
    cta: string;
  }> = {
    en: {
      navTitle: 'SmartBill Pro / Global Vision',
      heroBadge: 'Regional Excellence',
      heroDescription: 'Deeply rooted in global markets, we provide billing solutions shaped around local business culture and regional expectations.',
      invoicesProcessed: 'Invoices Processed',
      countriesSupported: 'Countries Supported',
      westernMarket: 'Western Market',
      westernTag: 'Standardized & Professional',
      taiwanMarket: 'Taiwan Market',
      taiwanTag: 'Refined Local Integrity',
      southeastAsiaMarket: 'SE Asia Market',
      southeastAsiaTag: 'Fast Digital Agility',
      builtFor: 'Built for',
      collaboration: 'Collaboration',
      securityBadge: 'Global Encryption Standard',
      securityTitle: 'Intelligence Driven, Security Without Borders',
      securityDescription: 'Whether you work from a Taipei studio or a London office, SmartBill Pro delivers the same level of privacy protection and AI-powered billing support. Data security stays at the core of the promise.',
      craftedFor: 'Crafted for Modern Entrepreneurs',
      cta: 'Launch Your Professional Billing',
    },
    'zh-CN': {
      navTitle: 'SmartBill Pro / 全球视野',
      heroBadge: '区域专业能力',
      heroDescription: '我们深耕全球市场，通过理解本地商业文化，为不同地区的用户提供更贴合、更专业的开票解决方案。',
      invoicesProcessed: '已处理发票',
      countriesSupported: '支持国家',
      westernMarket: '欧美市场',
      westernTag: '标准化且专业',
      taiwanMarket: '台湾市场',
      taiwanTag: '细腻在地诚信',
      southeastAsiaMarket: '东南亚市场',
      southeastAsiaTag: '快速数字敏捷',
      builtFor: '专为',
      collaboration: '协作打造',
      securityBadge: '全球加密标准',
      securityTitle: '智能驱动，安全无界',
      securityDescription: '无论你身处台北工作室还是伦敦办公室，SmartBill Pro 都提供同等级的隐私保护与智能生成能力。数据安全始终是我们的核心承诺。',
      craftedFor: '为现代创业者打造',
      cta: '开启你的专业计费之旅',
    },
    'zh-TW': {
      navTitle: 'SmartBill Pro / 全球視野',
      heroBadge: '區域專業能力',
      heroDescription: '我們深耕全球市場，透過理解在地商業文化，為不同地區的用戶提供更貼合、更專業的開票解決方案。',
      invoicesProcessed: '已處理發票',
      countriesSupported: '支援國家',
      westernMarket: '歐美市場',
      westernTag: '標準化且專業',
      taiwanMarket: '台灣市場',
      taiwanTag: '細膩在地誠信',
      southeastAsiaMarket: '東南亞市場',
      southeastAsiaTag: '快速數位敏捷',
      builtFor: '專為',
      collaboration: '協作打造',
      securityBadge: '全球加密標準',
      securityTitle: '智慧驅動，安全無界',
      securityDescription: '不論你身處台北工作室還是倫敦辦公室，SmartBill Pro 都提供同等級的隱私保護與智能生成能力。資料安全始終是我們承諾的核心。',
      craftedFor: '為現代創業者打造',
      cta: '開啟您的專業計費之旅',
    },
    th: {
      navTitle: 'SmartBill Pro / มุมมองระดับโลก',
      heroBadge: 'ความเชี่ยวชาญระดับภูมิภาค',
      heroDescription: 'เราเข้าใจตลาดทั่วโลกอย่างลึกซึ้ง และออกแบบโซลูชันการออกบิลให้เหมาะกับวัฒนธรรมธุรกิจของแต่ละภูมิภาค',
      invoicesProcessed: 'จำนวนใบแจ้งหนี้ที่ประมวลผลแล้ว',
      countriesSupported: 'ประเทศที่รองรับ',
      westernMarket: 'ตลาดตะวันตก',
      westernTag: 'มาตรฐานและเป็นมืออาชีพ',
      taiwanMarket: 'ตลาดไต้หวัน',
      taiwanTag: 'ละเอียดอ่อนและซื่อสัตย์แบบท้องถิ่น',
      southeastAsiaMarket: 'ตลาดเอเชียตะวันออกเฉียงใต้',
      southeastAsiaTag: 'ดิจิทัลรวดเร็วและคล่องตัว',
      builtFor: 'สร้างมาเพื่อ',
      collaboration: 'ความร่วมมือ',
      securityBadge: 'มาตรฐานการเข้ารหัสระดับโลก',
      securityTitle: 'ขับเคลื่อนด้วยความชาญฉลาด ปลอดภัยไร้พรมแดน',
      securityDescription: 'ไม่ว่าคุณจะทำงานจากสตูดิโอในไทเปหรือออฟฟิศในลอนดอน SmartBill Pro มอบทั้งการปกป้องความเป็นส่วนตัวและความสามารถ AI ในระดับเดียวกัน ความปลอดภัยของข้อมูลคือหัวใจของคำมั่นสัญญาเรา',
      craftedFor: 'สร้างเพื่อผู้ประกอบการยุคใหม่',
      cta: 'เริ่มต้นเส้นทางการวางบิลแบบมืออาชีพ',
    },
    id: {
      navTitle: 'SmartBill Pro / Visi Global',
      heroBadge: 'Keunggulan Regional',
      heroDescription: 'Berakar kuat di pasar global, kami menghadirkan solusi penagihan yang dibentuk sesuai budaya bisnis lokal dan ekspektasi tiap wilayah.',
      invoicesProcessed: 'Invoice Diproses',
      countriesSupported: 'Negara Didukung',
      westernMarket: 'Pasar Barat',
      westernTag: 'TerstAndar & Profesional',
      taiwanMarket: 'Pasar Taiwan',
      taiwanTag: 'Integritas Lokal yang Rapi',
      southeastAsiaMarket: 'Asia Tenggara',
      southeastAsiaTag: 'Cepat dan Digital-First',
      builtFor: 'Dibangun untuk',
      collaboration: 'Kolaborasi',
      securityBadge: 'Standar Enkripsi Global',
      securityTitle: 'Didorong Kecerdasan, Aman Tanpa Batas',
      securityDescription: 'Baik Anda bekerja dari studio di Taipei maupun kantor di London, SmartBill Pro memberikan perlindungan privasi dan dukungan penagihan berbasis AI pada level yang sama. Keamanan data tetap menjadi inti janji kami.',
      craftedFor: 'Dibuat untuk Pengusaha Modern',
      cta: 'Mulai Penagihan Profesional Anda',
    },
  };
  const copy = copyByLang[lang];

  // 追踪每张图片的加载状态
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  const handleImageLoad = (idx: number) => {
    setLoadedImages(prev => ({ ...prev, [idx]: true }));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
    e.currentTarget.parentElement?.classList.add('bg-opacity-100');
  };

  const marketInsightsByLang: Record<Language, { title: string; focus: string; content: string; icon: string; gradient: string; image: string }[]> = {
    en: [
      {
        title: 'Western Markets',
        focus: 'Aesthetics & Global Standards',
        content: 'Optimized for Western freelancers with clean, bold styles that meet all professional expectations for VAT and tax compliance.',
        icon: 'fa-globe-americas',
        gradient: 'from-blue-600 to-indigo-700',
        image: '/images/western-market.png',
      },
      {
        title: 'Taiwan Market',
        focus: 'Integrity & Local Etiquette',
        content: 'Crafted for Taiwan SMEs. Supports precise Traditional Chinese typography with layouts that reflect local business etiquette.',
        icon: 'fa-landmark',
        gradient: 'from-emerald-600 to-teal-700',
        image: '/images/taiwan-market.png',
      },
      {
        title: 'Southeast Asia',
        focus: 'Agility & Digital-First',
        content: 'Powering digital transformation in SE Asia. Flexible currency support and mobile-first operations make your business seamless.',
        icon: 'fa-rocket',
        gradient: 'from-orange-500 to-red-600',
        image: '/images/southeast-asia-market.png',
      },
    ],
    'zh-CN': [
      {
        title: '欧美市场',
        focus: '专业美学与跨国标准',
        content: '针对欧美自由职业者优化，模板风格简约大气，完全符合欧美企业对 VAT 与税务规范的专业预期。',
        icon: 'fa-globe-americas',
        gradient: 'from-blue-600 to-indigo-700',
        image: '/images/western-market.png',
      },
      {
        title: '台湾市场',
        focus: '细腻诚信与在地礼仪',
        content: '专为台湾中小企业打造。支持精确的繁体中文排版，布局优雅，符合台湾商务往来的礼仪与细节。',
        icon: 'fa-landmark',
        gradient: 'from-emerald-600 to-teal-700',
        image: '/images/taiwan-market.png',
      },
      {
        title: '东南亚市场',
        focus: '敏捷发展与数字领先',
        content: '助力东南亚快速增长的数字化转型。提供灵活的货币支持与移动优先操作，让你的业务跨境更顺滑。',
        icon: 'fa-rocket',
        gradient: 'from-orange-500 to-red-600',
        image: '/images/southeast-asia-market.png',
      },
    ],
    'zh-TW': [
      {
        title: '歐美市場',
        focus: '專業美學與跨國標準',
        content: '針對歐美自由職業者優化，模版風格簡約大氣，完全符合歐美企業對 VAT 與稅務規範的專業預期。',
        icon: 'fa-globe-americas',
        gradient: 'from-blue-600 to-indigo-700',
        image: '/images/western-market.png',
      },
      {
        title: '台灣市場',
        focus: '細膩誠信與在地禮儀',
        content: '專為台灣中小企業打造。支持精確的繁體中文排版，佈局優雅，符合台灣商務往來的禮儀與細節。',
        icon: 'fa-landmark',
        gradient: 'from-emerald-600 to-teal-700',
        image: '/images/taiwan-market.png',
      },
      {
        title: '東南亞市場',
        focus: '敏捷發展與數位領先',
        content: '助力東南亞快速增長的數位轉型。提供靈活的貨幣支持與移動優先操作，讓您的業務跨境順滑。',
        icon: 'fa-rocket',
        gradient: 'from-orange-500 to-red-600',
        image: '/images/southeast-asia-market.png',
      },
    ],
    th: [
      {
        title: 'ตลาดตะวันตก',
        focus: 'สุนทรียะและมาตรฐานระดับสากล',
        content: 'ปรับให้เหมาะกับฟรีแลนซ์ในตลาดตะวันตก ด้วยสไตล์ที่สะอาด ชัดเจน และสอดคล้องกับความคาดหวังด้าน VAT และภาษี',
        icon: 'fa-globe-americas',
        gradient: 'from-blue-600 to-indigo-700',
        image: '/images/western-market.png',
      },
      {
        title: 'ตลาดไต้หวัน',
        focus: 'ความซื่อสัตย์และมารยาทท้องถิ่น',
        content: 'ออกแบบสำหรับ SME ในไต้หวัน รองรับการจัดพิมพ์ภาษาจีนตัวเต็มอย่างแม่นยำ และเลย์เอาต์ที่สะท้อนมารยาททางธุรกิจในท้องถิ่น',
        icon: 'fa-landmark',
        gradient: 'from-emerald-600 to-teal-700',
        image: '/images/taiwan-market.png',
      },
      {
        title: 'เอเชียตะวันออกเฉียงใต้',
        focus: 'คล่องตัวและดิจิทัลก่อน',
        content: 'ช่วยขับเคลื่อนการเปลี่ยนผ่านสู่ดิจิทัลในเอเชียตะวันออกเฉียงใต้ ด้วยการรองรับหลายสกุลเงินและการใช้งานบนมือถือเป็นหลัก',
        icon: 'fa-rocket',
        gradient: 'from-orange-500 to-red-600',
        image: '/images/southeast-asia-market.png',
      },
    ],
    id: [
      {
        title: 'Pasar Barat',
        focus: 'Estetika & Standar Global',
        content: 'Dioptimalkan untuk freelancer di pasar Barat dengan gaya yang bersih dan tegas, serta memenuhi ekspektasi profesional terkait VAT dan kepatuhan pajak.',
        icon: 'fa-globe-americas',
        gradient: 'from-blue-600 to-indigo-700',
        image: '/images/western-market.png',
      },
      {
        title: 'Pasar Taiwan',
        focus: 'Integritas & Etiket Lokal',
        content: 'Dibuat untuk UKM Taiwan. Mendukung tipografi Tradisional Tionghoa yang presisi dengan tata letak yang mencerminkan etiket bisnis lokal.',
        icon: 'fa-landmark',
        gradient: 'from-emerald-600 to-teal-700',
        image: '/images/taiwan-market.png',
      },
      {
        title: 'Asia Tenggara',
        focus: 'Lincah & Digital-First',
        content: 'Mendukung transformasi digital di Asia Tenggara. Dukungan mata uang yang fleksibel dan alur mobile-first membantu bisnis lintas negara berjalan lebih mulus.',
        icon: 'fa-rocket',
        gradient: 'from-orange-500 to-red-600',
        image: '/images/southeast-asia-market.png',
      },
    ],
  };
  const marketInsights = marketInsightsByLang[lang];

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
        <span className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">{copy.navTitle}</span>
        <div className="w-10"></div>
      </nav>

      {/* Hero 視覺區 */}
      <section className="relative py-16 sm:py-24 px-6 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 skew-x-[-15deg] translate-x-1/4 -z-10"></div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {copy.heroBadge}
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.85] tracking-tighter uppercase">
              SmartBill <br /><span className="text-blue-600">Pro</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
              {copy.heroDescription}
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-8">
              <div className="flex flex-col">
                <span className="text-4xl font-black text-slate-900">1.2M+</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{copy.invoicesProcessed}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black text-slate-900">150+</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{copy.countriesSupported}</span>
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
                alt={copy.westernMarket}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{copy.westernMarket}</p>
                <h4 className="text-xl font-bold">{copy.westernTag}</h4>
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
                  alt={copy.taiwanMarket}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{copy.taiwanMarket}</p>
                  <h4 className="text-base font-bold">{copy.taiwanTag}</h4>
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
                  alt={copy.southeastAsiaMarket}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{copy.southeastAsiaMarket}</p>
                  <h4 className="text-base font-bold">{copy.southeastAsiaTag}</h4>
                </div>
              </div>
            </div>

            {/* 裝飾背書標籤 */}
            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 hidden md:flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <i className="fas fa-users-cog"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{copy.builtFor}</span>
                <span className="text-xs font-bold text-slate-900">{copy.collaboration}</span>
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
            <i className="fas fa-microchip"></i> {copy.securityBadge}
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none">
            {copy.securityTitle}
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            {copy.securityDescription}
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
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-10">{copy.craftedFor}</h3>
        <button
          onClick={onCreateInvoice}
          className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest text-sm"
        >
          {copy.cta}
        </button>
      </footer>
    </div>
  );
};

export default AboutView;
