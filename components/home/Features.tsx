import React from 'react';

export function Features() {
    return (
        <>
            {/* BEGIN: FeatureSection1 - text left, image right */}
            <section className="bg-white py-9 md:py-12" data-purpose="feature-left-text">
                <div className="px-6 sm:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-dark leading-snug tracking-tight">Get Paid Faster with Quick Invoice Payments</h2>
                            <p className="text-slate-600 mb-5 text-base leading-relaxed">Send invoices with built-in payment links. Let your clients pay instantly via credit card, Apple Pay, or Google Pay directly from the invoice.</p>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mr-3 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                    <span className="text-slate-700 text-sm">Accept fast and secure online payments</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mr-3 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                    <span className="text-slate-700 text-sm">Automatic payment status tracking</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mr-3 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                    <span className="text-slate-700 text-sm">Zero setup required to start collecting funds</span>
                                </li>
                            </ul>
                            <button className="mt-7 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                                Start getting paid
                            </button>
                        </div>
                        <div className="relative p-6 bg-purple-50 rounded-xl flex items-center justify-center min-h-[220px]">
                            <img
                                alt="Invoice document preview"
                                className="rounded-lg shadow-xl w-1/2 h-auto relative z-10"
                                src="/invoice-preview.png"
                            />
                            {/* Payment Overlay Card */}
                            <div className="absolute bottom-4 right-0 md:-right-8 bg-white p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center gap-4 z-20">
                                <div className="bg-green-100 p-2.5 rounded-full text-green-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div className="pr-2">
                                    <p className="text-xs text-slate-500 font-medium mb-0.5 whitespace-nowrap">Invoice #1024 Paid</p>
                                    <p className="text-base font-bold text-slate-900">$4,200.00</p>
                                </div>
                            </div>

                            {/* Payment Methods Card */}
                            <div className="absolute top-4 left-0 md:-left-6 bg-white py-2 px-4 rounded-lg shadow-lg border border-gray-50 flex items-center gap-4 z-20">
                                <i className="fa-brands fa-cc-stripe text-[#635BFF] text-2xl"></i>
                                <i className="fa-brands fa-apple text-gray-800 text-2xl"></i>
                                <i className="fa-brands fa-google-pay text-gray-700 text-3xl leading-none flex items-center mt-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* END: FeatureSection1 */}

            {/* BEGIN: FeatureSection2 - image left, text right */}
            <section className="bg-lightbg py-9 md:py-12" data-purpose="feature-right-text">
                <div className="mx-auto px-6 sm:px-10">
                    <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">
                        {/* Image Column */}
                        <div className="flex-1 order-2 md:order-1 w-full text-center">
                            <div className="relative inline-block p-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform hover:-translate-y-1 transition-transform duration-300">
                                <img
                                    src="/template_split_view.png"
                                    alt="Editor UI Interface"
                                    className="rounded-xl w-full h-auto max-w-[640px] mx-auto"
                                />
                            </div>
                        </div>

                        {/* Text Column */}
                        <div className="flex-1 order-1 md:order-2">
                            <h2 className="text-2xl md:text-3xl font-bold mb-5 text-dark leading-tight tracking-tight">Easily generate and send invoices</h2>
                            <p className="text-slate-600 mb-7 text-base leading-relaxed">Customize every detail. Add your logo, change colors to match your brand, and personalize the thank you message.</p>
                            <ul className="space-y-5">
                                <li className="flex gap-4 group">
                                    <div className="shrink-0 w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-base">AI Smart Editor</h4>
                                        <p className="text-slate-500 text-sm mt-1 leading-relaxed">Intuitive interface that leverages AI to help you draft invoices in seconds.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 group">
                                    <div className="shrink-0 w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-base">Instant Sync</h4>
                                        <p className="text-slate-500 text-sm mt-1 leading-relaxed">Every change you make reflects instantly on the preview, ensuring a perfect result every time.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            {/* END: FeatureSection2 */}
        </>
    );
}
