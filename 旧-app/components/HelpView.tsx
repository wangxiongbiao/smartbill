
'use client';
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface HelpViewProps {
  lang: Language;
  onBack: () => void;
}

const HelpView: React.FC<HelpViewProps> = ({ lang, onBack }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const t = translations[lang] || translations['en'];

  const handleImageLoad = (key: string) => {
    setLoadedImages(prev => ({ ...prev, [key]: true }));
  };

  const handleImageError = (key: string) => {
    setFailedImages(prev => ({ ...prev, [key]: true }));
  };

  const faqData = [
    {
      q: lang === 'zh-TW' ? '我生成的數據安全嗎？' : 'Is my data secure?',
      a: lang === 'zh-TW'
        ? '絕對安全。SmartBill Pro 優先採用本地存儲技術。您的發票數據存儲在您自己的瀏覽器中，除非您點擊“保存”或“導出”，否則敏感財務信息不會上傳至我們的服務器。'
        : 'Absolutely. SmartBill Pro prioritizes local storage. Your invoice data stays in your browser and sensitive info is not uploaded to our servers unless you manually save it.'
    },
    {
      q: lang === 'zh-TW' ? '如何利用 AI 加速開票？' : 'How to use AI for faster billing?',
      a: lang === 'zh-TW'
        ? '在編輯器側邊欄中找到“AI 智能填充”。您只需輸入：“我今天為客戶設計了3個Logo，每個500元”，AI 就會自動為您創建明細行、計算總價。'
        : 'Find "AI Smart Fill" in the sidebar. Just type: "I designed 3 logos for my client at $500 each," and AI will automatically create the line items and totals.'
    },
    {
      q: lang === 'zh-TW' ? 'PDF 導出格式不正確怎麼辦？' : 'What if PDF format is incorrect?',
      a: lang === 'zh-TW'
        ? '為獲得最佳效果，建議使用 Chrome 或 Safari 瀏覽器。導出前，請確保預覽窗口顯示正常。如果圖片加載失敗，請檢查您的網絡連接。'
        : 'For best results, use Chrome or Safari. Ensure the preview looks correct before exporting.'
    },
    {
      q: lang === 'zh-TW' ? '可以自定義發票編號嗎？' : 'Can I customize invoice numbers?',
      a: lang === 'zh-TW'
        ? '是的。在“發票信息”表單的第一行，您可以隨時修改發票編號。系統也會根據您的歷史記錄自動為新發票生成連續的編號。'
        : 'Yes. In the first row of the form, you can modify the number.'
    }
  ];

  const TutorialImage = ({ id, src, alt, icon, gradient }: { id: string, src: string, alt: string, icon: string, gradient: string }) => {
    const isLoaded = loadedImages[id];
    const isFailed = failedImages[id];

    return (
      <div className="flex-1 relative group">
        <div className={`absolute -inset-4 ${gradient.replace('from-', 'bg-').split(' ')[0]}/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all`}></div>
        <div className={`relative rounded-[2.5rem] shadow-2xl border-[12px] border-white w-full h-[350px] overflow-hidden bg-slate-50 flex items-center justify-center`}>

          {!isLoaded && !isFailed && (
            <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
              <i className="fas fa-circle-notch fa-spin text-slate-300 text-3xl"></i>
            </div>
          )}

          {isFailed ? (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center text-white p-10 text-center`}>
              <i className={`fas ${icon} text-6xl mb-6 opacity-40`}></i>
              <p className="font-black uppercase tracking-widest text-sm mb-1">{alt}</p>
              <div className="h-px w-12 bg-white/30 my-2"></div>
              <p className="text-[10px] opacity-60 uppercase tracking-tighter">SmartBill Pro Illustration</p>
            </div>
          ) : (
            <img
              src={src}
              alt={alt}
              onLoad={() => handleImageLoad(id)}
              onError={() => handleImageError(id)}
              className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-90"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Customer Support</span>
          <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{t.helpCenter}</span>
        </div>
        <div className="w-10"></div>
      </nav>

      <section className="bg-white pt-16 pb-32 px-6 text-center border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10"></div>
        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl shadow-blue-100 mb-2 rotate-3">
            <i className="fas fa-life-ring text-3xl"></i>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
            {lang === 'zh-TW' ? '我們能幫您解決什麼？' : 'How can we help?'}
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
            {lang === 'zh-TW' ? '從 AI 智能填充到專業 PDF 導出，這裏有您需要的一切教程與解答。' : 'From AI filling to pro PDF export, find all tutorials and answers here.'}
          </p>

          {/* <div className="max-w-md mx-auto relative pt-4 z-20">
            <input 
              type="text" 
              placeholder={lang === 'zh-TW' ? '搜索您的問題...' : 'Search for questions...'}
              className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            />
            <i className="fas fa-search absolute left-5 top-[calc(50%+8px)] -translate-y-1/2 text-slate-400"></i>
          </div> */}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 -mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 mb-20 relative z-30">
        {[
          { icon: 'fa-play', title: lang === 'zh-TW' ? '快速上手' : 'Quick Start', color: 'bg-emerald-500' },
          { icon: 'fa-brain', title: lang === 'zh-TW' ? 'AI 技巧' : 'AI Tricks', color: 'bg-blue-600' },
          { icon: 'fa-palette', title: lang === 'zh-TW' ? '風格定制' : 'Customizing', color: 'bg-indigo-600' },
          { icon: 'fa-file-pdf', title: lang === 'zh-TW' ? '導出管理' : 'Exports', color: 'bg-purple-600' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all cursor-pointer">
            <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl mb-4 shadow-lg group-hover:rotate-12 transition-transform`}>
              <i className={`fas ${item.icon}`}></i>
            </div>
            <h3 className="font-black text-slate-900 mb-1">{item.title}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Learn More</span>
          </div>
        ))}
      </div>

      <section className="max-w-5xl mx-auto px-6 space-y-32">
        {/* Step 1: 基础业务信息 - 新图：现代办公环境 */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xl">1</div>
            <h2 className="text-3xl font-black text-slate-900">
              {lang === 'zh-TW' ? '填寫基本業務信息' : 'Enter Basic Business Info'}
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              {lang === 'zh-TW'
                ? '在編輯器中，首先填寫您的公司名稱和地址。您可以點擊“上傳 Logo”來添加您的品牌標誌。隨後在“發送至”區域輸入客戶的詳細信息。'
                : 'In the editor, start by filling in your company name and address. Click "Upload Logo" to add your branding. Then enter the client details.'}
            </p>
            <div className="pt-4 flex gap-4">
              <span className="flex items-center gap-2 text-xs font-black text-slate-400"><i className="fas fa-check-circle text-emerald-500"></i> 支持 PNG/JPG</span>
              <span className="flex items-center gap-2 text-xs font-black text-slate-400"><i className="fas fa-check-circle text-emerald-500"></i> 多幣種切換</span>
            </div>
          </div>
          <TutorialImage
            id="step1"
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80"
            alt="Business Workspace"
            icon="fa-briefcase"
            gradient="from-slate-700 to-slate-900"
          />
        </div>

        {/* Step 2: AI 填充 - 新图：科技感脑图 */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl">2</div>
            <h2 className="text-3xl font-black text-slate-900">
              {lang === 'zh-TW' ? '使用 AI 助手一鍵生成' : 'Generate with AI Assistant'}
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              {lang === 'zh-TW'
                ? '不喜歡繁瑣的輸入？在側邊欄描述您的工作內容。我們強大的 AI 技術會自動提取單價、數量和描述，並瞬間填充到發票表格中。'
                : 'Hate manual typing? Describe your work in the sidebar. Our powerful AI extracts rates, quantities, and descriptions into your form instantly.'}
            </p>
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Try This Prompt</p>
              <p className="text-sm font-medium italic text-slate-600">“我上週做了4天開發，每天2000元，以及一個價值500元的標誌設計。”</p>
            </div>
          </div>
          <TutorialImage
            id="step2"
            src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80"
            alt="AI Neural Tech"
            icon="fa-brain"
            gradient="from-blue-500 to-indigo-700"
          />
        </div>

        {/* Step 3: 导出 PDF - 新图：签名与成功交付 */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xl">3</div>
            <h2 className="text-3xl font-black text-slate-900">
              {lang === 'zh-TW' ? '預覽、簽名並導出' : 'Preview, Sign & Export'}
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              {lang === 'zh-TW'
                ? '在右側實時查看發票樣式。使用我們的電子簽名板手寫您的簽名。滿意後，點擊“導出 PDF”即可下載高清、專業的商務文件。'
                : 'Live preview your invoice. Use our electronic signature pad to handwrite your sign. Click "Export PDF" for a high-def business document.'}
            </p>
            <div className="pt-2">
              <button onClick={onBack} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all">
                {lang === 'zh-TW' ? '現在去試試' : 'Try Now'}
              </button>
            </div>
          </div>
          <TutorialImage
            id="step3"
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80"
            alt="Successful Export"
            icon="fa-file-pdf"
            gradient="from-emerald-400 to-teal-600"
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-40">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">{lang === 'zh-TW' ? '常見問題 FAQ' : 'General FAQ'}</h2>
          <p className="text-slate-400 font-medium">快速找到您最關心的問題答案</p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, idx) => (
            <div key={idx} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-8 py-7 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-black text-slate-800 text-lg pr-8">{item.q}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeFaq === idx ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </button>
              {activeFaq === idx && (
                <div className="px-8 pb-8 text-slate-500 font-medium leading-relaxed animate-in slide-in-from-top-2 duration-300">
                  <div className="h-px bg-slate-100 mb-6 w-full"></div>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HelpView;
