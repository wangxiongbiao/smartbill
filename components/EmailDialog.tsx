import React, { useState, useEffect } from 'react';
import { Invoice } from '../types';
import { CreateShareOptions } from '../lib/supabase-share';
import { translations } from '../i18n';
import { Language } from '../types';

interface EmailDialogProps {
    invoice: Invoice;
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
    showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const EmailDialog: React.FC<EmailDialogProps> = ({ invoice, isOpen, onClose, lang, showToast }) => {
    const t = translations[lang] || translations['en'];

    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [loading, setLoading] = useState(false);

    const copyByLang = {
        en: {
            emailPlaceholder: 'client@example.com',
            createShareFailed: 'Could not generate share link for email',
            genericError: t.emailError || 'Failed to send email. Please try again.',
        },
        'zh-CN': {
            emailPlaceholder: 'client@example.com',
            createShareFailed: '无法为邮件生成分享链接',
            genericError: t.emailError || '发送邮件失败，请重试。',
        },
        'zh-TW': {
            emailPlaceholder: 'client@example.com',
            createShareFailed: '無法為郵件生成分享連結',
            genericError: t.emailError || '發送郵件失敗，請重試。',
        },
        th: {
            emailPlaceholder: 'client@example.com',
            createShareFailed: 'ไม่สามารถสร้างลิงก์แชร์สำหรับอีเมลได้',
            genericError: t.emailError || 'ส่งอีเมลไม่สำเร็จ โปรดลองอีกครั้ง',
        },
        id: {
            emailPlaceholder: 'client@example.com',
            createShareFailed: 'Tidak dapat membuat tautan bagikan untuk email',
            genericError: t.emailError || 'Gagal mengirim email. Silakan coba lagi.',
        },
    } satisfies Record<Language, {
        emailPlaceholder: string;
        createShareFailed: string;
        genericError: string;
    }>;
    const copy = {
        ...copyByLang[lang],
        testLimit: `${t.emailError}: ${t.resendTestLimit}`,
    };

    useEffect(() => {
        if (isOpen && invoice) {
            setEmailSent(false);
            setEmail('');
        }
    }, [isOpen, invoice]);

    const handleCreateShare = async () => {
        setLoading(true);
        try {
            const options: CreateShareOptions = { allowDownload: true, expiresInDays: null };
            const response = await fetch('/api/share/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId: invoice.id, options })
            });
            const data = await response.json();
            if (data.share) return data.share;
        } catch (error) {
            console.error('Failed to create share for email:', error);
        } finally {
            setLoading(false);
        }
        return null;
    };

    const handleSendEmail = async () => {
        if (!email) return;
        setSendingEmail(true);
        try {
            const currentShare = await handleCreateShare();
            if (!currentShare) throw new Error(copy.createShareFailed);

            const shareUrl = `${window.location.origin}/share/${currentShare.share_token}`;
            const response = await fetch('/api/share/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, invoiceNumber: invoice.invoiceNumber, shareUrl, senderName: invoice.sender.name })
            });

            if (response.ok) {
                setEmailSent(true);
            } else {
                const data = await response.json();
                console.error('Failed to send email:', data);
                if (data.success) {
                    onClose();
                } else if (data.isTestMode) {
                    showToast?.(copy.testLimit, 'warning');
                } else {
                    showToast?.(copy.genericError, 'error');
                }
            }
        } catch (error) {
            console.error('Error sending email:', error);
            showToast?.(copy.genericError, 'error');
        } finally {
            setSendingEmail(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all pointer-events-auto" onClick={onClose}>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">{t.shareEmail}</h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">{t.shareEmailDesc}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"><i className="fas fa-times text-lg"></i></button>
                </div>

                <div className="p-8 space-y-8 min-h-[18.75rem]">
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        {emailSent ? (
                            <div className="bg-emerald-50 rounded-3xl p-8 text-center border border-emerald-100">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"><i className="fas fa-paper-plane"></i></div>
                                <h4 className="text-xl font-semibold text-slate-900 mb-2">{t.emailSentTitle}</h4>
                                <p className="text-slate-500 text-sm mb-6">{t.emailSentDesc}</p>
                                <button onClick={() => setEmailSent(false)} className="text-emerald-600 font-semibold hover:text-emerald-700">{t.sendAnother}</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.recipientEmail}</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={copy.emailPlaceholder} autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-500">
                                    <p className="flex gap-2"><i className="fas fa-info-circle text-blue-400 mt-0.5"></i><span>{t.emailInfo}<span className="block mt-2 text-slate-400 text-xs">* {t.linkWillBeCreated}</span></span></p>
                                </div>

                                <button onClick={handleSendEmail} disabled={sendingEmail || !email || loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4">
                                    {sendingEmail ? <i className="fas fa-spinner fa-spin"></i> : (<span className="flex items-center justify-center gap-2"><i className="fas fa-paper-plane"></i>{t.sendInvoice}</span>)}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailDialog;
