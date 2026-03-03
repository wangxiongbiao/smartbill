
import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface SEOContentProps {
    lang: Language;
}

const SEOContent: React.FC<SEOContentProps> = ({ lang }) => {
    const t = translations[lang] || translations['en'];

    // Simple helper to render bold text from markdown-style **text**
    const renderMarkdown = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="space-y-24 mt-24">
            {/* Features Section - Why SmartBill */}
            <section className="bg-slate-50 rounded-[3rem] p-12 sm:p-20 border border-slate-100">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                        {t.whySmartBill}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                        {(t.features || []).map((feature: any, idx: number) => (
                            <div key={idx} className="space-y-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-100">
                                    <i className={`fas ${idx === 0 ? 'fa-bolt' : idx === 1 ? 'fa-th-large' : 'fa-check-circle'}`}></i>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight">{feature.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Industries / Use Cases Section [NEW] */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <i className="fas fa-briefcase"></i>
                        <span>Industries</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                        {t.industriesTitle}
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(t.industriesList || []).map((ind: any, idx: number) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-50 transition-all group cursor-default">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                                <i className={`fas ${ind.icon || 'fa-briefcase'}`}></i>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-3">{ind.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{ind.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials Section [NEW] */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
                <div className="max-w-4xl mx-auto text-center space-y-16">
                    <div className="space-y-4">
                        <div className="flex justify-center gap-1 text-amber-400 text-sm mb-4">
                            <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                            {t.testimonialsTitle}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {(t.testimonialsList || []).map((review: any, idx: number) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex text-amber-400 text-xs">
                                        {[...Array(review.rating || 5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                                    </div>
                                    <p className="text-slate-600 font-medium leading-relaxed text-sm">
                                        "{renderMarkdown(review.content)}"
                                    </p>
                                </div>
                                <div className="pt-6 mt-6 border-t border-slate-50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-slate-900">{review.name}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{review.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                        {t.faqTitle}
                    </h2>
                    <p className="text-slate-500 font-medium">{lang === 'en' ? 'Everything you need to know about our invoice maker.' : '關於發票生成器的所有您需要了解的信息。'}</p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {(t.faqs || []).map((faq: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-black text-slate-900 mb-3">{faq.q}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SEO rich footer text (How it works) */}
            <section className="text-center max-w-3xl mx-auto space-y-8 pb-12">
                <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
                <div className="prose prose-slate mx-auto">
                    <h2 className="text-2xl font-black text-slate-900">
                        {lang === 'en' ? 'Professional Invoice Maker for Modern Business' : '現代企業的專業發票製作工具'}
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        {lang === 'en'
                            ? "SmartBill Pro is more than just an invoice template. It's a comprehensive billing solution that leverages AI to simplify your workflow. Whether you need a freelance invoice template, a construction billing format, or a simple receipt, our platform provides the tools to build your professional brand. Our mission is to help freelancers and small business owners worldwide get paid faster and more efficiently with clean, professional-grade billing documents."
                            : "SmartBill Pro 不僅僅是一個發票模板。它是一個利用 AI 簡化您的工作流程的綜合計費解決方案。無論您需要自由職業者發票模板、建築計費格式還是簡單的收據，我們的平台都提供了構建您專業品牌的工具。我們的使命是幫助全球的自由職業者和小型企業主通過乾淨、專業級的計費文件更快、更高效地獲得報酬。"}
                    </p>
                </div>
            </section>
        </div>
    );
};

export default SEOContent;
