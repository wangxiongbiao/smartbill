
import React from 'react';
import { Invoice, TemplateType } from '../types';

interface InvoicePreviewProps {
  invoice: Invoice;
  template: TemplateType;
  isHeaderReversed?: boolean;
  isForPdf?: boolean;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  template, 
  isHeaderReversed = false,
  isForPdf = false 
}) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const tax = subtotal * (invoice.taxRate / 100);
  const total = subtotal + tax;
  const currencyFormatter = new Intl.NumberFormat('zh-CN', {
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
  const docTitle = invoice.type === 'invoice' ? '发票 (INVOICE)' : '收据 (RECEIPT)';

  return (
    <div className={`w-[210mm] ${isForPdf ? 'min-h-[296mm]' : 'min-h-[297mm]'} bg-white mx-auto text-slate-800 flex flex-col overflow-hidden`}>
      <div className={styles.header}>
        <div className={`flex justify-between items-start ${isHeaderReversed ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-4xl font-black mb-1">{docTitle}</h1>
            <p className="opacity-80">单号：#{invoice.invoiceNumber}</p>
          </div>
          <div className={`flex flex-col ${isHeaderReversed ? 'items-start text-left' : 'items-end text-right'}`}>
            {invoice.sender.logo && <img src={invoice.sender.logo} alt="Logo" className="max-h-16 mb-4 object-contain" />}
            <h2 className="text-xl font-bold">{invoice.sender.name || '您的企业名称'}</h2>
            <p className="text-sm opacity-80 whitespace-pre-wrap">{invoice.sender.address}</p>
          </div>
        </div>
      </div>

      <div className="px-12 py-10 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">客户信息</h3>
            <div className="border-l-4 border-slate-200 pl-4">
              <p className="font-bold text-lg">{invoice.client.name || '客户名称'}</p>
              <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{invoice.client.address || '客户地址'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 mb-1">开具日期</p>
            <p className="font-medium mb-4">{invoice.date}</p>
            {invoice.type === 'invoice' && (
              <>
                <p className="text-xs font-bold text-slate-400 mb-1">截止日期</p>
                <p className={`font-bold text-${styles.accentColor}`}>{invoice.dueDate}</p>
              </>
            )}
          </div>
        </div>

        <table className="w-full text-left mb-8">
          <thead>
            <tr className={`${styles.tableHeader} text-xs font-bold uppercase`}>
              <th className="px-6 py-4">项目描述</th>
              <th className="px-6 py-4 text-center">数量</th>
              <th className="px-6 py-4 text-center">单价</th>
              <th className="px-6 py-4 text-right">金额</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 font-medium">{item.description || '业务内容'}</td>
                <td className="px-6 py-4 text-center">{item.quantity}</td>
                <td className="px-6 py-4 text-center">{currencyFormatter.format(item.rate)}</td>
                <td className="px-6 py-4 text-right font-bold">{currencyFormatter.format(item.quantity * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between pt-6 border-t border-slate-100">
          {/* Signature Area */}
          <div className="flex flex-col items-start">
            {invoice.sender.signature && (
              <div className="mb-2">
                <img src={invoice.sender.signature} alt="Signature" className="h-16 object-contain" />
              </div>
            )}
            <div className={`border-t ${styles.signatureBorder} pt-2 min-w-[180px]`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signature</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{invoice.sender.name}</p>
            </div>
          </div>

          <div className="w-64 space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>小计</span>
              <span>{currencyFormatter.format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>税额 ({invoice.taxRate}%)</span>
              <span>{currencyFormatter.format(tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>总计</span>
              <span>{currencyFormatter.format(total)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-auto pt-10">
            <h3 className="text-xs font-bold text-slate-400 mb-1">备注说明</h3>
            <p className="text-xs text-slate-500 italic whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-slate-50 text-center text-[10px] text-slate-300 uppercase tracking-widest">
        Powered by SmartBill Pro
      </div>
    </div>
  );
};

export default InvoicePreview;
