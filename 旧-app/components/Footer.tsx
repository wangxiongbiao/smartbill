
import React from 'react';
import { Language, ViewType, DocumentType } from '../types';
import { translations } from '../i18n';

interface FooterProps {
  lang: Language;
  setView: (v: ViewType) => void;
  onNewDoc: (type: DocumentType) => void;
}

const Footer: React.FC<FooterProps> = ({ lang, setView, onNewDoc }) => {
  const t = translations[lang] || translations['en'];
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 mt-auto no-print relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                <i className="fas fa-file-invoice text-lg"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                  SmartBill
                </span>
                <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mt-1">
                  Professional Pro
                </span>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-medium">
              {t.footerDesc}
            </p>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{t.productFeatures}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li>
                <button onClick={() => setView('home')} className="hover:text-blue-600 transition-colors">
                  {t.home}
                </button>
              </li>
              <li>
                <button onClick={() => onNewDoc('invoice')} className="hover:text-blue-600 transition-colors">
                  {t.makeInvoice}
                </button>
              </li>
              <li>
                <button onClick={() => onNewDoc('receipt')} className="hover:text-blue-600 transition-colors">
                  {t.makeReceipt}
                </button>
              </li>
              <li>
                <button onClick={() => setView('home')} className="hover:text-blue-600 transition-colors">
                  {t.templates}
                </button>
              </li>
              <li>
                <button onClick={() => setView('editor')} className="text-blue-600/60 hover:text-blue-600 transition-colors flex items-center gap-2">
                  <i className="fas fa-bolt text-[10px]"></i> {t.aiAssistant}
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{t.support}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><button onClick={() => setView('about')} className="hover:text-blue-600 transition-colors">{t.aboutUs}</button></li>
              <li><button onClick={() => setView('help')} className="hover:text-blue-600 transition-colors">{t.helpCenter}</button></li>
              {/* <li><a href="#" className="hover:text-blue-600 transition-colors">{t.privacy}</a></li> */}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{t.contactUs}</h4>
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.supportEmail}</p>
                  <p className="text-sm font-black text-slate-900">smartbillpro@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                  <i className="fas fa-clock"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.serviceTime}</p>
                  <p className="text-sm font-black text-slate-900">{t.monToFri}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">{t.pacificTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
            {t.copyright.replace('{year}', year.toString())}
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {t.systemOk}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
