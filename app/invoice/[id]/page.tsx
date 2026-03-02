'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Invoice } from '@/types/invoice';
import { createDefaultInvoice } from '@/lib/invoice-defaults';
import { saveInvoice, getInvoiceById } from '@/lib/invoices';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import SaveStatusIndicator from '@/components/invoice/SaveStatusIndicator';
import {
    ChevronLeft,
    Download,
    Share2,
    Trash2,
    Loader2,
    Monitor,
    Layout,
    ArrowLeftRight
} from 'lucide-react';

export default function InvoiceEditorPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [lastSaved, setLastSaved] = useState<Date | undefined>();
    const [viewMode, setViewMode] = useState<'split' | 'edit-only' | 'preview-only'>('split');

    // Load Invoice
    useEffect(() => {
        async function load() {
            if (id) {
                try {
                    // Try loading from localStorage first for "mock" persistence
                    const savedData = localStorage.getItem(`invoice_${id}`);
                    if (savedData) {
                        setInvoice(JSON.parse(savedData));
                    } else {
                        setInvoice(createDefaultInvoice(user?.id));
                    }
                } catch (error) {
                    console.error('Error loading local invoice:', error);
                    setInvoice(createDefaultInvoice(user?.id));
                }
            } else {
                setInvoice(createDefaultInvoice(user?.id));
            }
            setIsLoading(false);
        }
        load();
    }, [id, user?.id]);

    // Mock Auto-save logic (1s debounce for snappier mock feel)
    useEffect(() => {
        if (!invoice) return;

        const timer = setTimeout(async () => {
            setSaveStatus('saving');
            try {
                // Save to localStorage instead of Supabase
                localStorage.setItem(`invoice_${invoice.id}`, JSON.stringify(invoice));

                setSaveStatus('saved');
                setLastSaved(new Date());

                // Update URL if it was /new (simulated)
                if (!id && invoice.id) {
                    window.history.replaceState(null, '', `/invoice/${invoice.id}`);
                }
            } catch (error) {
                console.error('Mock save error:', error);
                setSaveStatus('error');
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [invoice, id]);

    const handleUpdate = useCallback((updates: Partial<Invoice>) => {
        setInvoice(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }, []);

    const [template, setTemplate] = useState<'minimalist' | 'modern' | 'professional'>('minimalist');
    const [lang, setLang] = useState<'en' | 'zh-TW'>('en');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-blue-600 animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Editor...</p>
                </div>
            </div>
        );
    }

    if (!invoice) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="h-8 w-px bg-slate-100"></div>
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-sm font-black text-slate-900 leading-tight">INVOICE EDITOR</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Editing: {invoice.invoiceNumber || 'Untitled'}</p>
                        </div>

                        {/* Lang Selector */}
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value as any)}
                            className="bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-1 focus:ring-0 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            <option value="en">English</option>
                            <option value="zh-TW">繁體中文</option>
                        </select>
                    </div>
                </div>

                {/* Save Status & Actions */}
                <div className="flex items-center gap-4">
                    <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />

                    <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('edit-only')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'edit-only' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Monitor size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('split')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'split' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Layout size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('preview-only')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'preview-only' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <ArrowLeftRight size={16} />
                        </button>
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                    >
                        <Download size={14} />
                        Export PDF
                    </button>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto p-4 sm:p-8">
                <div className={`grid gap-8 ${viewMode === 'split' ? 'grid-cols-1 xl:grid-cols-[1fr_minmax(auto,850px)]' : 'grid-cols-1'}`}>
                    {/* Form Side */}
                    {(viewMode === 'split' || viewMode === 'edit-only') && (
                        <div className={`animate-in fade-in slide-in-from-left-4 duration-500`}>
                            <InvoiceForm
                                invoice={invoice}
                                onChange={handleUpdate}
                                lang={lang}
                                userId={user?.id}
                            />
                        </div>
                    )}

                    {/* Preview Side */}
                    {(viewMode === 'split' || viewMode === 'preview-only') && (
                        <div className="bg-slate-200/30 rounded-[2.5rem] border-4 border-white shadow-inner">
                            <div className=" origin-top transform-gpu">
                                <InvoicePreview
                                    invoice={invoice}
                                    lang={lang}
                                    template={template}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
