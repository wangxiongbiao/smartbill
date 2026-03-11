import type React from 'react';
import InvoicePreview from '@/components/InvoicePreview';
import type { Invoice, Language, TemplateType } from '@/types';

interface AppShellPrintAreaProps {
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed: boolean;
  lang: Language;
  printAreaRef: React.RefObject<HTMLDivElement | null>;
}

export default function AppShellPrintArea({
  invoice,
  template,
  isHeaderReversed,
  lang,
  printAreaRef,
}: AppShellPrintAreaProps) {
  return (
    <div className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1]">
      <div ref={printAreaRef} style={{ width: '210mm' }}>
        <InvoicePreview
          invoice={invoice}
          template={template}
          isHeaderReversed={isHeaderReversed}
          isForPdf={true}
          lang={lang}
        />
      </div>
    </div>
  );
}
