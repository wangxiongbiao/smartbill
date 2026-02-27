import React from 'react';

export function FeaturesGrid() {
    const features = [
        { icon: 'fa-file-invoice', title: 'Thousands of formats', desc: 'Choose from a massive library of formats suited for any industry or style.' },
        { icon: 'fa-users', title: 'Real-time collaboration', desc: 'Work together with your team on invoices instantly, no matter where you are.' },
        { icon: 'fa-mobile-alt', title: 'Access on any device', desc: 'Create invoices on the go from your phone, tablet, or desktop computer.' },
        { icon: 'fa-save', title: 'Auto-save drafts', desc: 'Never lose your work. Changes are saved automatically as you type.' },
        { icon: 'fa-globe', title: 'Multi-currency support', desc: 'Bill international clients easily with support for over 100 currencies.' },
        { icon: 'fa-print', title: 'Instant PDF export', desc: 'Download high-quality PDFs ready for print or email in a single click.' },
        { icon: 'fa-lock', title: 'Secure cloud storage', desc: 'Your data is encrypted and stored safely in the cloud for easy retrieval.' },
        { icon: 'fa-palette', title: 'Brand customization', desc: 'Upload your own fonts, logos, and color palettes for brand consistency.' },
        { icon: 'fa-headset', title: '24/7 Support', desc: 'Our support team is always available to help you with any issues.' },
    ];

    return (
        <section className="py-9 md:py-14 bg-white" data-purpose="features-grid">
            <div className="px-6 sm:px-10">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-dark tracking-tight">All the features you need</h2>
                    <p className="text-slate-500 text-base mt-3">Everything to create, manage, and send invoices like a pro.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-10">
                    {features.map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="shrink-0 w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-[#7D2AE8]">
                                <i className={`fas ${item.icon} text-lg`}></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-base mb-1">{item.title}</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
