
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Invoice, IndustryTemplate, Language } from '../types';
import { translations } from '../i18n';

interface HomeViewProps {
  onSelectTemplate: (data: Partial<Invoice>) => void;
  onCreateEmpty: () => void;
  lang: Language;
}

const INDUSTRY_CONFIG = [
  {
    id: 'freelance',
    color: 'bg-emerald-500',
    icon: 'fa-user-ninja',
    imageIds: [
      '/images/freelance-typing.png', // Laptop on desk (WAS INVALID #1)
      '1498050108023-c5249f4df085', // Code on screen
      '1519389950473-47ba0277781c', // Team working
      '/images/freelance-code.png',  // Desk setup (WAS INVALID #4)
      '1484867114623-ff5ef4c21801', // Typing
      '1497030767101-fa0972d21231'  // Office
    ]
  },
  {
    id: 'construction',
    color: 'bg-orange-500',
    icon: 'fa-hard-hat',
    imageIds: [
      '1503387762-592deb58ef4e', // Modern architecture
      '/images/construction-engineering.png', // Construction site (WAS INVALID #2)
      '/images/construction-blueprints.png', // Blueprints (LOCAL)
      '/images/construction-tools.png', // Tools (LOCAL)
      '1581094771181-437754374a81', // Engineering
      '1523413551-7890664e585f'  // Building materials
    ]
  },
  {
    id: 'retail',
    color: 'bg-pink-500',
    icon: 'fa-shopping-bag',
    imageIds: [
      '1441986300917-64674bd600d8', // Store interior
      '/images/retail-checkout.png', // Shop shelf (WAS INVALID #2)
      '1556742044-3c52d6e88c62', // Checkout
      '1556740738-b6a63e27c4df', // Shopping bags
      '1567401893414-76b7b1e5a7a5', // Clothing rack
      '1441986233159-45d45ca44571'  // Retail display
    ]
  },
  {
    id: 'consulting',
    color: 'bg-blue-500',
    icon: 'fa-briefcase',
    imageIds: [
      '1552664730-d307ca884978', // Business meeting
      '/images/consulting-collaboration.png', // Office people (WAS INVALID #2)
      '1521737604893-d14cc237f11d', // Collaboration
      '/images/consulting-data-charts.png', // Workshop (WAS INVALID #4)
      '1542744094-246d7ac42a7a', // Data charts
      '1600881333744-4405814239b0'  // Professional portrait
    ]
  },
  {
    id: 'design',
    color: 'bg-purple-500',
    icon: 'fa-paint-brush',
    imageIds: [
      '/images/design-workspace.png', // Designer workspace (LOCAL #1)
      '/images/design-graphic.png', // Graphic design (LOCAL #2)
      '1550684848-fac1c5b4e853', // Color palettes
      '/images/design-tablet.png', // Drawing tablet (LOCAL #4)
      '1618005182381-e23e03f191b4', // Abstract art
      '1581299894628-3ad044748d1c'  // UI/UX design
    ]
  },
];

const TemplateImage: React.FC<{
  src: string;
  alt: string;
  icon: string;
  color: string;
}> = ({ src, alt, icon, color }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // 檢查是否已經加載（針對緩存）
    if (imgRef.current && imgRef.current.complete) {
      setStatus('loaded');
    }
  }, []);

  return (
    <div className="absolute inset-0 bg-slate-100 overflow-hidden">
      {/* 骨架屏：在加載或錯誤時顯示 */}
      {(status === 'loading' || status === 'error') && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${status === 'error' ? 'bg-slate-200' : 'animate-pulse bg-slate-100'}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color} text-white text-2xl mb-4 shadow-lg opacity-30`}>
            <i className={`fas ${icon}`}></i>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
            {status === 'error' ? 'Image Lost' : 'Loading...'}
          </span>
        </div>
      )}

      {/* 實際圖片：移除所有遮罩和濾鏡 */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={`w-full h-full object-cover transition-opacity duration-700 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
      />
    </div>
  );
};

const HomeView: React.FC<HomeViewProps> = ({ onSelectTemplate, onCreateEmpty, lang }) => {
  const t = translations[lang] || translations['en'];

  const industries = useMemo(() => {
    const labels = {
      freelance: t.ind_freelance,
      construction: t.ind_construction,
      retail: t.ind_retail,
      consulting: t.ind_consulting,
      design: t.ind_design,
    };

    return INDUSTRY_CONFIG.map(config => ({
      ...config,
      name: labels[config.id as keyof typeof labels] || config.id,
      templates: Array.from({ length: 6 }).map((_, i) => {
        const imageId = config.imageIds[i];
        // Check if it's a local path or Unsplash ID
        const backgroundImage = imageId.startsWith('/')
          ? imageId  // Use local path directly
          : `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=800&q=80`;

        return {
          id: `${config.id}-${i}`,
          category: labels[config.id as keyof typeof labels] || config.id,
          title: `${labels[config.id as keyof typeof labels] || config.id} #${i + 1}`,
          previewColor: config.color,
          backgroundImage,
          defaultData: {
            items: [{ id: `tpl-${config.id}-${i}`, description: `${labels[config.id as keyof typeof labels]} Service Package`, quantity: 1, rate: (450 + (i * 120)) }]
          }
        };
      })
    }));
  }, [t]);

  return (
    <div className="max-w-7xl mx-auto py-12 space-y-16 overflow-hidden">
      <section className="text-center space-y-8 py-16 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
          Professional Invoice Generator
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
          {t.heroTitle.split(' ')[0]} <span className="text-blue-600">{t.heroTitle.split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-xl font-medium px-4 leading-relaxed">{t.heroSub}</p>
        <div className="flex justify-center pt-8">
          <button
            onClick={onCreateEmpty}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-blue-100 flex items-center gap-3 transition-all active:scale-95 text-lg group"
          >
            <i className="fas fa-plus-circle group-hover:rotate-90 transition-transform"></i> {t.createEmpty}
          </button>
        </div>
      </section>

      {industries.map((industry) => (
        <section key={industry.id} className="space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className={`${industry.color} w-11 h-11 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl`}>
              <i className={`fas ${industry.icon} text-lg`}></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{industry.name}</h2>
          </div>

          <div className="flex overflow-x-auto gap-8 pb-10 scrollbar-hide snap-x">
            {industry.templates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl.defaultData)}
                className="flex-shrink-0 w-72 h-[420px] bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all cursor-pointer group relative overflow-hidden snap-start"
              >
                {/* 圖片區域：佔比提高，移除所有漸變 */}
                <div className={`h-[60%] w-full relative`}>
                  <TemplateImage
                    src={tpl.backgroundImage}
                    alt={tpl.title}
                    icon={industry.icon}
                    color={industry.color}
                  />
                </div>

                {/* 內容區域 */}
                <div className="p-8 flex flex-col justify-between h-[40%] bg-white relative z-10 border-t border-slate-50">
                  <div>
                    <span className={`text-[10px] font-black ${industry.color.replace('bg-', 'text-')} uppercase tracking-widest mb-2 block`}>{industry.name}</span>
                    <h3 className="font-black text-slate-900 text-xl group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">{tpl.title}</h3>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">USE TEMPLATE</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <i className="fas fa-arrow-right text-xs"></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default HomeView;
