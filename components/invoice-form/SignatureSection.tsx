import React from 'react';
import type { SignatureSectionProps } from './shared';

export default function SignatureSection({ invoice, t, onChange, canvasRef, startDrawing, draw, stopDrawing, signatureInputRef, handleSignatureUpload, clearSignature }: SignatureSectionProps) {
  const copy = {
    upload: t.uploadImage || 'Upload',
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-3">
      <div className="flex justify-between items-center"><div className="flex items-center gap-2"><h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.signature}</h3><button type="button" onClick={() => onChange({ visibility: { ...invoice.visibility, signature: !invoice.visibility?.signature } })} className={`text-xs ${invoice.visibility?.signature === true ? 'text-blue-600' : 'text-slate-300'}`} title={t.visibility}><i className={`fas fa-toggle-${invoice.visibility?.signature === true ? 'on' : 'off'} text-lg`}></i></button></div>{invoice.visibility?.signature === true && <div className="flex gap-2 items-center"><input type="file" ref={signatureInputRef} onChange={handleSignatureUpload} accept="image/*" className="hidden" id="signature-upload" /><label htmlFor="signature-upload" className="text-[10px] font-semibold text-indigo-600 uppercase hover:underline cursor-pointer">📤 {copy.upload}</label><button type="button" onClick={clearSignature} className="text-[10px] font-semibold text-blue-600 uppercase hover:underline">{t.signClear}</button></div>}</div>
      {invoice.visibility?.signature === true && <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden relative animate-in slide-in-from-top-2 duration-200"><canvas ref={canvasRef} width={1000} height={400} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-[200px] cursor-crosshair touch-none" />{!invoice.sender.signature && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-medium">{t.signPlaceholder}</div>}</div>}
    </div>
  );
}
