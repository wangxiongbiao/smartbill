'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function Hero() {
    const { user, openLoginModal } = useAuth();
    const router = useRouter();

    function handleCTA() {
        if (!user) {
            openLoginModal();
        } else {
            router.push('/invoice/new');
        }
    }

    return (
        <section className="relative bg-[#E2EAE8] rounded-br-[120px] overflow-hidden" data-purpose="hero">
            <div className="px-6 sm:px-10 py-6 md:py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center min-h-[280px]">
                    {/* Text Content */}
                    <div className="text-left z-10">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight">
                            Create polished invoices<br />with live preview
                        </h1>
                        <p className="text-sm md:text-base text-slate-600 mb-6 max-w-[480px] leading-relaxed">
                            Build professional invoices in a focused editor, preview every change instantly, and reuse templates that match your workflow.
                        </p>
                        <button
                            onClick={handleCTA}
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200 cursor-pointer"
                        >
                            Create Invoice
                        </button>
                    </div>
                    {/* Hero Image Area */}
                    <div className="relative h-full hidden md:flex items-center justify-center overflow-visible">
                        <img
                            src="/hero-illustration-v2.png"
                            alt="Invoice Generator Dashboard"
                            className="w-full max-w-[400px] h-auto object-contain mix-blend-multiply hover:-translate-y-2 transition-transform duration-500 scale-[1.35] lg:scale-[1.5] origin-center"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
