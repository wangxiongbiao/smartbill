import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getShareByToken, incrementShareAccess } from '@/lib/supabase-share';
import SharedInvoiceView from '@/components/SharedInvoiceView';
import ClientDownloadButton from '@/components/ClientDownloadButton';
import { translations } from '@/i18n';
import type { Language } from '@/types';
import {
    buildAbsoluteLangUrl,
    buildLanguageAlternates,
    buildLangHref,
    buildOgImageHref,
    resolveLanguage,
} from '@/lib/marketing';
import type { Metadata } from 'next';

interface SharePageProps {
    params: Promise<{ token: string }>;
    searchParams?: Promise<{ lang?: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }: SharePageProps): Promise<Metadata> {
    const { token } = await params;
    const sp = (await searchParams) || {};
    const lang = resolveLanguage(sp.lang);
    const path = `/share/${token}`;
    const copyByLang: Record<Language, { title: string; description: string }> = {
        en: {
            title: 'Shared Invoice',
            description: 'View a professional invoice shared through SmartBill.',
        },
        'zh-CN': {
            title: '分享发票',
            description: '查看通过 SmartBill 分享的专业发票。',
        },
        'zh-TW': {
            title: '分享發票',
            description: '查看透過 SmartBill 分享的專業發票。',
        },
        th: {
            title: 'ใบแจ้งหนี้ที่แชร์',
            description: 'ดูใบแจ้งหนี้มืออาชีพที่แชร์ผ่าน SmartBill',
        },
        id: {
            title: 'Invoice Dibagikan',
            description: 'Lihat invoice profesional yang dibagikan melalui SmartBill.',
        },
    };
    const copy = copyByLang[lang];

    return {
        title: copy.title,
        description: copy.description,
        alternates: {
            canonical: buildLangHref(path, lang),
            languages: buildLanguageAlternates(path),
        },
        openGraph: {
            title: copy.title,
            description: copy.description,
            url: buildAbsoluteLangUrl(path, lang),
            images: [buildOgImageHref('home', lang)],
        },
        twitter: {
            card: 'summary_large_image',
            title: copy.title,
            description: copy.description,
            images: [buildOgImageHref('home', lang)],
        },
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function SharePage({ params, searchParams }: SharePageProps) {
    const supabase = await createClient();
    const { token } = await params;
    const sp = (await searchParams) || {};
    const lang: Language = resolveLanguage(sp.lang);
    const t = translations[lang] || translations.en;
    const homeHref = buildLangHref('/', lang);
    const invalidCopyByLang: Record<Language, { title: string; description: string; backHome: string }> = {
        en: {
            title: 'Invalid or Expired Link',
            description: 'This share link is no longer valid. Please ask the sender for a new link.',
            backHome: 'Go to SmartBill',
        },
        'zh-CN': {
            title: '链接无效或已过期',
            description: '这个分享链接已失效，请向发送者索取新的链接。',
            backHome: '前往 SmartBill',
        },
        'zh-TW': {
            title: '連結無效或已過期',
            description: '這個分享連結已失效，請向發送者索取新的連結。',
            backHome: '前往 SmartBill',
        },
        th: {
            title: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว',
            description: 'ลิงก์แชร์นี้ใช้ไม่ได้แล้ว โปรดขอลิงก์ใหม่จากผู้ส่ง',
            backHome: 'ไปที่ SmartBill',
        },
        id: {
            title: 'Tautan Tidak Valid atau Kedaluwarsa',
            description: 'Tautan berbagi ini sudah tidak berlaku. Silakan minta tautan baru kepada pengirim.',
            backHome: 'Kembali ke SmartBill',
        },
    };
    const invalidCopy = invalidCopyByLang[lang];

    if (!token) notFound();

    const result = await getShareByToken(supabase, token);

    if (!result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">{invalidCopy.title}</h1>
                    <p className="text-slate-500 mb-8 font-medium">{invalidCopy.description}</p>
                    <Link href={homeHref} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all inline-block">
                        {invalidCopy.backHome}
                    </Link>
                </div>
            </div>
        );
    }

    await incrementShareAccess(supabase, result.share.id);
    const { invoice, share } = result;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 print:bg-white">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href={homeHref} className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform"><i className="fas fa-file-invoice"></i></div>
                        <span className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">SmartBill</span>
                    </Link>
                    <div>
                        <Link href={homeHref} className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                            {t.createYourOwn} <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 print:p-0 print:m-0">
                <div className="max-w-5xl mx-auto print:max-w-none print:w-full">
                    {share.allow_download && (
                        <div className="flex justify-end mb-6 print:hidden">
                            <ClientDownloadButton invoice={invoice} fileName={`${invoice.invoiceNumber}.pdf`} text={t.downloadPdf} />
                        </div>
                    )}
                    <div id="invoice-preview-container" className="print:w-full">
                        <SharedInvoiceView data={invoice} lang={lang} />
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-slate-200 py-12 print:hidden">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{t.createYourOwn}</h2>
                    <p className="text-slate-500 text-lg mb-8 font-medium">{t.heroSub}</p>
                    <Link href={homeHref} className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all">
                        {t.startFree} <i className="fas fa-rocket"></i>
                    </Link>
                </div>
            </footer>
        </div>
    );
}
