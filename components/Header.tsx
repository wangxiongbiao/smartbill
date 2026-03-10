'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { createClient } from '@/lib/supabase/client';

export function Header() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<{ name?: string | null; email?: string | null; avatar?: string | null }>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isGoogleLoading, handleGoogleLogin } = useGoogleAuth({
    nextPath: '/dashboard',
    onSuccess: (target) => router.replace(target || '/dashboard'),
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const sessionUser = data.session?.user;
      setIsLoggedIn(!!sessionUser);
      setProfile({
        name: sessionUser?.user_metadata?.full_name ?? null,
        email: sessionUser?.email ?? null,
        avatar: sessionUser?.user_metadata?.avatar_url ?? null,
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const sessionUser = session?.user;
      setIsLoggedIn(!!sessionUser);
      setProfile({
        name: sessionUser?.user_metadata?.full_name ?? null,
        email: sessionUser?.email ?? null,
        avatar: sessionUser?.user_metadata?.avatar_url ?? null,
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setDropdownOpen(false);
      router.replace('/');
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl" data-purpose="navigation">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-3" href="/" aria-label="SmartBill home">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <i className="fas fa-file-invoice text-sm"></i>
            </div>
            <div className="leading-none">
              <div className="text-lg font-black tracking-tight text-slate-950">SmartBill</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Invoice workflow</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex text-sm font-semibold text-slate-600">
            <a className="transition-colors hover:text-slate-950" href="#features">Features</a>
            <a className="transition-colors hover:text-slate-950" href="#templates">Templates</a>
            <a className="transition-colors hover:text-slate-950" href="#audience">Who it’s for</a>
            <a className="transition-colors hover:text-slate-950" href="#faq">FAQ</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition-colors hover:bg-slate-50"
                aria-label="User menu"
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name ?? 'User'}
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {(profile.name || profile.email || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="hidden max-w-[130px] truncate text-sm font-semibold text-slate-700 sm:block">
                  {profile.name ?? profile.email}
                </span>
                <i className="fas fa-chevron-down text-xs text-slate-400"></i>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{profile.name ?? 'User'}</p>
                    <p className="truncate text-xs text-slate-400">{profile.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <i className="fas fa-table-columns text-sm"></i>
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <i className={`fas ${isLoggingOut ? 'fa-circle-notch fa-spin' : 'fa-right-from-bracket'}`}></i>
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/dashboard" className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 md:inline-flex">
                Live demo
              </Link>
              <button
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-70"
              >
                {isGoogleLoading ? 'Signing in...' : 'Start free'}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
