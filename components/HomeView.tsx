
import React from 'react';
import { Invoice, IndustryTemplate, Language } from '../types';
import { translations } from '../i18n';

interface HomeViewProps {
  onSelectTemplate: (data: Partial<Invoice>) => void;
  onCreateEmpty: () => void;
  lang: Language;
}

const INDUSTRIES = [
  { 
    name: '自由职业', 
    nameKey: 'freelance',
    color: 'bg-emerald-500', 
    icon: 'fa-user-ninja', 
    imageIds: [
      '1497215728101-856f4ea42174', '1519389950473-47ba0277781c', '1522202176988-66273c2fd55f', 
      '1486312338219-ce68d2c6f3ad', '1517245386807-bb43f82c33c4', '1515378960530-7c0da6231fb1',
      '1499750310107-5fef28a66643', '1504384308090-c894fdcc538d'
    ]
  },
  { 
    name: '建筑装修', 
    nameKey: 'construction',
    color: 'bg-orange-500', 
    icon: 'fa-hard-hat', 
    imageIds: [
      '1504307651254-3b5b198c67d8', '1541888941259-79273a460011', '1503387762-592deb58ef4e',
      '1581094794329-c8112a89af12', '1534237748181-6d473797656d', '1504917595217-d4dc5dba99bd',
      '1590001158193-e2c2a5aabc5f', '1517646272422-50d48ff70c7c'
    ]
  },
  { 
    name: '零售贸易', 
    nameKey: 'retail',
    color: 'bg-pink-500', 
    icon: 'fa-shopping-bag', 
    imageIds: [
      '1441986300917-64674bd600d8', '1472851294608-062f824d28c5', '1528698827591-e19ccd7bc23d',
      '1556742044-3c52d6e88c62', '1567401893414-76b7b1e5a7a5', '1495474472287-4d71bcdd2085',
      '1533900298318-6b8da08a523e', '1491333078588-55b67d3c77fe'
    ]
  },
  { 
    name: '咨询服务', 
    nameKey: 'consulting',
    color: 'bg-blue-500', 
    icon: 'fa-briefcase', 
    imageIds: [
      '1521737604893-d14cc237f11d', '1521791136364-798a7ad0d224', '1552664730-d307ca884978',
      '1542744173-8e7e53415bb0', '1557804506-669a67965ba0', '1522071823990-95529124430e',
      '1515378717757-69591459a047', '1573497019940-1c28c88b4f3e'
    ]
  },
  { 
    name: '创意设计', 
    nameKey: 'design',
    color: 'bg-purple-500', 
    icon: 'fa-paint-brush', 
    imageIds: [
      '1558655146-d2ba2343260e', '1586717791821-3f44a563df92', '1550684848-fac1c5b4e853',
      '1513542789411-b6a5d4f31634', '1561070791-2526d30994b5', '1633356122544-f134324a6cee',
      '1502462041147-321704628bfd', '1572044162444-ad60f128b582'
    ]
  },
];

const generateTemplates = (categoryName: string, count: number): IndustryTemplate[] => {
  const industry = INDUSTRIES.find(ind => ind.name === categoryName)!;
  
  return Array.from({ length: count }).map((_, i) => {
    const imageId = industry.imageIds[i % industry.imageIds.length];
    const backgroundImage = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=800&q=80`;
    
    return {
      id: `${categoryName}-${i}`,
      category: categoryName,
      title: `${categoryName} #${i + 1}`,
      previewColor: industry.color,
      backgroundImage,
      defaultData: {
        notes: `Generated via SmartBill Pro Template.`,
        items: [{ 
          id: `tpl-item-${i}`, 
          description: `${categoryName} Service Package`, 
          quantity: 1, 
          rate: (450 + (i * 180)) 
        }]
      }
    };
  });
};

const HomeView: React.FC<HomeViewProps> = ({ onSelectTemplate, onCreateEmpty, lang }) => {
  const t = translations[lang];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-16 overflow-hidden">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 lg:py-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-100/30 blur-[120px] rounded-full -z-10"></div>
        <h1 className="text-4xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
          {t.heroTitle.split(' ')[0]} <span className="text-blue-600">{t.heroTitle.split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg sm:text-xl font-medium px-4">
          {t.heroSub}
        </p>
        <div className="flex justify-center pt-8">
          <button 
            onClick={onCreateEmpty}
            className="bg-slate-900 hover:bg-black text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 text-base sm:text-lg group mx-auto"
          >
            <i className="fas fa-plus-circle group-hover:rotate-90 transition-transform duration-300"></i> {t.createEmpty}
          </button>
        </div>
      </section>

      {/* Industry Templates Gallery */}
      {INDUSTRIES.map((industry) => (
        <section key={industry.name} className="space-y-8">
          <div className="flex items-end justify-between px-2">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`${industry.color} w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                  <i className={`fas ${industry.icon} text-base sm:text-lg`}></i>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">{industry.name}</h2>
              </div>
            </div>
          </div>
          
          <div className="flex overflow-x-auto gap-6 pb-6 px-2 scrollbar-hide snap-x">
            {generateTemplates(industry.name, 10).map((tpl) => (
              <div 
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl.defaultData)}
                className="flex-shrink-0 w-64 sm:w-72 h-[350px] sm:h-[400px] bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group relative overflow-hidden snap-start"
              >
                <div className={`h-1/2 sm:h-3/5 w-full relative overflow-hidden ${tpl.previewColor} bg-opacity-20 flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-slate-200 animate-pulse group-data-[loaded=true]:hidden"></div>
                  <img 
                    src={tpl.backgroundImage} 
                    alt={tpl.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-0"
                    onLoad={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.opacity = '1';
                    }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></div>
                  <i className={`fas ${industry.icon} text-4xl text-white opacity-40 absolute z-0`}></i>
                </div>

                <div className="p-6 sm:p-8 flex flex-col justify-between h-1/2 sm:h-2/5 bg-white relative z-10">
                  <div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{tpl.title}</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">READY</span>
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
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
