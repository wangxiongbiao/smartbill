import React from 'react';
import { TileState, TileStatus, EditingCell } from '../types';

interface GridProps {
  grid: TileState[][];
  currentRowIndex: number;
  onTileClick: (rowIndex: number, colIndex: number) => void;
  onRightClick: (rowIndex: number, colIndex: number) => void;
  editingCell: EditingCell | null;
}

export const Grid: React.FC<GridProps> = ({ grid, currentRowIndex, onTileClick, onRightClick, editingCell }) => {
  const getBackgroundColor = (status: TileStatus) => {
    switch (status) {
      case 'correct': return 'bg-primary border-primary';
      case 'present': return 'bg-secondary border-secondary';
      case 'absent': return 'bg-absent border-absent';
      default: return 'bg-white border-slate-200';
    }
  };

  const getTextColor = (status: TileStatus) => {
    return status === 'empty' ? 'text-slate-900' : 'text-white';
  };

  // Handle long-press for mobile
  const [touchTimer, setTouchTimer] = React.useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (rowIndex: number, colIndex: number, isFilled: boolean) => {
    if (isFilled) {
      const timer = setTimeout(() => {
        onRightClick(rowIndex, colIndex);
      }, 500); // 500ms long press
      setTouchTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {row.map((tile, colIndex) => {
            const isFilled = tile.letter !== '';
            const isActiveRow = rowIndex === currentRowIndex;
            const isPrevRow = rowIndex < currentRowIndex;
            const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;

            // Allow clicking if it has a letter and is the active row (or a previous row for editing history)
            const isClickable = (isActiveRow && isFilled) || isPrevRow;

            return (
              <div
                key={colIndex}
                onClick={() => isClickable && onTileClick(rowIndex, colIndex)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (isFilled) {
                    onRightClick(rowIndex, colIndex);
                  }
                }}
                onTouchStart={() => handleTouchStart(rowIndex, colIndex, isFilled)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className={`
                  w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20
                  rounded flex items-center justify-center 
                  text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold select-none 
                  border-2 transition-all duration-200
                  ${isEditing ? 'border-dashed border-blue-500 shadow-lg shadow-blue-200 text-[#333]' : getBackgroundColor(tile.status)}
                  ${getTextColor(tile.status)}
                  ${isClickable ? 'cursor-pointer hover:opacity-90 active:scale-95' : 'cursor-default'}
                  ${!isFilled && tile.status === 'empty' && !isEditing ? '' : isEditing ? '' : 'border-transparent'}
                `}
              >
                {tile.letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
