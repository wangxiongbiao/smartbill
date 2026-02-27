import React from 'react';

export function TemplatesGallery() {
    const templates = [
        { title: 'Minimal Blue Invoice', id: 1 },
        { title: 'Corporate Modern', id: 2 },
        { title: 'Creative Freelancer', id: 3 },
        { title: 'Simple Clean', id: 4 },
        { title: 'Bold Business', id: 5 },
        { title: 'Elegant Minimal', id: 6 },
        { title: 'Retro Style', id: 7 },
        { title: 'Tech Startup', id: 8 },
        { title: 'Classic Pro', id: 9 },
        { title: 'Modern Dark', id: 10 },
        { title: 'Pink Studio', id: 11 },
        { title: 'Dark Invoice', id: 12 },
    ];

    return (
        <section className="bg-white py-9 md:py-14" data-purpose="templates">
            <div className="mx-auto px-6 sm:px-10 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-dark tracking-tight">Start inspired with free invoice templates</h2>
                <p className="text-slate-500 text-base mb-7">Browse our collection of professionally designed templates.</p>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2.5 mb-9">
                    <button className="px-5 py-2.5 rounded-full bg-dark text-white font-semibold text-sm">All Templates</button>
                    <button className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-colors">Business</button>
                    <button className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-colors">Freelance</button>
                    <button className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-colors">Commercial</button>
                    <button className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-colors">Simple</button>
                </div>

                {/* Grid - 6 columns on large, 4 on md, matching screenshot density */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                    {templates.map((tpl) => (
                        <div key={tpl.id} className="group cursor-pointer">
                            <div className="rounded-xl overflow-hidden border border-gray-200 aspect-[3/4] mb-3 bg-gray-50 hover:shadow-md transition-all flex items-center justify-center">
                                {/* <img src="/template_split_view.png" alt={`${tpl.title} Preview`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> */}
                            </div>
                            <h3 className="text-sm font-semibold text-slate-700 group-hover:text-primary leading-tight">{tpl.title}</h3>
                        </div>
                    ))}
                </div>
                <div className="mt-10">
                    <button className="text-primary font-bold text-sm hover:underline">View all invoice templates →</button>
                </div>
            </div>
        </section>
    );
}
