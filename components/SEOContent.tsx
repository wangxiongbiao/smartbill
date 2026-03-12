
import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface SEOContentProps {
    lang: Language;
}

const SEOContent: React.FC<SEOContentProps> = ({ lang }) => {
    const t = translations[lang] || translations['en'];
    const copyByLang = {
        en: {
            industriesBadge: 'Industries',
            faqDescription: 'Everything you need to know about our invoice maker.',
            footerTitle: 'Professional Invoice Maker for Modern Business',
            footerBody: 'SmartBill Pro is more than an invoice template. It is a full billing workflow powered by AI to simplify repetitive work. Whether you need freelancer invoices, consulting bills, contractor formats, or simple receipts, SmartBill helps you build a stronger professional brand with polished billing documents.',
        },
        'zh-CN': {
            industriesBadge: '适用行业',
            faqDescription: '关于我们的发票工具，你需要知道的重点都在这里。',
            footerTitle: '适合现代商业的专业发票工具',
            footerBody: 'SmartBill Pro 不只是发票模板，而是一套以 AI 简化流程的完整计费方案。无论你需要自由职业者发票、顾问服务账单、工程请款格式或简单收据，都能用同一套工作流快速完成，建立更专业的品牌形象。',
        },
        'zh-TW': {
            industriesBadge: '適用產業',
            faqDescription: '關於我們的發票工具，你需要知道的重點都在這裡。',
            footerTitle: '適合現代商務的專業發票工具',
            footerBody: 'SmartBill Pro 不只是發票模板，而是一套以 AI 簡化流程的完整計費方案。無論你需要自由工作者發票、顧問服務帳單、工程請款格式或簡單收據，都能用同一套工作流快速完成，建立更專業的品牌形象。',
        },
        th: {
            industriesBadge: 'อุตสาหกรรม',
            faqDescription: 'ทุกสิ่งที่คุณควรรู้เกี่ยวกับเครื่องมือออกใบแจ้งหนี้ของเราอยู่ที่นี่',
            footerTitle: 'เครื่องมือออกใบแจ้งหนี้มืออาชีพสำหรับธุรกิจสมัยใหม่',
            footerBody: 'SmartBill Pro เป็นมากกว่าเทมเพลตใบแจ้งหนี้ แต่เป็นเวิร์กโฟลว์การเรียกเก็บเงินครบวงจรที่ขับเคลื่อนด้วย AI เพื่อช่วยลดงานซ้ำ ๆ ไม่ว่าคุณจะต้องการใบแจ้งหนี้ฟรีแลนซ์ บิลที่ปรึกษา แบบฟอร์มผู้รับเหมา หรือใบเสร็จแบบง่าย SmartBill จะช่วยให้เอกสารการเรียกเก็บเงินของคุณดูเป็นมืออาชีพยิ่งขึ้น',
        },
        id: {
            industriesBadge: 'Industri',
            faqDescription: 'Semua yang perlu Anda ketahui tentang pembuat invoice kami ada di sini.',
            footerTitle: 'Pembuat Invoice Profesional untuk Bisnis Modern',
            footerBody: 'SmartBill Pro bukan sekadar template invoice. Ini adalah alur kerja penagihan lengkap berbasis AI untuk menyederhanakan pekerjaan berulang. Baik Anda membutuhkan invoice freelancer, tagihan konsultasi, format kontraktor, atau kuitansi sederhana, SmartBill membantu membangun citra profesional yang lebih kuat lewat dokumen penagihan yang rapi.',
        },
    } satisfies Record<Language, {
        industriesBadge: string;
        faqDescription: string;
        footerTitle: string;
        footerBody: string;
    }>;
    const copy = copyByLang[lang];

    // Simple helper to render bold text from markdown-style **text**
    const renderMarkdown = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-slate-900 font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="space-y-24 mt-24">
            {/* Features Section - Why SmartBill */}
            <section className="bg-slate-50 rounded-[3rem] p-12 sm:p-20 border border-slate-100">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <h2 className="text-3xl sm:text-5xl font-semibold text-slate-900 tracking-tight">
                        {t.whySmartBill}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                        {(t.features || []).map((feature: any, idx: number) => (
                            <div key={idx} className="space-y-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-100">
                                    <i className={`fas ${idx === 0 ? 'fa-bolt' : idx === 1 ? 'fa-th-large' : 'fa-check-circle'}`}></i>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 leading-tight">{feature.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Industries / Use Cases Section [NEW] */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-semibold uppercase tracking-widest">
                        <i className="fas fa-briefcase"></i>
                        <span>{copy.industriesBadge}</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-semibold text-slate-900 tracking-tight">
                        {t.industriesTitle}
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(t.industriesList || []).map((ind: any, idx: number) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-50 transition-all group cursor-default">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                                <i className={`fas ${ind.icon || 'fa-briefcase'}`}></i>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">{ind.title}</h3>
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
                        <h2 className="text-3xl sm:text-5xl font-semibold text-slate-900 tracking-tight">
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
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-semibold text-xs">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-slate-900">{review.name}</div>
                                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{review.role}</div>
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
                    <h2 className="text-3xl sm:text-5xl font-semibold text-slate-900 tracking-tight">
                        {t.faqTitle}
                    </h2>
                    <p className="text-slate-500 font-medium">{copy.faqDescription}</p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {(t.faqs || []).map((faq: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">{faq.q}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SEO rich footer text (How it works) */}
            <section className="text-center max-w-3xl mx-auto space-y-8 pb-12">
                <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
                <div className="prose prose-slate mx-auto">
                    <h2 className="text-2xl font-semibold text-slate-900">
                        {copy.footerTitle}
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        {copy.footerBody}
                    </p>
                </div>
            </section>
        </div>
    );
};

export default SEOContent;
