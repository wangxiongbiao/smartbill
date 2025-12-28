
import React, { useRef, useState, useEffect } from 'react';
import { Invoice, InvoiceItem, DocumentType } from '../types';

interface InvoiceFormProps {
  invoice: Invoice;
  onChange: (updates: Partial<Invoice>) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 初始化画板
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange({ sender: { ...invoice.sender, signature: canvas.toDataURL() } });
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      onChange({ sender: { ...invoice.sender, signature: undefined } });
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      rate: 0
    };
    onChange({ items: [...invoice.items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    const newItems = invoice.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    onChange({ items: newItems });
  };

  const removeItem = (id: string) => {
    onChange({ items: invoice.items.filter(item => item.id !== id) });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ sender: { ...invoice.sender, logo: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Document Type Toggle */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        {(['invoice', 'receipt'] as DocumentType[]).map((type) => (
          <button
            key={type}
            onClick={() => onChange({ type })}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              invoice.type === type 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {type === 'invoice' ? '发票模式' : '收据模式'}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">{invoice.type === 'invoice' ? '发票编号' : '收据编号'}</label>
          <input 
            type="text" 
            value={invoice.invoiceNumber}
            onChange={(e) => onChange({ invoiceNumber: e.target.value })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">货币单位</label>
          <select 
            value={invoice.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="CNY">人民币 (¥)</option>
            <option value="USD">美元 ($)</option>
            <option value="EUR">欧元 (€)</option>
          </select>
        </div>
      </section>

      {/* Bill From / To */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 py-4 border-t border-slate-100">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">来自 (您的信息)</h3>
            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" id="logo-up" />
            <label htmlFor="logo-up" className="text-xs text-blue-600 font-medium cursor-pointer">上传 Logo</label>
          </div>
          <input 
            placeholder="企业/个人名称"
            value={invoice.sender.name}
            onChange={(e) => onChange({ sender: { ...invoice.sender, name: e.target.value } })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          />
          <textarea 
            placeholder="地址及联络方式"
            value={invoice.sender.address}
            onChange={(e) => onChange({ sender: { ...invoice.sender, address: e.target.value } })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 text-sm resize-none"
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">发送至 (客户信息)</h3>
          <input 
            placeholder="客户名称"
            value={invoice.client.name}
            onChange={(e) => onChange({ client: { ...invoice.client, name: e.target.value } })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          />
          <textarea 
            placeholder="客户收件地址"
            value={invoice.client.address}
            onChange={(e) => onChange({ client: { ...invoice.client, address: e.target.value } })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 text-sm resize-none"
          />
        </div>
      </section>

      {/* Line Items */}
      <section className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">明细清单</h3>
        <div className="space-y-3">
          {invoice.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between gap-2">
                <input 
                  placeholder="项目描述"
                  className="flex-1 bg-transparent font-medium"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                />
                <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500">
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400">数量</label>
                  <input 
                    type="number"
                    className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400">单价</label>
                  <input 
                    type="number"
                    className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, { rate: Number(e.target.value) })}
                  />
                </div>
                <div className="flex-1 text-right">
                  <label className="text-[10px] font-bold text-slate-400">金额</label>
                  <div className="font-bold py-1">{(item.quantity * item.rate).toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={addItem}
          className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all font-bold text-sm"
        >
          + 添加项目
        </button>
      </section>

      {/* Bottom Summary & Signature */}
      <section className="pt-4 border-t border-slate-100 space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">税率 (%)</span>
          <input 
            type="number"
            className="w-20 px-3 py-1 bg-white border border-slate-200 rounded-lg text-right text-sm"
            value={invoice.taxRate}
            onChange={(e) => onChange({ taxRate: Number(e.target.value) })}
          />
        </div>

        {/* Signature Box */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">电子签名</h3>
            <button 
              onClick={clearSignature}
              className="text-[10px] font-bold text-blue-600 uppercase hover:underline"
            >
              清除重新签署
            </button>
          </div>
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden relative group">
            <canvas 
              ref={canvasRef}
              width={500}
              height={150}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[120px] cursor-crosshair touch-none"
            />
            {!invoice.sender.signature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-medium">
                在此区域手写您的签名
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-600 p-4 rounded-xl text-white flex justify-between items-center">
          <span className="font-bold uppercase text-xs">应付总额</span>
          <span className="text-2xl font-black">
            {new Intl.NumberFormat('zh-CN', { style: 'currency', currency: invoice.currency }).format(
              invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0) * (1 + invoice.taxRate / 100)
            )}
          </span>
        </div>
      </section>
    </div>
  );
};

export default InvoiceForm;
