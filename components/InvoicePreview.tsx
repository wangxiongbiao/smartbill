import React from 'react';
import { Invoice, TemplateType, Language, InvoiceColumn, InvoiceItem } from '../types';
import { translations } from '../i18n';

interface InvoicePreviewProps {
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed?: boolean;
  isForPdf?: boolean;
  lang: Language;
}

const defaultColumns: InvoiceColumn[] = [
  { id: 'desc', field: 'description', label: 'Description', type: 'system-text', order: 0, visible: true, required: true },
  { id: 'qty', field: 'quantity', label: 'Quantity', type: 'system-quantity', order: 1, visible: true, required: true },
  { id: 'rate', field: 'rate', label: 'Rate', type: 'system-rate', order: 2, visible: true, required: true },
  { id: 'amt', field: 'amount', label: 'Amount', type: 'system-amount', order: 3, visible: true, required: true },
];

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  template,
  isHeaderReversed = false,
  isForPdf = false,
  lang
}) => {
  const t = translations[lang] || translations['en'];
  const subtotal = invoice.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
  const tax = subtotal * (invoice.taxRate / 100);
  const total = subtotal + tax;
  const currencyFormatter = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: invoice.currency,
  });

  const getTemplateStyles = () => {
    switch (template) {
      case 'minimalist':
        return {
          header: "border-b-4 border-slate-900 px-12 pb-10 pt-10",
          tableHeader: "bg-slate-50 text-slate-900 border-b border-slate-200",
          accentColor: "slate-900",
          signatureBorder: "border-slate-900"
        };
      case 'modern':
        return {
          header: "bg-indigo-600 text-white px-12 py-10 rounded-t-xl",
          tableHeader: "bg-indigo-50 text-indigo-700",
          accentColor: "indigo-600",
          signatureBorder: "border-indigo-600"
        };
      default:
        return {
          header: "bg-slate-800 text-white px-12 py-10",
          tableHeader: "bg-slate-100 text-slate-700",
          accentColor: "blue-600",
          signatureBorder: "border-slate-300"
        };
    }
  };

  const styles = getTemplateStyles();
  const docTitle = invoice.type === 'invoice' ? t.invoiceMode.split(' ')[0].toUpperCase() : t.receiptMode.split(' ')[0].toUpperCase();

  const columns = invoice.columnConfig || defaultColumns;
  const visibleColumns = columns.filter(col => col.visible).sort((a, b) => a.order - b.order);

  const renderCell = (item: InvoiceItem, column: InvoiceColumn) => {
    switch (column.type) {
      case 'system-text':
        return item.description || '...';
      case 'system-quantity':
        return item.quantity;
      case 'system-rate':
        return currencyFormatter.format(Number(item.rate));
      case 'system-amount':
        return currencyFormatter.format(Number(item.quantity) * Number(item.rate));
      case 'custom-text':
      case 'custom-number':
        return item.customValues?.[column.id] || '';
      default:
        return null;
    }
  };

  return (
    <div className={` ${isForPdf ? 'min-h-[296mm]' : 'min-h-[297mm]'} bg-white mx-auto text-slate-800 flex flex-col overflow-hidden`}>
      <div className={styles.header}>
        <div className={`flex justify-between items-start gap-6 ${isHeaderReversed ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-2xl font-black mb-1">{docTitle}</h1>
            {invoice.visibility?.invoiceNumber !== false && (
              <p className="opacity-80">#{invoice.invoiceNumber}</p>
            )}
          </div>
          <div className={`flex gap-2 ${isHeaderReversed ? 'flex-row text-left' : 'flex-row-reverse text-right'}`}>
            {invoice.sender.logo && <img src={invoice.sender.logo} alt="Logo" className="max-h-16 object-contain" />}
            <div>
              <h2 className="text-base font-bold">{invoice.sender.name || t.namePlaceholder}</h2>
              <p className="text-xs opacity-80 whitespace-pre-wrap">{invoice.sender.address}</p>
              {invoice.sender.customFields?.map(field => (
                <p key={field.id} className="text-xs opacity-80 mt-1">
                  <span className="font-semibold">{field.label}</span> {field.value}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-12 py-10 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">{t.billTo}</h3>
            <div className="border-l-4 border-slate-200 pl-4">
              <p className="font-bold text-base">{invoice.client.name || t.clientName}</p>
              <p className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{invoice.client.address}</p>
              {invoice.client.customFields?.map(field => (
                <p key={field.id} className="text-xs text-slate-500 mt-1">
                  <span className="font-semibold">{field.label}</span> {field.value}
                </p>
              ))}
            </div>
          </div>
          <div className="text-right">
            {invoice.visibility?.date !== false && (
              <>
                <p className="text-[10px] font-bold text-slate-400 mb-1">{lang === 'ja' ? '発行日' : (lang === 'en' ? 'Date' : '開具日期')}</p>
                <p className="text-sm font-medium mb-4">{invoice.date}</p>
              </>
            )}
            {(invoice.type === 'invoice' || (invoice.type === 'custom' && invoice.visibility?.dueDate !== false)) && (
              <>
                <p className="text-[10px] font-bold text-slate-400 mb-1">{lang === 'ja' ? '期限' : (lang === 'en' ? 'Due Date' : '截止日期')}</p>
                <p className={`text-sm font-bold text-${styles.accentColor}`}>{invoice.dueDate}</p>
              </>
            )}
          </div>
        </div>

        <table className="w-full text-left mb-8">
          <thead>
            <tr className={`${styles.tableHeader} text-[10px] font-bold`}>
              {visibleColumns.map(col => (
                <th key={col.id} className={`px-6 py-4 ${col.type === 'system-amount' ? 'text-right' : (col.type === 'system-quantity' || col.type === 'system-rate' ? 'text-center' : '')}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item) => (
              <tr key={item.id} className="text-xs">
                {visibleColumns.map(col => (
                  <td key={col.id} className={`px-6 py-4 ${col.type === 'system-amount' ? 'text-right font-bold' : (col.type === 'system-quantity' || col.type === 'system-rate' ? 'text-center' : 'font-medium')}`}>
                    {renderCell(item, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between pt-6 border-t border-slate-100 mt-auto">
          <div className="flex flex-col items-start">
            {invoice.visibility?.signature === true && (
              <>
                {invoice.sender.signature && (
                  <div className="mb-2">
                    <img src={invoice.sender.signature} alt="Signature" className="h-16 object-contain" />
                  </div>
                )}
                <div className={`border-t ${styles.signatureBorder} pt-2 min-w-[180px]`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.authorizedSignature}</p>
                  <p className="text-xs font-bold text-slate-900 mt-1">{invoice.sender.name}</p>
                </div>
              </>
            )}
          </div>

          <div className="w-64 space-y-2">
            <div className="flex justify-between text-slate-500 text-xs">
              <span>{lang === 'zh-TW' ? '小計' : 'Subtotal'}</span>
              <span>{currencyFormatter.format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>{t.taxRate} ({invoice.taxRate}%)</span>
              <span>{currencyFormatter.format(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>{t.total}</span>
              <span>{currencyFormatter.format(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        {(invoice.paymentInfo?.bankName || invoice.paymentInfo?.accountName || invoice.paymentInfo?.accountNumber || invoice.paymentInfo?.extraInfo || invoice.paymentInfo?.qrCode || (invoice.paymentInfo?.customFields && invoice.paymentInfo.customFields.length > 0)) && (
          <div className="mt-8 pt-4 border-t border-slate-100 relative">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t.paymentInfo}</h3>

            {/* QR Code Display - Absolutely positioned on the right */}
            {invoice.paymentInfo?.qrCode && (
              <div className="absolute top-4 right-0 w-32 h-32 border-2 border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <img
                  src={invoice.paymentInfo.qrCode}
                  alt="Payment QR Code"
                  className="w-full h-full object-contain p-2"
                />
              </div>
            )}

            <div className={`space-y-1 text-xs text-slate-600 ${invoice.paymentInfo?.qrCode ? 'pr-36' : ''}`}>
              {invoice.paymentInfo?.bankName && (
                <div className="flex justify-between sm:justify-start sm:gap-4">
                  <span className="font-medium text-slate-400 min-w-[100px]">{t.bankName}:</span>
                  <span className="font-bold text-slate-800">{invoice.paymentInfo.bankName}</span>
                </div>
              )}
              {invoice.paymentInfo?.accountName && (
                <div className="flex justify-between sm:justify-start sm:gap-4">
                  <span className="font-medium text-slate-400 min-w-[100px]">{t.accountName}:</span>
                  <span className="font-bold text-slate-800">{invoice.paymentInfo.accountName}</span>
                </div>
              )}
              {invoice.paymentInfo?.accountNumber && (
                <div className="flex justify-between sm:justify-start sm:gap-4">
                  <span className="font-medium text-slate-400 min-w-[100px]">{t.accountNumber}:</span>
                  <span className="font-bold text-slate-800 font-mono">{invoice.paymentInfo.accountNumber}</span>
                </div>
              )}
              {invoice.paymentInfo?.extraInfo && (
                <div className="flex justify-between sm:justify-start sm:gap-4">
                  <span className="font-medium text-slate-400 min-w-[100px]">{t.extraInfo}:</span>
                  <span className="font-bold text-slate-800 font-mono">{invoice.paymentInfo.extraInfo}</span>
                </div>
              )}
              {invoice.paymentInfo?.customFields?.map(field => (
                <div key={field.id} className="flex justify-between sm:justify-start sm:gap-4">
                  <span className="font-medium text-slate-400 min-w-[100px]">{field.label}:</span>
                  <span className="font-bold text-slate-800">{field.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-slate-50 text-center text-[10px] text-slate-300 uppercase tracking-widest">
        {t.poweredBy}
      </div>
    </div>
  );
};

export default InvoicePreview;
