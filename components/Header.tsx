import React from 'react';

export function Header() {
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
                            <a className="hover:text-primary transition-colors" href="#features">Features</a>
                            <a className="hover:text-primary transition-colors" href="#templates">Templates</a>
                            <a className="hover:text-primary transition-colors" href="#pricing">Pricing</a>
                            <a className="hover:text-primary transition-colors" href="#faq">FAQ</a>
                        </nav>
                    </div>
                    {/* Secondary Nav (Auth) */}
                    <div className="flex items-center gap-4">
                        <button className="text-base font-bold text-slate-700 hover:bg-slate-100 px-5 py-2.5 rounded-lg transition-colors">Log in</button>
                        <button className="bg-primary hover:bg-primary-hover px-6 py-2.5 rounded-lg font-bold text-base text-white transition-colors">Sign up</button>
                    </div>
                </div>
            </div>
        </header>
    );
}
