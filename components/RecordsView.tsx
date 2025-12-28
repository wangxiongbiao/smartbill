
import React from 'react';
import { Invoice } from '../types';

interface RecordsViewProps {
  records: Invoice[];
  onEdit: (record: Invoice) => void;
  onDelete: (id: string) => void;
  onExport: (record: Invoice) => void;
}

const RecordsView: React.FC<RecordsViewProps> = ({ records, onEdit, onDelete, onExport }) => {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center text-slate-300 text-4xl mb-6 shadow-inner">
          <i className="fas fa-folder-open"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">暂无记录</h2>
        <p className="text-slate-500 mt-2">开始制作发票，记录将显示在这里。</p>
        <button className="mt-6 text-blue-600 font-bold hover:underline">去首页看看模版</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">历史记录</h1>
          <p className="text-slate-400 text-sm mt-1">管理您已生成的发票和账单</p>
        </div>
        <div className="text-right">
          <span className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-black shadow-lg shadow-blue-100">
            共 {records.length} 份
          </span>
        </div>
      </div>

      <div className="grid gap-5">
        {records.map((record) => (
          <div 
            key={record.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:shadow-xl hover:border-blue-100 transition-all group"
          >
            <div className="flex items-center gap-5 w-full sm:w-auto">
              <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center text-slate-400 text-2xl group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <i className="fas fa-file-invoice"></i>
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-900 text-lg">{record.invoiceNumber}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1.5"><i className="fas fa-user text-[10px]"></i> {record.client.name || '未命名客户'}</span>
                  <span className="flex items-center gap-1.5"><i className="fas fa-calendar-alt text-[10px]"></i> {record.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
              <div className="text-right mr-6">
                <p className="text-xl font-black text-slate-900 tracking-tight">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: record.currency }).format(
                    record.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0) * (1 + record.taxRate / 100)
                  )}
                </p>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">账单总额</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(record)}
                  className="w-10 h-10 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-500 rounded-xl transition-all flex items-center justify-center"
                  title="编辑"
                >
                  <i className="fas fa-edit text-sm"></i>
                </button>
                <button 
                  onClick={() => onExport(record)}
                  className="w-10 h-10 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl transition-all flex items-center justify-center"
                  title="下载 PDF"
                >
                  <i className="fas fa-download text-sm"></i>
                </button>
                <button 
                  onClick={() => onDelete(record.id)}
                  className="w-10 h-10 bg-red-50 hover:bg-red-600 hover:text-white text-red-500 rounded-xl transition-all flex items-center justify-center"
                  title="删除"
                >
                  <i className="fas fa-trash-alt text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordsView;
