import React from 'react';

export function SocialProof() {
    const logos = ['Google', 'Salesforce', 'Zoom', 'Canva', 'Shopify', 'Slack'];
    return (
        <section className="bg-white border-t border-b border-gray-100 py-5" data-purpose="trust-badges">
            <div className="px-6 sm:px-10">
                <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Trusted by freelancers and small businesses worldwide</p>
                <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-3">
                    {logos.map((logo) => (
                        <span key={logo} className="text-gray-300 font-bold text-sm tracking-wide">{logo}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}
