
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getShareByToken, incrementShareAccess } from '@/lib/supabase-share';
import SharedInvoiceView from '@/components/SharedInvoiceView';
import ClientDownloadButton from '@/components/ClientDownloadButton';
import { translations } from '@/i18n';

interface SharePageProps {
    params: Promise<{
        token: string;
    }>;
}

// Ensure the page is dynamic
export const dynamic = 'force-dynamic';

export default async function SharePage({ params }: SharePageProps) {
    // 1. Fetch data
    const supabase = await createClient();
    const { token } = await params;

    if (!token) {
        notFound();
    }

    const result = await getShareByToken(supabase, token);

    if (!result) {
        // Render custom expired/invalid state
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Invalid or Expired Link</h1>
                    <p className="text-slate-500 mb-8 font-medium">This share link is no longer valid. Please ask the sender for a new link.</p>
                    <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all inline-block">
                        Go to SmartBill
                    </Link>
                </div>
            </div>
        );
    }

    // 2. Increment access count (fire and forget)
    await incrementShareAccess(supabase, result.share.id);

    // 3. Render
    const { invoice, share } = result;

    // Use a default language or detect from browser (not straightforward in server comp without headers)
    // For now, default to 'en' or maybe store lang in invoices table? 
    // The invoice struct doesn't seem to store `lang` explicitly in `Invoice` type, but the UI uses `lang` state.
    // Actually `Invoice` has no language field. 
    // Let's default to English or allow a query param ?lng=... but for clean URLs token is enough.
    // We can default to 'en' for public view.
    const lang = 'en';
    const t = translations[lang];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 print:bg-white">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                            <i className="fas fa-file-invoice"></i>
                        </div>
                        <span className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">SmartBill</span>
                    </Link>
                    <div>
                        <Link href="/" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                            {t.createYourOwn} <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 print:p-0 print:m-0">
                <div className="max-w-5xl mx-auto print:max-w-none print:w-full">

                    {/* Download Button (Mobile/Desktop) */}
                    {share.allow_download && (
                        <div className="flex justify-end mb-6 print:hidden">
                            {/* This button triggers native browser print */}
                            <ClientDownloadButton invoice={invoice} fileName={`${invoice.invoiceNumber}.pdf`} text={t.downloadPdf} />
                        </div>
                    )}

                    {/* Invoice View */}
                    <div id="invoice-preview-container" className="print:w-full">
                        <SharedInvoiceView data={invoice} lang={lang} />
                    </div>

                </div>
            </main>

            {/* Footer CTA */}
            <footer className="bg-white border-t border-slate-200 py-12 print:hidden">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{t.createYourOwn}</h2>
                    <p className="text-slate-500 text-lg mb-8 font-medium">{t.heroSub}</p>
                    <Link href="/" className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all">
                        {t.startFree} <i className="fas fa-rocket"></i>
                    </Link>
                </div>
            </footer>
        </div>
    );
}

// Client Component for Download Button
// Moved to components/ClientDownloadButton.tsx
