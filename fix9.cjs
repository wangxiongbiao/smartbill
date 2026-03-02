const fs = require('fs');

let fileStr = fs.readFileSync('.backup/InvoiceForm.tsx', 'utf8');

let fixPart = `                            </SortableContext>
                        </DndContext>

                        <button onClick={addItem} className="w-full mt-4 py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all group">
                            <Plus className="w-6 h-6 transform group-hover:rotate-90 transition-transform" />
                            <span className="font-black uppercase tracking-[0.2em] text-sm">{t.addItems}</span>
                        </button>
                    </section>

                    {/* Summary & Totals */}
                    <section className="pt-8 mt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Notes & payment toggle */}
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.notes}</h3>
                                <textarea
                                    placeholder={t.notesPlaceholder}
                                    value={invoice.notes}
                                    onChange={(e) => onChange({ notes: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl h-32 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                            </div>

                            {/* Payment Info Section */}
                            <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.paymentInfo}</h3>
                                        <button
                                            onClick={() => onChange({ visibility: { ...invoice.visibility, paymentInfo: !invoice.visibility?.paymentInfo } })}
                                            className={\`flex items-center justify-center w-12 h-6 rounded-full transition-all relative \${invoice.visibility?.paymentInfo ? 'bg-blue-600' : 'bg-slate-300'}\`}
                                        >
                                            <div className={\`absolute w-5 h-5 bg-white rounded-full shadow-sm transition-all \${invoice.visibility?.paymentInfo ? 'right-0.5' : 'left-0.5'}\`} />
                                        </button>
                                    </div>
                                    {invoice.visibility?.paymentInfo && (
                                        <button onClick={() => setShowPaymentFieldConfig(!showPaymentFieldConfig)} className="text-slate-400 hover:text-blue-600 transition-colors">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                
                                {showPaymentFieldConfig && invoice.paymentInfo?.fields && (
                                    <PaymentFieldConfigurator fields={invoice.paymentInfo.fields} onChange={(fields) => onChange({ paymentInfo: { ...invoice.paymentInfo, fields } })} onClose={() => setShowPaymentFieldConfig(false)} lang={lang} />
                                )}

                                {invoice.visibility?.paymentInfo && (
                                    <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                        {/* QR Code */}
                                        <div className="relative group/qr aspect-square w-32 mx-auto bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-blue-400">
                                            {invoice.paymentInfo?.qrCode ? (
                                                <>
                                                    <img src={invoice.paymentInfo.qrCode} alt="QR Code" className="w-[85%] h-[85%] object-contain" />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/qr:opacity-100 transition-all flex items-center justify-center gap-2">
                                                        <button onClick={() => setShowQRCodePickerDialog(true)} className="p-1.5 bg-white rounded-full text-blue-600"><RefreshCw className="w-4 h-4" /></button>
                                                        <button onClick={() => onChange({ paymentInfo: { ...invoice.paymentInfo, qrCode: undefined } })} className="p-1.5 bg-white rounded-full text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </>
                                            ) : (
                                                <button onClick={() => setShowQRCodePickerDialog(true)} className="flex flex-col items-center gap-2 text-slate-300 group-hover/qr:text-blue-400">
                                                    <Upload className="w-6 h-6" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{t.uploadQR}</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {invoice.paymentInfo?.fields?.filter(f => f.visible).sort((a, b) => a.order - b.order).map(field => (
                                                <div key={field.id} className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{field.label}</label>
                                                    <textarea
                                                        value={field.value}
                                                        rows={1}
                                                        onInput={autoResizeTextarea}
                                                        onChange={(e) => {
                                                            const fields = invoice.paymentInfo?.fields?.map(f => f.id === field.id ? { ...f, value: e.target.value } : f) || [];
                                                            onChange({ paymentInfo: { ...invoice.paymentInfo, fields } });
                                                        }}
                                                        className={\`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all \${field.id === 'accountNumber' ? 'font-mono' : ''}\`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Totals & Signature */}
                        <div className="space-y-8">
                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
                                    <span className="font-black text-slate-600">
                                        {new Intl.NumberFormat(lang, { style: 'currency', currency: invoice.currency }).format(
                                            invoice.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.rate || 0)), 0)
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.taxRate}</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            className="w-16 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-right font-black text-sm text-blue-600"
                                            value={invoice.taxRate}
                                            onChange={(e) => onChange({ taxRate: Number(e.target.value) })}
                                        />
                                        <span className="text-sm font-black text-slate-400">%</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200/50 flex justify-between items-baseline">
                                    <span className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">{t.payable}</span>
                                    <span className="text-4xl font-black text-blue-600 tracking-tighter">
                                        {new Intl.NumberFormat(lang, { style: 'currency', currency: invoice.currency }).format(
                                            invoice.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.rate || 0)), 0) * (1 + invoice.taxRate / 100)
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Signature area */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.signature}</h3>
                                        <button
                                            onClick={() => onChange({ visibility: { ...invoice.visibility, signature: !invoice.visibility?.signature } })}
                                            className={\`flex items-center justify-center w-12 h-6 rounded-full transition-all relative \${invoice.visibility?.signature ? 'bg-blue-600' : 'bg-slate-300'}\`}
                                        >
                                            <div className={\`absolute w-5 h-5 bg-white rounded-full shadow-sm transition-all \${invoice.visibility?.signature ? 'right-0.5' : 'left-0.5'}\`} />
                                        </button>
                                    </div>
                                    {invoice.visibility?.signature && (
                                        <div className="flex gap-4">
                                            <button onClick={clearSignature} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">{t.signClear}</button>
                                        </div>
                                    )}
                                </div>

                                {invoice.visibility?.signature && (
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden relative group/sig animate-in slide-in-from-top-2 duration-300">
                                        <canvas
                                            ref={canvasRef}
                                            width={800}
                                            height={320}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                            className="w-full h-[160px] cursor-crosshair touch-none bg-white/20"
                                        />
                                        {!invoice.sender.signature && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-300">
                                                <SignatureIcon className="w-8 h-8 mb-2 opacity-20" />
                                                <span className="text-xs font-bold uppercase tracking-widest">{t.signPlaceholder}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Disclaimer */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.disclaimerText}</h3>
                                    <button
                                        onClick={() => onChange({ visibility: { ...invoice.visibility, disclaimer: invoice.visibility?.disclaimer === false } })}
                                        className={\`flex items-center justify-center w-12 h-6 rounded-full transition-all relative \${invoice.visibility?.disclaimer !== false ? 'bg-blue-600' : 'bg-slate-300'}\`}
                                    >
                                        <div className={\`absolute w-5 h-5 bg-white rounded-full shadow-sm transition-all \${invoice.visibility?.disclaimer !== false ? 'right-0.5' : 'left-0.5'}\`} />
                                    </button>
                                </div>
                                {invoice.visibility?.disclaimer !== false && (
                                    <textarea
                                        value={invoice.sender.disclaimerText || ''}
                                        onChange={(e) => onChange({ sender: { ...invoice.sender, disclaimerText: e.target.value } })}
                                        placeholder="e.g., Computer generated document, no signature required."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl h-24 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-500 italic"
                                    />
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <ImagePickerDialog`;

let startIdx = fileStr.indexOf('</SortableContext>');
if (startIdx === -1) {
    console.error("Could not find </SortableContext>!");
    process.exit(1);
}

// Slice the file up to </SortableContext>
let newStr = fileStr.substring(0, startIdx) + fixPart;

// Append the remaining part containing <ImagePickerDialog for logo and qrcode
let imagePickerIdx = fileStr.indexOf('isOpen={showLogoPickerDialog}');
if (imagePickerIdx === -1) {
    console.error("Could not find isOpen={showLogoPickerDialog}!");
    process.exit(1);
}

newStr += `
                isOpen={showLogoPickerDialog}
` + fileStr.substring(imagePickerIdx + 'isOpen={showLogoPickerDialog}'.length);

fs.writeFileSync('components/invoice/InvoiceForm.tsx', newStr);
