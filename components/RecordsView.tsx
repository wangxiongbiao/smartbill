import React, { useState, useMemo } from 'react';
import { Invoice, Language } from '../types';
import { translations } from '../i18n';
import ShareDialog from './ShareDialog';
import EmailDialog from './EmailDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface RecordsViewProps {
  records: Invoice[];
  onEdit: (record: Invoice) => void;
  onDelete: (id: string) => void;
  onExport: (record: Invoice) => void;
  lang: Language;
  onNewDoc: () => void;
  isDeletingId?: string | null;
}

const RecordsView: React.FC<RecordsViewProps> = ({ records, onEdit, onDelete, onExport, lang, onNewDoc, isDeletingId }) => {
  const t = translations[lang] || translations['en'];
  const [shareInvoice, setShareInvoice] = useState<Invoice | null>(null);
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
  const [deleteInvoice, setDeleteInvoice] = useState<Invoice | null>(null);

  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [searchQuery, setSearchQuery] = useState('');

  // Filter & Pagination Logic
  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const lowerQuery = searchQuery.toLowerCase();
    return records.filter(record =>
      record.invoiceNumber.toLowerCase().includes(lowerQuery) ||
      record.client.name.toLowerCase().includes(lowerQuery)
    );
  }, [records, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, filteredRecords.length);

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
      <div className="px-6 py-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-4">
          {/* <h1 className="text-3xl font-black text-slate-900 tracking-tight">Records</h1> */}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => onNewDoc()}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
            >
              <i className="fas fa-plus-circle"></i>
              <span>{t.newInvoice || 'Create New'}</span>
            </button>

            <div className="flex w-full sm:w-auto items-center gap-3">
              <div className="relative flex-1 sm:w-80">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                />
              </div>
              <button className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
                <i className="fas fa-filter text-xs"></i>
                <span>{t.filter}</span>
              </button>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="flex flex-col gap-4">
          {currentRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col xl:flex-row items-center gap-6 xl:gap-0 hover:shadow-lg transition-all group"
            >
              {/* Col 1: Client */}
              <div className="flex items-center gap-4 w-full xl:w-[30%]">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <i className="fas fa-building"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t.colClient || 'CLIENT'}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base truncate">{record.client.name || 'Untitled Client'}</span>
                  </div>
                </div>
              </div>

              {/* Col 2: Amount */}
              <div className="flex flex-col w-full xl:w-[20%] pl-0 xl:pl-4 border-l-0 xl:border-l border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.colAmount || 'TOTAL AMOUNT'}</span>
                <div className="flex items-end gap-1">
                  <span className="text-xs font-bold text-slate-400 mb-0.5">{record.currency}</span>
                  <span className="font-black text-slate-900 text-lg leading-none">
                    {new Intl.NumberFormat(lang, { style: 'decimal', minimumFractionDigits: 2 }).format(
                      record.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0) * (1 + record.taxRate / 100)
                    )}
                  </span>
                </div>
              </div>

              {/* Col 3: Invoice Number */}
              <div className="flex flex-col w-full xl:w-[20%]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.invoiceBadge || 'INVOICE'}</span>
                <span className="font-bold text-slate-700 text-base tracking-tight">{record.invoiceNumber}</span>
              </div>

              {/* Col 4: Date */}
              <div className="flex flex-col w-full xl:w-[15%]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.colDate || 'ISSUE DATE'}</span>
                <div className="flex items-center gap-2">
                  <i className="fas fa-calendar text-slate-300 text-xs"></i>
                  <span className="font-bold text-slate-700 text-sm">{record.date}</span>
                </div>
              </div>

              {/* Col 5: Actions */}
              <div className="flex items-center gap-2 w-full xl:w-[15%] justify-end">
                <button onClick={() => setShareInvoice(record)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors">
                  <i className="fas fa-share-alt text-xs"></i>
                </button>
                <button onClick={() => setEmailInvoice(record)} className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-colors">
                  <i className="fas fa-envelope text-xs"></i>
                </button>
                <button onClick={() => onEdit(record)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-600 hover:text-white flex items-center justify-center transition-colors">
                  <i className="fas fa-pen text-xs"></i>
                </button>
                <button onClick={() => onExport(record)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors">
                  <i className="fas fa-download text-xs"></i>
                </button>
                <button
                  onClick={() => {
                    if (isDeletingId === record.id) return;
                    setDeleteInvoice(record);
                  }}
                  disabled={isDeletingId === record.id}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDeletingId === record.id ? 'bg-red-100 text-red-500' : 'bg-red-50 text-red-500 hover:bg-red-600 hover:text-white'
                    }`}
                >
                  <i className={`fas ${isDeletingId === record.id ? 'fa-spinner fa-spin' : 'fa-trash'} text-xs`}></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        {filteredRecords.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1">

              <span className="text-[16px]  text-slate-500">
                {t.showingRecords
                  .replace('{start}', startRecord.toString())
                  .replace('{end}', endRecord.toString())
                  .replace('{count}', filteredRecords.length.toString())
                }
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
              >
                <i className="fas fa-chevron-left text-xs"></i>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm transition-all ${currentPage === page
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
              >
                <i className="fas fa-chevron-right text-xs"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {shareInvoice && (
        <ShareDialog
          invoice={shareInvoice}
          isOpen={true}
          onClose={() => setShareInvoice(null)}
          lang={lang}
        />
      )}

      {emailInvoice && (
        <EmailDialog
          invoice={emailInvoice}
          isOpen={true}
          onClose={() => setEmailInvoice(null)}
          lang={lang}
        />
      )}

      {deleteInvoice && (
        <DeleteConfirmDialog
          isOpen={true}
          onClose={() => setDeleteInvoice(null)}
          onConfirm={() => {
            onDelete(deleteInvoice.id);
            setDeleteInvoice(null);
          }}
          title={t.deleteDialogTitle}
          description={t.deleteDialogDescription}
          confirmText={t.deleteDialogConfirm}
          cancelText={t.deleteDialogCancel}
          isDeleting={isDeletingId === deleteInvoice.id}
          itemName={deleteInvoice.invoiceNumber}
        />
      )}

      {/* Full-page Deletion Loading Overlay */}
      {isDeletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-6 animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="relative">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 text-3xl">
                <i className="fas fa-trash-alt animate-bounce"></i>
              </div>
              <div className="absolute inset-0 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin"></div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t.deleting}</h3>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">{t.deleteSuccess ? 'Processing...' : 'Syncing with cloud...'}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default RecordsView;
