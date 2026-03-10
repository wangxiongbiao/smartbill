import React from 'react';

export function Resources() {
    const articles = [
        {
            tag: 'Guide',
            title: 'How to write an invoice',
            desc: 'Learn the essential elements every professional invoice needs.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy2D0YPYhtjV0YF_-UA6HcPf3krXByXj02TuMzoDpLIWyum475bRvG0fOWFVlSFSUnlmrxiUk8yHXYeEcg5H4cZWZYB28YS3wjjeyrV0vcFvM__ZkUF4K3LkW3EEec3PBTvmN0S5MMNodAIj9KrDAhCYpyYJ-LI_j0roXJqZ73NILyNxwvL5qzivGLktGfRZjNA6TuvRmN23R1SEx5MqwD6dbO3BJ8qTqS4kFxaaJmUXgBd63czhS1Mcqvng3zEf5EIo8khZo7CXk',
        },
        {
            tag: 'Tips',
            title: '5 tips for getting paid on time',
            desc: 'Actionable advice to improve your cash flow and reduce late payments.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqm9xrxDtZVRpdV2JbRlAgKE5LbJb40R021IJz1_1lt76yPtipJUyZ5zF16mCC3H4EPUqmKDG3CUoNWwXMUzFxHipUW9RuqQdQQsi0BOjHdfgJRlT7T1SEi2PgXS4YLqwanXpJI9D39DesctK-_5X362Ly15d52UlXC4yJqhEhFcSWkeyU1TXEg3gSnkmD0tsMVppmNnmZJnS2KFtHI_qhr8_MRXGW2MCj_6iwkQfcYXsOmpHSIzDnm-9-K4WNyxhF8AzQ8MF5ihc',
        },
        {
            tag: 'Freelancing',
            title: 'Invoicing for freelancers 101',
            desc: 'Everything you need to know about billing clients as a freelancer.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTYw3EyaYjLlhWIT8658mFKYzQWSLcQwt40cTPokZckSacqrhMOIA_ojdW4k3Aj-bXPq8pEP6nyJkhSAktpHtZIaH4jNMGes57YMF_RKL7AStiHvhbt93B82pgrVuKJY6Z5NyGmqMvwY9bChJtsbuOp-F37HVEcA6X4ErCZiw-KK7d1V6zbeGzR1Mhph-71qoCVENXKx1F__HpOcHlpGfZm9dAe6SdqHfMxekC5YFd22AYupQVu50GQt-ongq1CIQHKUybEBSjqk',
        },
    ];

    return (
        <>
            {/* BEGIN: Resources */}
            <section className="bg-white py-14 md:py-20" data-purpose="blog-resources">
                <div className="px-4 sm:px-6">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark tracking-tight">More resources</h2>
                        <a className="text-primary font-bold text-base hover:underline hidden md:block" href="#">See all articles</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {articles.map((item, index) => (
                            <div key={index} className="group cursor-pointer">
                                <div className="rounded-2xl overflow-hidden mb-5">
                                    <img alt="Blog thumbnail" className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300" src={item.image} />
                                </div>
                                <span className="text-sm font-bold text-purple-600 uppercase tracking-widest">{item.tag}</span>
                                <h3 className="text-xl font-bold text-slate-900 mt-2 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                <p className="text-slate-600 text-base leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 md:hidden text-center">
                        <a className="text-primary font-bold text-base hover:underline" href="#">See all articles</a>
                    </div>
                </div>
            </section>
            {/* END: Resources */}

            {/* BEGIN: MoreProducts */}
            <section className="bg-gray-50 border-t border-gray-100 py-12 md:py-14" data-purpose="product-discovery">
                <div className="px-4 sm:px-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-dark mb-10 text-center md:text-left tracking-tight">Discover more products</h2>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                        <a className="group block text-center" href="#">
                            <div className="rounded-xl overflow-hidden shadow-sm mb-3 aspect-square bg-white border border-gray-100 group-hover:shadow-md transition-all">
                                <img alt="Newsletters" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-II_B3rCmCPZb4qe_CTxIn7aE2bvst7sU9qAKXUo9wZw2iKOASMj_z5T0MbbahE5A7EA-MASRVG-N-Hq2ImWvD9hORffFdfi8kB3Oz1GOStlwuemFDhKlpDMa7CF0ezTpP6CnnigKpkh7nyW_pTkY8sWWkyImRPWmemTBmQaqARnIxV7stpOKftIdw3aeF2gfwKzZCdaCwGV_7v2CweXYu0HALJehMIrMY1NIZOLNQNloC6zx-giy236HUfswOCWimezRASJyMVY" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary">Newsletters</span>
                        </a>
                        <a className="group block text-center" href="#">
                            <div className="rounded-xl overflow-hidden shadow-sm mb-3 aspect-square bg-white border border-gray-100 group-hover:shadow-md transition-all">
                                <img alt="Business Cards" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2GY-dB6Z8WLbwQY-Y_-wfdEs-3m-a8GsaIyT1DcGrZ9Wifzu_VRfftk9PH6X0c4JjrKs5s1Qsjm3h28FEe43hawp-lvtdjYZHOo_8R7rgjbepmt2OfTgKPsnWd_MC311UMWYv0jx6kYsvs21ttru8aM6ItDi2rqGH7m2zNyQG2bygd1OcWRqDIkw65h8tXyCde7-NXuXl2amZW1NUck94YpfCk-x4BeCbHp82vl_zkjn8KO_507MBNnJdO4b3ykrVVnOJ4KvOkxU" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary">Business Cards</span>
                        </a>
                        <a className="group block text-center" href="#">
                            <div className="rounded-xl overflow-hidden shadow-sm mb-3 aspect-square bg-white border border-gray-100 group-hover:shadow-md transition-all">
                                <img alt="Presentations" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf5t9YVhRwtOv8zRKILkDrPhRNLTIaiW2r0wOtA2KDIkp0bbyWPOl-3AC3ji4507hbDX261n-GcCwAGUjt_kYXb8-lrufHuaM4BvE0OxxSjryAmWpvUtKx5fp5aBjACN3Y2Fn0qF2F_dWgBkwpyx86VltCgsdVczHOygKxuJhlFwXLacqnKxoBF9vzUA7jc8Ux8g85WCbu6or2SO56Kj8vy3ALjtHy9BvgGhFaqVeLc5PUiWjCCz9wYBX2MD9-_kdLqzshf53o6yE" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary">Presentations</span>
                        </a>
                        <a className="group block text-center" href="#">
                            <div className="rounded-xl overflow-hidden shadow-sm mb-3 aspect-square bg-white border border-gray-100 group-hover:shadow-md transition-all flex items-center justify-center">
                                <span className="text-gray-300 text-sm font-medium">Img</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary">Flyers</span>
                        </a>
                        <a className="group block text-center" href="#">
                            <div className="rounded-xl overflow-hidden shadow-sm mb-3 aspect-square bg-white border border-gray-100 group-hover:shadow-md transition-all flex items-center justify-center">
                                <span className="text-gray-300 text-sm font-medium">Img</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary">Logos</span>
                        </a>
                        <a className="group block text-center" href="#">
                            <div className="rounded-xl overflow-hidden shadow-sm mb-3 aspect-square bg-white border border-gray-100 group-hover:shadow-md transition-all flex items-center justify-center">
                                <span className="text-gray-300 text-sm font-medium">Img</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary">Resumes</span>
                        </a>
                    </div>
                </div>
            </section>
            {/* END: MoreProducts */}
        </>
    );
}
