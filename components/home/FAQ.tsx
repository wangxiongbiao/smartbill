import React from 'react';

export function FAQ() {
  const faqs = [
    {
      question: 'What does SmartBill do?',
      answer: 'SmartBill is a web-based invoice generator for freelancers and small businesses. You can create invoices, reuse templates, manage billing records, and export PDFs from one workflow.',
    },
    {
      question: 'Can I add my logo and payment details?',
      answer: 'Yes. SmartBill supports branding elements like logo placement as well as payment information blocks, notes, and QR-based payment instructions.',
    },
    {
      question: 'Can I reuse a previous invoice as a template?',
      answer: 'Yes. SmartBill includes template workflows so you can save a good invoice setup and start the next one from the same structure.',
    },
    {
      question: 'Does SmartBill export invoice PDFs?',
      answer: 'Yes. The product is designed to generate polished invoices that can be exported as PDF documents for client delivery and record keeping.',
    },
    {
      question: 'Who is SmartBill best for?',
      answer: 'It is best for freelancers, contractors, agencies, consultants, and small service businesses that need fast billing without complex accounting software.',
    },
  ];

  return (
    <section id="faq" className="bg-white py-14 md:py-20" data-purpose="faq">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-600">
            <i className="fas fa-circle-question"></i>
            FAQ
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Questions people actually ask before trying an invoice tool</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">These answers also reinforce the search terms and workflows your current product already supports.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group rounded-[24px] border border-slate-200 bg-slate-50 p-0 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5">
                <span className="pr-4 text-left text-base font-black text-slate-900">{faq.question}</span>
                <span className="ml-4 shrink-0 text-slate-400 transition-transform group-open:rotate-45">
                  <i className="fas fa-plus"></i>
                </span>
              </summary>
              <div className="px-6 pb-6 text-sm leading-7 text-slate-600">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
