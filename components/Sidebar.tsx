
import React, { useState } from 'react';
import { TemplateType } from '../types';

interface SidebarProps {
  template: TemplateType;
  setTemplate: (t: TemplateType) => void;
  onSmartFill: (prompt: string) => void;
  isAiLoading: boolean;
  isAppReversed: boolean;
  setIsAppReversed: (v: boolean) => void;
  isHeaderReversed: boolean;
  setIsHeaderReversed: (v: boolean) => void;
  onSave?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  template, 
  setTemplate, 
  onSmartFill, 
  isAiLoading,
  isAppReversed,
  setIsAppReversed,
  isHeaderReversed,
  setIsHeaderReversed,
  onSave
}) => {
  const [aiInput, setAiInput] = useState('');

  const templates: { id: TemplateType; label: string; color: string }[] = [
    { id: 'professional', label: 'Professional', color: 'bg-slate-800' },
    { id: 'modern', label: 'Modern Indigo', color: 'bg-indigo-600' },
    { id: 'minimalist', label: 'Minimalist', color: 'bg-slate-900' },
  ];

  const handleAiSubmit = () => {
    if (aiInput.trim()) {
      onSmartFill(aiInput);
      setAiInput('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Save Action for Records System */}
      {onSave && (
        <button 
          onClick={onSave}
          className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
        >
          <i className="fas fa-save"></i> Save to Records
        </button>
      )}

      {/* AI Assistant */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <i className="fas fa-magic"></i>
          </div>
          <div>
            <h3 className="font-bold">AI Smart Fill</h3>
            <p className="text-xs opacity-80">Describe your work, let Gemini draft the items.</p>
          </div>
        </div>
        
        <div className="relative">
          <textarea 
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none h-20"
            placeholder="e.g., 'I did 5 hours of website coding and 2 logo designs for $50 each...'"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
          />
          <button 
            disabled={isAiLoading}
            onClick={handleAiSubmit}
            className={`mt-2 w-full py-2 bg-white text-blue-600 font-bold rounded-lg text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 ${isAiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAiLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-bolt"></i>
            )}
            {isAiLoading ? 'Thinking...' : 'Generate Items'}
          </button>
        </div>
      </div>

      {/* Template & Layout Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Select Template</h3>
          <div className="flex flex-wrap gap-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`flex-1 min-w-[120px] p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  template === t.id 
                    ? 'border-blue-500 bg-blue-50 shadow-inner' 
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                }`}
              >
                <div className={`w-10 h-10 ${t.color} rounded-lg shadow-md`}></div>
                <span className={`text-xs font-bold ${template === t.id ? 'text-blue-700' : 'text-slate-500'}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Layout Settings</h3>
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <i className="fas fa-columns text-slate-400"></i>
              <span className="text-sm font-medium text-slate-700">Swap App Layout</span>
            </div>
            <button 
              onClick={() => setIsAppReversed(!isAppReversed)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isAppReversed ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isAppReversed ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <i className="fas fa-heading text-slate-400"></i>
              <span className="text-sm font-medium text-slate-700">Flip Invoice Header</span>
            </div>
            <button 
              onClick={() => setIsHeaderReversed(!isHeaderReversed)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isHeaderReversed ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isHeaderReversed ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
