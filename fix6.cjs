const fs = require('fs');

let fileStr = fs.readFileSync('components/invoice/InvoiceForm.tsx', 'utf8');

let fixPart1 = `
                                            <SortableItem key={item.id} id={item.id}>
                                                {({ listeners }) => (
                                                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 relative group/item hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300">
                                                        <div className="absolute top-4 -left-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                            <div {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-500 bg-white rounded-full shadow-md border border-slate-100">
                                                                <GripVertical className="w-4 h-4" />
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-100 hover:shadow-md flex items-center justify-center rounded-full opacity-0 group-hover/item:opacity-100 transition-all z-10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>

                                                        <div className="space-y-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                                {/* Description - take more space */}
                                                                {systemColumns.find(c => c.field === 'description') && (
                                                                    <div className="md:col-span-6">
                                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">{t.itemDesc}</label>
                                                                        {renderCell(item, systemColumns.find(c => c.field === 'description')!)}
                                                                    </div>
                                                                )}

                                                                <div className="md:col-span-6 grid grid-cols-3 gap-4">
                                                                    {systemColumns.filter(c => c.field !== 'description').map(col => (
                                                                        <div key={col.id}>
                                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block text-center truncate">
                                                                                {col.label}
                                                                            </label>
                                                                            {renderCell(item, col)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Custom columns */}
                                                            {customColumns.length > 0 && (
                                                                <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                                                    {customColumns.map(col => (
                                                                        <div key={col.id}>
                                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">{col.label}</label>
                                                                            {renderCell(item, col)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </SortableItem>
`;

let contentToReplace = fileStr.substring(
    fileStr.indexOf('<SortableItem key={item.id} id={item.id}>'),
    fileStr.indexOf('</SortableItem>') + '</SortableItem>'.length
);
if (fileStr.indexOf('<SortableItem key={item.id} id={item.id}>') !== -1) {
    fileStr = fileStr.replace(contentToReplace, fixPart1.trim());
}

let fixPart2 = `
                                            </SortableItem>
                                        );
                                    })}
                                </div>
                            </SortableContext>
                        </DndContext>

                        <button onClick={addItem} className="w-full py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all group">
                            <Plus className="w-6 h-6 transform group-hover:rotate-90 transition-transform" />
                            <span className="font-black uppercase tracking-[0.2em] text-sm">{t.addItems}</span>
                        </button>
                    </section>
`;

// It seems there are 2 missing </div> here, wait.

fs.writeFileSync('components/invoice/InvoiceForm.tsx', fileStr);
