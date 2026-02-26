import React from 'react';
import { TileState } from '../types';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  grid: TileState[][];
}

export const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, onBackspace, onEnter, grid }) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  // Helper to determine key color based on grid state
  const getKeyStatus = (key: string) => {
    let status = 'default';

    // Check all played tiles for this letter, prioritizing Correct > Present > Absent
    for (const row of grid) {
      for (const tile of row) {
        if (tile.letter === key) {
          if (tile.status === 'correct') return 'correct';
          if (tile.status === 'present' && status !== 'correct') status = 'present';
          if (tile.status === 'absent' && status !== 'correct' && status !== 'present') status = 'absent';
        }
      }
    }
    return status;
  };

  const getKeyStyles = (key: string) => {
    const status = getKeyStatus(key);
    switch (status) {
      case 'correct': return 'bg-primary text-white border-primary';
      case 'present': return 'bg-secondary text-white border-secondary';
      case 'absent': return 'bg-absent text-white border-absent';
      default: return 'bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400';
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white p-3 sm:p-6 md:p-8 rounded-xl sm:rounded-[1.5rem] border border-slate-200 shadow-sm">
      <div className="flex flex-col items-center gap-1.5 sm:gap-2 w-full select-none">

        {/* Row 1 */}
        <div className="flex gap-1 sm:gap-1.5 w-full justify-center">
          {rows[0].map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={`h-11 sm:h-14 flex-1 rounded-md font-bold text-xs sm:text-sm md:text-base transition-colors shadow-sm active:scale-95 ${getKeyStyles(key)}`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex gap-1 sm:gap-1.5 w-[92%] justify-center">
          {rows[1].map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={`h-11 sm:h-14 flex-1 rounded-md font-bold text-xs sm:text-sm md:text-base transition-colors shadow-sm active:scale-95 ${getKeyStyles(key)}`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Row 3 */}
        <div className="flex gap-1 sm:gap-1.5 w-full justify-center">
          <button
            onClick={onBackspace}
            className="h-11 sm:h-14 w-12 sm:w-14 md:w-20 rounded-md bg-slate-300 text-slate-700 font-bold hover:bg-slate-400 active:bg-slate-500 flex items-center justify-center transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">backspace</span>
          </button>

          {rows[2].map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={`h-11 sm:h-14 flex-1 rounded-md font-bold text-xs sm:text-sm md:text-base transition-colors shadow-sm active:scale-95 ${getKeyStyles(key)}`}
            >
              {key}
            </button>
          ))}

          <button
            onClick={onEnter}
            className="h-11 sm:h-14 w-12 sm:w-14 md:w-20 rounded-md bg-slate-300 text-slate-700 font-bold hover:bg-slate-400 active:bg-slate-500 flex items-center justify-center transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">keyboard_return</span>
          </button>
        </div>
      </div>
    </div>
  );
};
