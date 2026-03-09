'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Invoice, TemplateType } from '@/types/invoice';
import { createDefaultInvoice } from '@/lib/invoice-defaults';
import { useAutoSave, SaveStatus } from '@/hooks/useAutoSave';
import { loadInvoice } from '@/lib/invoices';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import { SaveStatusBadge } from '@/components/invoice/SaveStatusBadge';
import ImagePickerDialog from '@/components/invoice/ImagePickerDialog';
import InvoicePdfPreviewDialog from '@/components/invoice/InvoicePdfPreviewDialog';
import {
    ChevronLeft,
    Download,
    Monitor,
    Layout,
    ArrowLeftRight,
    Loader2
} from 'lucide-react';

export default function InvoiceEditorPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params?.id as string;
    const initialTemplate = searchParams?.get('template') as TemplateType | null;
    const requestedView = searchParams?.get('view');
    const isExplicitEdit = searchParams?.get('edit') === 'true';
    const isRequestedPreview = requestedView === 'preview';
    const preferredViewMode: 'split' | 'edit-only' | 'preview-only' = requestedView === 'preview'
        ? 'preview-only'
        : isExplicitEdit
            ? 'edit-only'
            : 'split';

    // 新建发票时使用路由 id，避免保存键与页面地址错位。
    const [invoice, setInvoice] = useState<Invoice>(() => {
        return createDefaultInvoice(undefined, {
            id,
            template: initialTemplate || undefined,
        });
    });
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [viewMode, setViewMode] = useState<'split' | 'edit-only' | 'preview-only'>(preferredViewMode);
    const [showLogoPicker, setShowLogoPicker] = useState(false);
    const [showQRCodePicker, setShowQRCodePicker] = useState(false);
    const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
    const isReadOnlyPreview = isRequestedPreview;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!id) return;

        setInvoice((current) => {
            if (current.id === id && (!initialTemplate || current.template === initialTemplate)) {
                return current;
            }

            return createDefaultInvoice(undefined, {
                id,
                template: initialTemplate || undefined,
            });
        });
    }, [id, initialTemplate]);

    useEffect(() => {
        if (isRequestedPreview) {
            setViewMode('preview-only');
            return;
        }

        setViewMode(preferredViewMode);
    }, [preferredViewMode, isRequestedPreview]);

    // Load invoice data
    useEffect(() => {
        const userId = user?.id;
        if (!id) return;

        let cancelled = false;

        async function fetchInvoice(resolvedUserId: string) {
            try {
                setLoading(true);

                if (!resolvedUserId) return;

                const data = await loadInvoice(resolvedUserId, id);
                if (cancelled) return;

                if (data) {
                    setInvoice(data);
                }
            } catch (err) {
                console.error('Failed to load invoice:', err);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchInvoice(userId || '');

        return () => {
            cancelled = true;
        };
    }, [user?.id, id]);

    // 自动保存
    useAutoSave(invoice, user?.id, setSaveStatus, mounted && !loading && !isReadOnlyPreview);

    const handleUpdate = useCallback((updates: Partial<Invoice>) => {
        setInvoice(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    }, []);

    const handleOpenPdfPreview = useCallback(() => {
        setIsPdfPreviewOpen(true);
    }, []);

    // 独立控制预览的模板(为了不污染实际保存的发票数据，但如果 invoice 自己带有 template，优先使用 invoice 的)
    const [template, setTemplate] = useState<TemplateType>(initialTemplate || 'minimalist');

    useEffect(() => {
        if (invoice?.template) {
            setTemplate(invoice.template);
        }
    }, [invoice?.template]);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">正在加載發票數據...</p>
                </div>
            </div>
        );
    }

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
                            <h1 className="text-sm font-black text-slate-900 leading-tight">{isReadOnlyPreview ? '發票詳情' : '發票編輯器'}</h1>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest leading-none mt-0.5">
                                {isReadOnlyPreview ? '正在查看' : '正在編輯'}: {invoice.invoiceNumber || '未命名'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Status & Actions */}
                <div className="flex items-center gap-4">
                    {!isReadOnlyPreview && <SaveStatusBadge status={saveStatus} />}

                    {!isReadOnlyPreview && (
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
                    )}

                    <button
                        onClick={handleOpenPdfPreview}
                        className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-500"
                    >
                        <Download size={14} />
                        預覽 PDF
                    </button>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto p-4 sm:p-8">
                <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-1 xl:grid-cols-[1fr_minmax(auto,850px)]' : 'grid-cols-1'}`}>
                    {/* Form Side */}
                    {!isReadOnlyPreview && (viewMode === 'split' || viewMode === 'edit-only') && (
                        <div className={`animate-in fade-in slide-in-from-left-4 duration-500`}>
                            <InvoiceForm
                                invoice={invoice}
                                onChange={handleUpdate}
                                userId={user?.id}
                                onShowLogoPicker={() => setShowLogoPicker(true)}
                                onShowQRCodePicker={() => setShowQRCodePicker(true)}
                                showLogoPicker={showLogoPicker}
                                setShowLogoPicker={setShowLogoPicker}
                                showQRCodePicker={showQRCodePicker}
                                setShowQRCodePicker={setShowQRCodePicker}
                            />
                        </div>
                    )}

                    {/* Preview Side */}
                    {(viewMode === 'split' || viewMode === 'preview-only') && (
                        <div className="bg-slate-200/30 rounded-[2.5rem] border-4 border-white shadow-inner xl:sticky xl:top-24 self-start">
                            <div className=" origin-top transform-gpu">
                                <InvoicePreview
                                    invoice={invoice}
                                    template={template}
                                    onChange={isReadOnlyPreview ? undefined : handleUpdate}
                                    onShowLogoPicker={isReadOnlyPreview ? undefined : () => setShowLogoPicker(true)}
                                    onShowQRCodePicker={isReadOnlyPreview ? undefined : () => setShowQRCodePicker(true)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <ImagePickerDialog
                isOpen={showLogoPicker}
                onClose={() => setShowLogoPicker(false)}
                imageType="logo"
                onSelect={(img) => handleUpdate({ sender: { ...invoice.sender, logo: img } })}
                currentUserId={user?.id || ''}
            />

            <ImagePickerDialog
                isOpen={showQRCodePicker}
                onClose={() => setShowQRCodePicker(false)}
                imageType="qrcode"
                onSelect={(img) => handleUpdate({ paymentInfo: { ...invoice.paymentInfo, qrCode: img } as any })}
                currentUserId={user?.id || ''}
            />

            <InvoicePdfPreviewDialog
                invoice={invoice}
                template={template}
                isOpen={isPdfPreviewOpen}
                onClose={() => setIsPdfPreviewOpen(false)}
            />
        </div>
    );
}
