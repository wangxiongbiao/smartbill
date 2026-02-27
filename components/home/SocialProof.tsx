import React from 'react';

export function SocialProof() {
    const logos = ['Google', 'Salesforce', 'Zoom', 'Canva', 'Shopify', 'Slack'];
    return (
        <section className="bg-white border-t border-b border-gray-100 py-2" data-purpose="trust-badges">
            <div className="px-4 sm:px-6">
                <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Trusted by freelancers and small businesses worldwide</p>
                <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2">
                    {logos.map((logo) => (
                        <span key={logo} className="text-gray-300 font-bold text-base tracking-wide">{logo}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}
