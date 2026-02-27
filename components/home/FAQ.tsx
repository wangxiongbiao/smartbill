import React from 'react';

export function FAQ() {
    const faqs = [
        {
            question: 'What is an invoice?',
            answer: 'An invoice is a time-stamped commercial document that records a transaction between a buyer and a seller. If goods or services were purchased on credit, the invoice usually specifies the terms of the deal and provides information on the available methods of payment.',
        },
        {
            question: 'Is this invoice generator really free?',
            answer: 'Yes! You can create, download, and send a specific number of invoices for free. We also offer premium plans for advanced features like bulk creation and automated recurring billing.',
        },
        {
            question: 'Can I add my company logo?',
            answer: 'Absolutely. Our editor allows you to upload your logo and place it anywhere on the invoice to ensure your documents look professional and branded.',
        },
        {
            question: 'What file formats are supported?',
            answer: 'You can download your invoices as high-quality PDFs, which are compatible with virtually all devices and operating systems.',
        },
    ];

    return (
        <section className="bg-lightbg py-9 md:py-14" data-purpose="faq">
            <div className="max-w-3xl mx-auto px-6 sm:px-10">
                <div className="text-center mb-10">
                    <h2 className="text-xl md:text-2xl font-bold text-dark">Your questions, answered</h2>
                </div>
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <details key={index} className="group bg-white rounded-lg shadow-sm">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none px-6 py-5">
                                <span className="text-sm text-gray-800 font-semibold">{faq.question}</span>
                                <span className="transition group-open:rotate-180 shrink-0 ml-4">
                                    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><line x1="12" x2="12" y1="5" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line></svg>
                                </span>
                            </summary>
                            <div className="text-gray-500 px-6 pb-6 text-sm leading-relaxed">
                                {faq.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
