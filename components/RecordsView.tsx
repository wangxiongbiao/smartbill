
import React, { useState } from 'react';
import { Invoice, Language } from '../types';
import { translations } from '../i18n';
import ShareDialog from './ShareDialog';

interface RecordsViewProps {
  records: Invoice[];
  onEdit: (record: Invoice) => void;
  onDelete: (id: string) => void;
  onExport: (record: Invoice) => void;
  lang: Language;
  onNewDoc: () => void;
}

const RecordsView: React.FC<RecordsViewProps> = ({ records, onEdit, onDelete, onExport, lang, onNewDoc }) => {
  const t = translations[lang] || translations['en'];
  const [shareInvoice, setShareInvoice] = useState<Invoice | null>(null);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <div className="bg-slate-100 w-28 h-28 rounded-[2rem] flex items-center justify-center text-slate-300 text-5xl mb-8 shadow-inner rotate-3">
          <i className="fas fa-folder-open"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.emptyTitle}</h2>
        <p className="text-slate-500 mt-3 text-lg font-medium">{t.emptySub}</p>
        <button
          className="mt-10 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          onClick={() => onNewDoc()}
        >
          {t.goToHome}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">Billing History</div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{t.history}</h1>
            <p className="text-slate-400 font-medium mt-3 text-lg">{t.manageRecords}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 border border-blue-100 px-6 py-3 rounded-2xl">
              <span className="text-blue-600 text-lg font-black">
                {t.totalCount.replace('{count}', records.length.toString())}
              </span>
            </div>
            <button
              onClick={() => onNewDoc()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 active:scale-95"
            >
              <i className="fas fa-plus-circle"></i>
              <span className="hidden sm:inline">{t.newInvoice}</span>
              <span className="sm:hidden">{t.newInvoiceShort}</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 hover:shadow-2xl hover:border-blue-100 transition-all group"
            >
              <div className="flex items-center gap-6 w-full lg:w-auto">
                <div className="bg-slate-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-slate-400 text-2xl group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all shadow-sm">
                  <i className="fas fa-file-invoice"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">{record.invoiceNumber}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${record.type === 'invoice' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                      {record.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-2"><i className="fas fa-user text-blue-400"></i> {record.client.name || 'Untitled Client'}</span>
                    <span className="flex items-center gap-2"><i className="fas fa-calendar-alt text-blue-400"></i> {record.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end pt-6 lg:pt-0 border-t lg:border-0 border-slate-100">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1 block">{t.amountTotal}</span>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    {new Intl.NumberFormat(lang, { style: 'currency', currency: record.currency }).format(
                      record.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0) * (1 + record.taxRate / 100)
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShareInvoice(record)}
                    className="w-12 h-12 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-500 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-90"
                    title="Share"
                  >
                    <i className="fas fa-share-alt text-sm"></i>
                  </button>
                  <button
                    onClick={() => onEdit(record)}
                    className="w-12 h-12 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-500 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-90"
                    title="Edit"
                  >
                    <i className="fas fa-edit text-sm"></i>
                  </button>
                  <button
                    onClick={() => onExport(record)}
                    className="w-12 h-12 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-90"
                    title="Download PDF"
                  >
                    <i className="fas fa-download text-sm"></i>
                  </button>
                  <button
                    onClick={() => onDelete(record.id)}
                    className="w-12 h-12 bg-red-50 hover:bg-red-600 hover:text-white text-red-500 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-90"
                    title="Delete"
                  >
                    <i className="fas fa-trash-alt text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {shareInvoice && (
        <ShareDialog
          invoice={shareInvoice}
          isOpen={true}
          onClose={() => setShareInvoice(null)}
          lang={lang}
        />
      )}
    </>
  );
};

export default RecordsView;
