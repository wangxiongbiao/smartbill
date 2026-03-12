import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import ColumnConfigurator from '@/components/ColumnConfigurator';
import type { ItemsSectionProps } from './shared';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ id, children }: { id: string; children: (props: { listeners: any; attributes: any }) => React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.8 : 1, position: 'relative' as const };
  return <div ref={setNodeRef} style={style} {...attributes}>{children({ listeners, attributes })}</div>;
};

export default function ItemsSection({ invoice, t, lang, columns, sortedColumns, sensors, showColumnConfig, setShowColumnConfig, onChange, addItem, removeItem, handleDragEnd, renderCell }: ItemsSectionProps) {
  const copyByLang = {
    en: {
      hiddenInPreview: 'Hidden in preview',
    },
    'zh-CN': {
      hiddenInPreview: '预览中隐藏',
    },
    'zh-TW': {
      hiddenInPreview: '預覽中隱藏',
    },
    th: {
      hiddenInPreview: 'ซ่อนในตัวอย่าง',
    },
    id: {
      hiddenInPreview: 'Disembunyikan di pratinjau',
    },
  } satisfies Record<typeof lang, { hiddenInPreview: string }>;
  const copy = copyByLang[lang];

  return (
    <section className="space-y-4 pt-4 border-t border-slate-100">
      <div className="flex justify-between items-center relative">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.items}</h3>
        <button type="button" onClick={() => setShowColumnConfig(!showColumnConfig)} className="text-slate-400 hover:text-blue-600 transition-colors" title={t.customizeColumns}><i className="fas fa-cog"></i></button>
        {showColumnConfig && <ColumnConfigurator columns={columns} onChange={(newCols) => onChange({ columnConfig: newCols })} onClose={() => setShowColumnConfig(false)} lang={lang} />}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={invoice.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {invoice.items.map((item) => {
              const systemColumns = sortedColumns.filter(col => col.type.startsWith('system-'));
              const customColumns = sortedColumns.filter(col => col.type.startsWith('custom-'));
              return (
                <SortableItem key={item.id} id={item.id}>
                  {({ listeners }) => (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 select-none touch-manipulation">
                      <div className="flex items-start gap-3">
                        <div {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 pt-2"><i className="fas fa-grip-vertical"></i></div>
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{systemColumns.map(col => <div key={col.id}><label className="text-[0.625rem] font-semibold uppercase tracking-wider text-slate-400 mb-1 block flex items-center gap-1">{col.label}{!col.visible && <i className="fas fa-eye-slash text-[0.5rem] opacity-50" title={copy.hiddenInPreview}></i>}</label>{renderCell(item, col)}</div>)}</div>
                          {customColumns.length > 0 && <div className="pt-3 border-t border-slate-200"><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{customColumns.map(col => <div key={col.id}><label className="text-[0.625rem] font-semibold uppercase tracking-wider text-slate-400 mb-1 block flex items-center gap-1">{col.label}{!col.visible && <i className="fas fa-eye-slash text-[0.5rem] opacity-50" title={copy.hiddenInPreview}></i>}</label>{renderCell(item, col)}</div>)}</div></div>}
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} className="text-slate-300 hover:text-red-500 p-2 transition-colors"><i className="fas fa-trash-alt"></i></button>
                      </div>
                    </div>
                  )}
                </SortableItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <button type="button" onClick={addItem} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all font-semibold text-sm">{t.addItems}</button>
    </section>
  );
}
