'use client';

import React, { useEffect, useCallback } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

function parseJwt(token: string): Record<string, string> {
    try {
        const base64 = token.split('.')[1];
        return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return {};
    }
}

function ModalContent() {
    const { closeLoginModal, login } = useAuth();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') closeLoginModal();
    }, [closeLoginModal]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    // Get user info using access token
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await res.json();
                login({
                    sub: userInfo.sub || '',
                    name: userInfo.name || '',
                    email: userInfo.email || '',
                    picture: userInfo.picture || '',
                });
            } catch {
                // fallback: just close
                closeLoginModal();
            }
        },
        onError: () => {
            // silent fail
        },
    });

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[6px]"
                onClick={closeLoginModal}
                aria-hidden="true"
            />

            {/* Modal Card */}
            <div
                className="relative z-10 w-full max-w-md"
                style={{ animation: 'slideUp 0.25s ease-out' }}
            >
                <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6">

                    {/* Close Button */}
                    <button
                        onClick={closeLoginModal}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
                        aria-label="Close"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-2">
                        <img src="/logo.png" alt="Invoicefiy" className="h-9 w-9 object-contain rounded-lg" />
                        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Invoicefiy</span>
                    </div>

                    {/* Headline */}
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h2>
                        <p className="text-sm text-slate-500">Sign in to create and manage your invoices</p>
                    </div>

                    {/* Divider */}
                    <div className="w-full border-t border-slate-100" />

                    {/* Google Sign In Button */}
                    <button
                        onClick={() => googleLogin()}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-base px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]"
                    >
                        {/* Google Logo SVG */}
                        <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                            <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.8 20-21 0-1.4-.2-2.7-.5-4z" fill="#FFC107" />
                            <path d="M6.3 14.7l7 5.1C15.2 15.7 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 16.3 3 9.6 7.9 6.3 14.7z" fill="#FF3D00" />
                            <path d="M24 45c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.6C29.8 35.9 27 37 24 37c-5.7 0-10.6-3.1-11.7-7.5l-7 5.4C8.5 41.7 15.7 45 24 45z" fill="#4CAF50" />
                            <path d="M44.5 20H24v8.5h11.8c-1 2.9-2.9 5.2-5.3 6.8l6.6 5.6C41.2 37.4 45 31.2 45 24c0-1.4-.2-2.7-.5-4z" fill="#1976D2" />
                        </svg>
                        Sign in with Google
                    </button>

                    {/* Privacy note */}
                    <p className="text-xs text-slate-400 text-center">
                        By signing in, you agree to our{' '}
                        <a href="#" className="underline hover:text-slate-600 transition-colors">Terms</a>{' '}
                        and{' '}
                        <a href="#" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>.
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] { animation: none !important; }
        }
      `}</style>
        </div>
    );
}

export function LoginModal() {
    const { isLoginModalOpen } = useAuth();

    if (!isLoginModalOpen) return null;

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <ModalContent />
        </GoogleOAuthProvider>
    );
}
