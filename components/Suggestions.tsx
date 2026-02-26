import React, { useMemo } from 'react';
import { Suggestion } from '../types';
import { Tooltip } from './Tooltip';

interface SuggestionsProps {
  suggestions: Suggestion[];
  loading: boolean;
  count: number;
  maxItems?: number;
  onWordClick?: (word: string) => void; // 点击单词的回调
  onReset?: () => void; // 重置回调
}

export const Suggestions: React.FC<SuggestionsProps> = ({
  suggestions,
  loading,
  count,
  maxItems = 5,
  onWordClick,
  onReset
}) => {
  const visibleSuggestions = useMemo(
    () => suggestions.slice(0, maxItems),
    [suggestions, maxItems]
  );

  const showEmpty = !loading && visibleSuggestions.length === 0;

  return (
    <div className="flex-shrink-0 self-start w-full md:w-auto">
      <div className="flex flex-col items-center">
        {/* 重置按钮 */}
        <button
          onClick={onReset}
          className="w-full mb-2 py-2 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center justify-center gap-2 transition-colors bg-white"
        >
          <span className="material-symbols-outlined text-lg">restart_alt</span>
          Reset Board
        </button>
      </div>

      {/* Tooltip 提示 */}
      <div className="mb-2 w-full">
        <Tooltip
          message="Click suggestions to use them directly in the grid"
          storageKey="tooltip-suggestions-click"
        />
      </div>

      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-3 sm:p-4 w-full md:min-w-[260px] md:max-w-[320px]">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Suggestions
          </div>
          <div className="bg-primary/10 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-primary border border-primary/20">
            {count > 0 ? `${count} Candidates` : 'Pending'}
          </div>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(key => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                    <div className="h-2 w-16 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-8 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : showEmpty ? (
            <div className="flex items-center gap-3 text-slate-400 text-xs sm:text-sm">
              <span className="material-symbols-outlined text-lg">lightbulb</span>
              <span>Enter letters and calculate to see picks</span>
            </div>
          ) : (
            visibleSuggestions.map((sugg, idx) => {
              const isTopPick = idx === 0;
              return (
                <div
                  key={`${sugg.word}-${idx}`}
                  onClick={() => onWordClick?.(sugg.word)}
                  className={`flex items-center justify-between px-2.5 sm:px-3 py-2 rounded-xl border transition-colors cursor-pointer ${isTopPick
                    ? 'bg-primary/5 border-primary/20 shadow-sm hover:bg-primary/10'
                    : 'bg-slate-50 border-transparent hover:border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold ${isTopPick
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200'
                      }`}>
                      {sugg.rank ?? idx + 1}
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm sm:text-base font-semibold text-slate-900 tracking-[0.12em] sm:tracking-[0.18em] uppercase">
                        {sugg.word}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 max-w-[120px] sm:max-w-[160px] truncate" title={sugg.reason || `Match score ${sugg.score}%`}>
                        {sugg.reason || `Match score ${sugg.score}%`}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${isTopPick ? 'text-primary' : 'text-slate-500'
                    }`}>
                    #{idx + 1}
                  </span>
                </div>
              );
            })
          )}
        </div>


      </div>
    </div>
  );
};
