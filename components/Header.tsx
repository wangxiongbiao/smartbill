'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

export function Header() {
    const { user, logout, openLoginModal, isLoggingOut } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <header className="fixed w-full top-0 z-50 bg-white border-b border-gray-100" data-purpose="navigation">
            <div className="px-4 sm:px-6">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Primary Nav */}
                    <div className="flex items-center gap-10">
                        <a className="text-2xl font-extrabold text-primary tracking-tight flex items-center gap-2" href="/">
                            <img src="/logo.png" alt="Invoicefiy Logo" className="h-8 w-8 object-contain rounded-md" />
                            Invoicefiy
                        </a>
                        <nav className="hidden md:flex space-x-8 text-base font-semibold text-slate-600">
                            <a className="hover:text-primary transition-colors" href="#features">功能</a>
                            <a className="hover:text-primary transition-colors" href="#templates">模板</a>
                            <a className="hover:text-primary transition-colors" href="#pricing">價格</a>
                            <a className="hover:text-primary transition-colors" href="#faq">常見問題</a>
                        </nav>
                    </div>

                    {/* Secondary Nav (Auth) */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            /* Logged-in: Avatar + Dropdown */
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen((o) => !o)}
                                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                    aria-label="User menu"
                                >
                                    <img
                                        src={user.user_metadata?.avatar_url ?? ''}
                                        alt={user.user_metadata?.full_name ?? 'User'}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow"
                                        referrerPolicy="no-referrer"
                                    />
                                    <span className="text-sm font-semibold text-slate-700 hidden sm:block max-w-[130px] truncate">
                                        {user.user_metadata?.full_name ?? user.email}
                                    </span>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-400">
                                        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                {/* Dropdown */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50"
                                        style={{ animation: 'dropdownSlide 0.15s ease-out' }}>
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{user.user_metadata?.full_name ?? 'User'}</p>
                                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setDropdownOpen(false)}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            控制台
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                // We don't close the dropdown immediately if we want to show loading inside it,
                                                // or we can close it and show a global loader. 
                                                // Let's keep it open or show a dedicated UI.
                                                await logout();
                                            }}
                                            disabled={isLoggingOut}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-500 font-medium hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoggingOut ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    正在登出...
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    登出
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Logged-out: Single Log In button */
                            <button
                                onClick={openLoginModal}
                                className="bg-primary hover:bg-primary-hover px-6 py-2.5 rounded-lg font-bold text-base text-white transition-colors cursor-pointer"
                            >
                                登入
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </header>
    );
}
