
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Invoice } from '../types';
import { InvoiceShare, CreateShareOptions } from '../lib/supabase-share';
import { translations } from '../i18n';
import { Language } from '../types';

interface ShareDialogProps {
    invoice: Invoice;
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ invoice, isOpen, onClose, lang }) => {
    const t = translations[lang] || translations['en'];

    const [loading, setLoading] = useState(false);
    const [shares, setShares] = useState<InvoiceShare[]>([]);
    const [activeShare, setActiveShare] = useState<InvoiceShare | null>(null);
    const [allowDownload, setAllowDownload] = useState(true);
    const [expiresIn, setExpiresIn] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    // Email related state
    const [activeTab, setActiveTab] = useState<'link' | 'email'>('link');
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    // Fetch existing shares when dialog opens
    useEffect(() => {
        if (isOpen && invoice) {
            setEmailSent(false);
            setEmail('');
        }
    }, [isOpen, invoice]);

    const handleCreateShare = async () => {
        setLoading(true);
        try {
            const options: CreateShareOptions = {
                allowDownload,
                expiresInDays: expiresIn
            };

            const response = await fetch('/api/share/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    invoiceId: invoice.id,
                    options
                })
            });

            const data = await response.json();
            if (data.share) {
                setActiveShare(data.share);
                setShares(prev => [data.share, ...prev]);
                return data.share;
            }
        } catch (error) {
            console.error('Failed to create share:', error);
        } finally {
            setLoading(false);
        }
        return null;
    };

    const handleSendEmail = async () => {
        if (!email) return;
        setSendingEmail(true);
        try {
            // Ensure we have a share link first
            let currentShare = activeShare;
            if (!currentShare) {
                currentShare = await handleCreateShare();
            }

            if (!currentShare) {
                throw new Error('Could not generate share link for email');
            }

            const shareUrl = `${window.location.origin}/share/${currentShare.share_token}`;

            const response = await fetch('/api/share/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    invoiceNumber: invoice.invoiceNumber,
                    shareUrl,
                    senderName: invoice.sender.name
                })
            });

            if (response.ok) {
                setEmailSent(true);
                setTimeout(() => setEmailSent(false), 3000); // Reset after 3s
            } else {
                console.error('Failed to send email');
            }

        } catch (error) {
            console.error('Error sending email:', error);
        } finally {
            setSendingEmail(false);
        }
    };

    const handleRevoke = async (shareId: string) => {
        try {
            await fetch(`/api/share/revoke?id=${shareId}`, { method: 'DELETE' });
            setShares(prev => prev.filter(s => s.id !== shareId));
            if (activeShare?.id === shareId) {
                setActiveShare(null);
            }
        } catch (error) {
            console.error('Failed to revoke share:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    const shareUrl = activeShare
        ? `${window.location.origin}/share/${activeShare.share_token}`
        : '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all pointer-events-auto" onClick={onClose}>
            <div
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.shareTitle || "Share Invoice"}</h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">{t.shareSubtitle || "Generate a link to share this invoice"}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-8 pt-6 flex gap-4">
                    <button
                        onClick={() => setActiveTab('link')}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                            ${activeTab === 'link'
                                ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-100'
                                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                    >
                        <i className="fas fa-link"></i>
                        {t.shareLink || "Share Link"}
                    </button>
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                             ${activeTab === 'email'
                                ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-100'
                                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                    >
                        <i className="fas fa-envelope"></i>
                        {t.sendEmail || "Send Email"}
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 min-h-[350px]">
                    {activeTab === 'link' ? (
                        <>
                            {activeShare ? (
                                <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                                    {/* Share Link Input */}
                                    <div>
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 block">
                                            {t.shareLink || "SHARE LINK"}
                                        </label>
                                        <div className="flex gap-3">
                                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 flex items-center text-slate-600 font-medium overflow-hidden">
                                                <span className="truncate">{shareUrl}</span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(shareUrl)}
                                                className={`px-6 py-3 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center gap-2
                            ${copied ? 'bg-emerald-500 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'}`}
                                            >
                                                <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                                                {copied ? (t.copied || "Copied") : (t.copy || "Copy")}
                                            </button>
                                        </div>
                                    </div>

                                    {/* QR Code */}
                                    <div className="bg-slate-50 rounded-3xl p-6 flex flex-col items-center justify-center border border-slate-100">
                                        <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                                            <QRCodeSVG value={shareUrl} size={160} />
                                        </div>
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                            {t.scanToShare || "Scan QR Code"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                // Create New Share View
                                <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                                    <div className="bg-blue-50 rounded-3xl p-8 text-center">
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                                            <i className="fas fa-share-alt"></i>
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">{t.createShareLink || "Create Share Link"}</h4>
                                        <p className="text-slate-500 text-sm mb-6">{t.createProLinkDesc || "Create a professional, secure link to share your invoice with clients."}</p>

                                        <div className="bg-white rounded-2xl p-4 text-left shadow-sm border border-blue-100 space-y-4 mb-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                    <i className="fas fa-file-pdf text-red-400"></i> {t.allowPdfDownload || "Allow PDF Download"}
                                                </span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={allowDownload} onChange={e => setAllowDownload(e.target.checked)} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                    <i className="fas fa-clock text-orange-400"></i> {t.expiresIn || "Expires In"}
                                                </span>
                                                <select
                                                    className="bg-slate-50 border-none text-sm font-bold text-slate-600 rounded-lg py-1 px-3 focus:ring-0 cursor-pointer"
                                                    value={expiresIn === null ? 'never' : expiresIn}
                                                    onChange={e => setExpiresIn(e.target.value === 'never' ? null : Number(e.target.value))}
                                                >
                                                    <option value="never">{t.neverExpires || "Never"}</option>
                                                    <option value="7">{t.days7 || "7 days"}</option>
                                                    <option value="30">{t.days30 || "30 days"}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCreateShare}
                                            disabled={loading}
                                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all text-lg"
                                        >
                                            {loading ? <i className="fas fa-spinner fa-spin"></i> : (t.generateLink || "Generate Link")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // Email Tab Content
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {emailSent ? (
                                <div className="bg-emerald-50 rounded-3xl p-8 text-center border border-emerald-100">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                                        <i className="fas fa-paper-plane"></i>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">{t.emailSentTitle || "Email Sent!"}</h4>
                                    <p className="text-slate-500 text-sm mb-6">{t.emailSentDesc || "The invoice has been successfully sent to the recipient."}</p>
                                    <button
                                        onClick={() => setEmailSent(false)}
                                        className="text-emerald-600 font-bold hover:text-emerald-700"
                                    >
                                        {t.sendAnother || "Send Another"}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.recipientEmail || "Recipient Email"}</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="client@example.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                                        />
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-500">
                                        <p className="flex gap-2">
                                            <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
                                            <span>
                                                {t.emailInfo || "The client will receive an email with a secure link to view and download this invoice."}
                                                {!activeShare && (
                                                    <span className="block mt-2 text-slate-400 text-xs">
                                                        * {t.linkWillBeCreated || "A share link will be automatically created."}
                                                    </span>
                                                )}
                                            </span>
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleSendEmail}
                                        disabled={sendingEmail || !email}
                                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                    >
                                        {sendingEmail ? <i className="fas fa-spinner fa-spin"></i> : (
                                            <span className="flex items-center justify-center gap-2">
                                                <i className="fas fa-paper-plane"></i>
                                                {t.sendInvoice || "Send Invoice"}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Settings / Revoke (if active) - Only show in Link tab or if active logic fits, keeping it common might be good but let's stick to Link tab for management */}
                    {activeTab === 'link' && activeShare && (
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400">
                                {t.shareCreated || "Created"}: {new Date(activeShare.created_at).toLocaleDateString()}
                            </span>
                            <button
                                onClick={() => handleRevoke(activeShare.id)}
                                className="text-red-500 hover:text-red-600 text-sm font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <i className="fas fa-ban"></i> {t.revoke || "Revoke"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareDialog;
