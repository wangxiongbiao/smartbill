'use client';

import React from 'react';
import { Invoice } from '@/types/invoice';

interface DisclaimerSectionProps {
    invoice: Invoice;
    onChange: (updates: Partial<Invoice>) => void;
}

const DisclaimerSection: React.FC<DisclaimerSectionProps> = ({
    invoice,
    onChange
}) => {
    return (
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm mt-4 animate-in fade-in slide-in-from-bottom-2 duration-600">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-xs font-black tracking-widest text-slate-400">免责声明</h3>
                    <button
                        onClick={() => onChange({ visibility: { ...invoice.visibility, disclaimer: invoice.visibility?.disclaimer === false } })}
                        className={`flex items-center justify-center w-9 h-5 rounded-full transition-all relative ${invoice.visibility?.disclaimer !== false ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                        <div className={`absolute w-4 h-4 bg-white rounded-full shadow-sm transition-all ${invoice.visibility?.disclaimer !== false ? 'right-0.5' : 'left-0.5'}`} />
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
    );
};

export default DisclaimerSection;
