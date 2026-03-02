'use client';

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
    status: 'idle' | 'saving' | 'saved' | 'error';
    lastSaved?: Date;
}

export default function SaveStatusIndicator({ status, lastSaved }: Props) {
    if (status === 'idle' && !lastSaved) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            {status === 'saving' && (
                <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Saving...</span>
                </div>
            )}

            {status === 'saved' && (
                <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Saved</span>
                    {lastSaved && (
                        <span className="text-[10px] text-slate-300 font-medium">
                            at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    )}
                </div>
            )}

            {status === 'error' && (
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Save Failed</span>
                </div>
            )}

            {status === 'idle' && lastSaved && (
                <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Last Saved</span>
                    <span className="text-[10px] font-medium">
                        {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )}
        </div>
    );
}
