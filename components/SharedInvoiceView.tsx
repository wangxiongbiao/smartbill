
import React, { ForwardedRef } from 'react';
import { Invoice, Language } from '../types';
import { translations } from '../i18n';

interface SharedInvoiceViewProps {
    data: Invoice;
    lang: Language;
}

import InvoicePreview from './InvoicePreview';
interface SharedInvoiceViewProps {
    data: Invoice;
    lang: Language;
}

const SharedInvoiceView = React.forwardRef(({ data, lang }: SharedInvoiceViewProps, ref: ForwardedRef<HTMLDivElement>) => {
    const t = translations[lang] || translations['en'];

    return (
        <div ref={ref} className="bg-white shadow-xl rounded-none sm:rounded-[2.5rem] overflow-hidden print:shadow-none print:rounded-none min-h-[800px] relative">


            {/* Reuse the exact same preview component for 1:1 match */}
            <InvoicePreview
                invoice={data}
                template={data.template || 'professional'}
                isHeaderReversed={data.isHeaderReversed || false}
                lang={lang}
                isForPdf={false} // Ensure it looks like the web preview
            />

        </div>
    );
});

SharedInvoiceView.displayName = 'SharedInvoiceView';

export default SharedInvoiceView;
