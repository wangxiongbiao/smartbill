import React from 'react';

export function Footer() {
    return (
        <footer className="border-t border-gray-200 pt-8 pb-4" data-purpose="footer" style={{ backgroundColor: '#FAFAFA', color: '#333333' }}>
            <div className="px-4 sm:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-1">
                        <a className="text-2xl font-extrabold text-primary tracking-tight block mb-6" href="/">Invoicefiy</a>
                        <select className="form-select block w-full mt-1 border-gray-300 rounded-lg shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-base py-2">
                            <option>English (US)</option>
                            <option>Español</option>
                            <option>Français</option>
                        </select>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 text-lg">Features</h4>
                        <ul className="space-y-3 text-base text-gray-500 font-medium">
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/invoice/new">Invoice editor</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/dashboard">Invoice dashboard</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/dashboard/templates">Template center</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#faq">FAQ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 text-lg">Workflow</h4>
                        <ul className="space-y-3 text-base text-gray-500 font-medium">
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/invoice/new">Create invoice</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/dashboard">Track drafts</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/dashboard/templates">Reuse templates</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/">Preview online</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 text-lg">Support</h4>
                        <ul className="space-y-3 text-base text-gray-500 font-medium">
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#faq">Help center</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#features">Product overview</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/dashboard/templates">Template examples</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/dashboard">Workspace</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 text-lg">Company</h4>
                        <ul className="space-y-3 text-base text-gray-500 font-medium">
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/">About</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/">Contact</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/">Privacy</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="/">Terms</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-base text-gray-500 font-medium">
                    <p>© 2026 Invoicefiy. All rights reserved.</p>
                    <div className="flex space-x-8 mt-4 md:mt-0">
                        <a className="hover:text-gray-900 transition-colors" href="/">Privacy</a>
                        <a className="hover:text-gray-900 transition-colors" href="/">Terms</a>
                        <a className="hover:text-gray-900 transition-colors" href="/">Accessibility</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
