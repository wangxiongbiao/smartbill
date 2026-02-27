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
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Curved text generator</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Photo effects</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Image enhancer</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Add text to photos</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 text-lg">Explore</h4>
                        <ul className="space-y-3 text-base text-gray-500 font-medium">
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Design ideas</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Custom prints</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Font pairing</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Colors</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 text-lg">Community</h4>
                        <ul className="space-y-3 text-base text-gray-500 font-medium">
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Online communities</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Creators</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Canva Represent</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Developers</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 text-lg">Company</h4>
                        <ul className="space-y-3 text-base text-gray-500 font-medium">
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">About</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Newsroom</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Careers</a></li>
                            <li><a className="hover:text-primary transition-colors hover:underline" href="#">Sustainability</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-base text-gray-500 font-medium">
                    <p>© 2023 All Rights Reserved.</p>
                    <div className="flex space-x-8 mt-4 md:mt-0">
                        <a className="hover:text-gray-900 transition-colors" href="#">Privacy</a>
                        <a className="hover:text-gray-900 transition-colors" href="#">Terms</a>
                        <a className="hover:text-gray-900 transition-colors" href="#">Accessibility</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
