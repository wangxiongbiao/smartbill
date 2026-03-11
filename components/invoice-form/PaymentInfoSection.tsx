import React from 'react';
import PaymentFieldConfigurator from '@/components/PaymentFieldConfigurator';
import type { PaymentInfoSectionProps } from './shared';
import { updatePaymentInfoFieldValue } from '@/lib/invoice';

export default function PaymentInfoSection({ invoice, lang, t, onChange, autoResizeTextarea, showPaymentFieldConfig, setShowPaymentFieldConfig, isUploadingQRCode, onOpenQRCodePicker, onRemoveQRCode }: PaymentInfoSectionProps) {
  const copy = lang === 'zh-TW'
    ? {
        qrCode: 'QR Code',
        uploadQr: '上傳 QR Code',
        qrAdded: '已添加 QR Code',
        qrHint: '可點擊按鈕更換或移除',
        change: '更換',
        remove: '移除',
        configurePaymentFields: '配置付款欄位',
      }
    : {
        qrCode: 'QR Code',
        uploadQr: 'Upload QR Code',
        qrAdded: 'QR Code added',
        qrHint: 'Click buttons to replace or remove',
        change: 'Change',
        remove: 'Remove',
        configurePaymentFields: 'Configure Payment Fields',
      };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex justify-between items-center mb-1 relative">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.paymentInfo}</h3>
          <button type="button" onClick={() => onChange({ visibility: { ...invoice.visibility, paymentInfo: !invoice.visibility?.paymentInfo } })} className={`text-xs ${invoice.visibility?.paymentInfo === true ? 'text-blue-600' : 'text-slate-300'}`} title={t.visibility}><i className={`fas fa-toggle-${invoice.visibility?.paymentInfo === true ? 'on' : 'off'} text-lg`}></i></button>
        </div>
        {invoice.visibility?.paymentInfo === true && <button type="button" onClick={() => setShowPaymentFieldConfig(!showPaymentFieldConfig)} className="text-slate-400 hover:text-blue-600 transition-colors" title={t.configurePaymentFields || copy.configurePaymentFields}><i className="fas fa-cog"></i></button>}
        {showPaymentFieldConfig && invoice.paymentInfo?.fields && <PaymentFieldConfigurator fields={invoice.paymentInfo.fields} onChange={(newFields) => onChange({ paymentInfo: { ...invoice.paymentInfo, fields: newFields } })} onClose={() => setShowPaymentFieldConfig(false)} lang={lang} />}
      </div>

      {invoice.visibility?.paymentInfo === true && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase ml-1">{copy.qrCode}</label>
            {isUploadingQRCode ? (
              <div className="w-full h-[76px] px-4 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50 flex items-center justify-center">
                <div className="flex items-center gap-2 text-blue-600">
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span className="text-xs font-medium">{t.uploadingImage}</span>
                </div>
              </div>
            ) : !invoice.paymentInfo?.qrCode ? (
              <button type="button" onClick={onOpenQRCodePicker} className="w-full h-[76px] px-4 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-blue-600">
                  <i className="fas fa-qrcode text-lg"></i>
                  <span className="text-sm font-medium">{t.uploadQR || copy.uploadQr}</span>
                </div>
              </button>
            ) : (
              <div className="relative group">
                <div className="w-full h-[76px] px-4 border border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-between overflow-hidden">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={invoice.paymentInfo.qrCode} alt="QR Code" className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{copy.qrAdded}</div>
                      <div className="text-xs text-slate-400">{copy.qrHint}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={onOpenQRCodePicker} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">{copy.change}</button>
                    <button type="button" onClick={onRemoveQRCode} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors">{copy.remove}</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {invoice.paymentInfo?.fields?.filter(f => f.visible)?.sort((a, b) => a.order - b.order)?.map((field) => {
            const updateFieldValue = (value: string) => {
              onChange({ paymentInfo: updatePaymentInfoFieldValue(invoice.paymentInfo, field.id, value) });
            };

            return (
              <div key={field.id} className={`space-y-1.5 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                <label className="text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase ml-1">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    ref={autoResizeTextarea}
                    placeholder={field.label}
                    value={field.value}
                    onChange={(e) => updateFieldValue(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl resize-none overflow-hidden text-sm leading-6"
                    rows={1}
                    onInput={(e) => {
                      e.currentTarget.style.height = 'auto';
                      e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                    }}
                  />
                ) : (
                  <input
                    placeholder={field.label}
                    value={field.value}
                    onChange={(e) => updateFieldValue(e.target.value)}
                    className={`w-full h-[76px] px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm ${field.id === 'accountNumber' ? 'font-mono' : ''}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
