import React from 'react';

export function TargetAudience() {
    return (
        <section className="bg-lightbg py-5 md:py-7" data-purpose="audience-segments">
            <div className="px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-dark tracking-tight">Invoicing made easy for everyone</h2>
                    <p className="text-slate-500 text-lg mt-3">Whatever your business type, we have you covered.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-[#7D2AE8]" style={{ backgroundColor: '#F3E5F5' }}>
                            <i className="fas fa-user text-xl"></i>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900">Freelancers</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">Get paid faster and look professional without hiring an accountant. Keep track of your gigs easily.</p>
                    </div>
                    <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-[#7D2AE8]" style={{ backgroundColor: '#F3E5F5' }}>
                            <i className="fas fa-store text-xl"></i>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900">Small Businesses</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">Streamline your billing process. Create branded invoices that impress clients and organize records.</p>
                    </div>
                    <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-[#7D2AE8]" style={{ backgroundColor: '#F3E5F5' }}>
                            <i className="fas fa-building text-xl"></i>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900">Enterprise</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">Scale your invoicing operations. Integrate with existing workflows and manage teams securely.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
