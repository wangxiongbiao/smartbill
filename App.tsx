"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Grid } from './components/Grid';
import { Keyboard } from './components/Keyboard';
import { Suggestions } from './components/Suggestions';
import { Toast } from './components/Toast';
import { Tooltip, closeTooltip } from './components/Tooltip';
import { CompletionModal } from './components/CompletionModal';
import { TileState, TileStatus, Suggestion, ProbabilityInsight, EditingCell } from './types';
// import { getWordleSuggestions } from './services/geminiService';
import { filterCandidates } from './services/filterService';
import { validateCurrentRow, isWordValidForHardMode } from './services/hardModeValidator';
import { validateGuess } from './services/answerValidation';

const MAX_ROWS = 6; // Wordle 标准最多6行
const COLS = 5;

// 创建空行的工具函数
const createEmptyRow = (): TileState[] =>
  Array(COLS).fill(null).map(() => ({ letter: '', status: 'empty' as TileStatus }));

const App: React.FC = () => {
  // --- State ---
  const [showTips, setShowTips] = useState(true);
  const [grid, setGrid] = useState<TileState[][]>(() => [createEmptyRow()]);

  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [, setInsights] = useState<ProbabilityInsight[]>([]);
  const [loading, setLoading] = useState(true); // 初始为 true，等待获取每日推荐
  const [suggestionCount, setSuggestionCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 标记是否首次加载
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [isHardMode, setIsHardMode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [editingCellOriginalValue, setEditingCellOriginalValue] = useState<string>(''); // 保存编辑前的原始值
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [gameResult, setGameResult] = useState<{ isWin: boolean; attempts: number; resultText: string } | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [dailyAnswer, setDailyAnswer] = useState<string>(''); // 今日答案

  // 移动端系统键盘支持
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // --- Handlers ---

  // 格式化游戏结果为可分享的文本
  const formatGameResult = (): string => {
    const statusToEmoji: Record<TileStatus, string> = {
      absent: '⬛️',
      present: '🟨',
      correct: '🟩',
      empty: '⬜',
    };

    return grid
      .filter(row => row.some(tile => tile.letter !== ''))
      .map(row => {
        const emojis = row.map(tile => statusToEmoji[tile.status]).join(' ');
        const word = row.map(tile => tile.letter).join('');
        return `${emojis} ${word}`;
      })
      .join('\n');
  };

  // 根据历史数据智能判断默认颜色
  const getDefaultStatus = (letter: string, position: number): TileStatus => {
    // 从所有历史行中查找该位置是否有确定的绿色约束
    for (let rowIndex = 0; rowIndex < currentRowIndex; rowIndex++) {
      const tile = grid[rowIndex][position];
      if (tile.status === 'correct' && tile.letter.toUpperCase() === letter.toUpperCase()) {
        return 'correct'; // 自动绿色
      }
    }
    return 'absent'; // 默认灰色
  };

  const handleKeyPress = (key: string) => {
    // 优先处理编辑模式
    if (editingCell) {
      const newGrid = [...grid];
      newGrid[editingCell.row][editingCell.col] = {
        ...newGrid[editingCell.row][editingCell.col],
        letter: key,
        // 保持原有的颜色状态
      };
      setGrid(newGrid);
      return;
    }

    // 原有逻辑：按顺序填充
    const currentRow = grid[currentRowIndex];
    const firstEmptyIndex = currentRow.findIndex(tile => tile.letter === '');

    if (firstEmptyIndex !== -1) {
      let status: TileStatus = 'absent'; // 默认灰色

      // 如果有每日答案，立即根据答案设置颜色
      if (dailyAnswer) {
        const answerLetter = dailyAnswer[firstEmptyIndex];

        if (key.toUpperCase() === answerLetter.toUpperCase()) {
          // 位置正确 - 绿色
          status = 'correct';
        } else if (dailyAnswer.toUpperCase().includes(key.toUpperCase())) {
          // 字母存在但位置不对 - 黄色
          status = 'present';
        } else {
          // 字母不存在 - 灰色
          status = 'absent';
        }
      }

      const newGrid = [...grid];
      newGrid[currentRowIndex][firstEmptyIndex] = {
        ...newGrid[currentRowIndex][firstEmptyIndex],
        letter: key,
        status: status,
      };

      setGrid(newGrid);
    }
  };

  const handleBackspace = () => {
    // 优先处理编辑模式：删除编辑格子的字母，保持编辑状态
    if (editingCell) {
      const newGrid = [...grid];
      newGrid[editingCell.row][editingCell.col] = {
        ...newGrid[editingCell.row][editingCell.col],
        letter: '',
      };
      setGrid(newGrid);
      return;
    }

    // 删除当前行最后一个字母
    const currentRow = grid[currentRowIndex];
    let indexToDelete = -1;
    for (let i = COLS - 1; i >= 0; i--) {
      if (currentRow[i].letter !== '') {
        indexToDelete = i;
        break;
      }
    }

    if (indexToDelete !== -1) {
      // 当前行有字母，删除最后一个
      const newGrid = [...grid];
      newGrid[currentRowIndex][indexToDelete] = { letter: '', status: 'empty' };
      setGrid(newGrid);
    } else if (currentRowIndex >= 0) {
      // 当前行为空且不是第一行，删除上一行的最后一个字母
      const previousRow = grid[currentRowIndex - 1];
      let previousIndexToDelete = -1;
      for (let i = COLS - 1; i >= 0; i--) {
        if (previousRow[i].letter !== '') {
          previousIndexToDelete = i;
          break;
        }
      }

      if (previousIndexToDelete !== -1) {
        const newGrid = [...grid];
        newGrid[currentRowIndex - 1][previousIndexToDelete] = { letter: '', status: 'empty' };

        // 删除最下面的空行（当前行）
        newGrid.splice(currentRowIndex, 1);

        setGrid(newGrid);
        // 将当前行索引回退到上一行
        setCurrentRowIndex(prev => prev - 1);
      }
    }
  };

  const handleEnter = () => {
    // 退出编辑模式
    if (editingCell) {
      const tile = grid[editingCell.row][editingCell.col];
      // 如果格子为空，不允许退出编辑模式
      if (!tile.letter || tile.letter === '') {
        setToast({
          message: 'Please enter a letter before confirming',
          type: 'error',
        });
        return;
      }
      setEditingCell(null);
      return;
    }

    // 检查当前行是否填满
    const currentRow = grid[currentRowIndex];
    const isFull = currentRow.every(tile => tile.letter !== '');

    if (!isFull) {
      setToast({
        message: 'Not enough letters',
        type: 'error',
      });
      return;
    }

    // 困难模式验证
    if (isHardMode) {
      const validation = validateCurrentRow(grid, currentRowIndex);
      if (!validation.isValid) {
        setToast({
          message: validation.violations[0] || 'Invalid word for Hard Mode',
          type: 'error',
        });
        return;
      }
    }

    // 如果有每日答案，自动验证颜色
    if (dailyAnswer) {
      const guessWord = currentRow.map(tile => tile.letter).join('');
      const statuses = validateGuess(guessWord, dailyAnswer);

      const newGrid = [...grid];
      newGrid[currentRowIndex] = currentRow.map((tile, i) => ({
        ...tile,
        status: statuses[i],
      }));
      setGrid(newGrid);
    }

    // 移动到下一行
    if (currentRowIndex < grid.length - 1) {
      setCurrentRowIndex(prev => prev + 1);
    }
  };

  const handleTileClick = (rowIndex: number, colIndex: number) => {
    // 关闭grid tooltip（用户已经点击了tile）
    closeTooltip('tooltip-grid-interaction');

    // 左键点击退出编辑模式
    if (editingCell) {
      const tile = grid[editingCell.row][editingCell.col];
      // 如果编辑的格子为空，恢复原始值
      if (!tile.letter || tile.letter === '') {
        const newGrid = [...grid];
        newGrid[editingCell.row][editingCell.col] = {
          ...newGrid[editingCell.row][editingCell.col],
          letter: editingCellOriginalValue,
        };
        setGrid(newGrid);
      }
      setEditingCell(null);
      setEditingCellOriginalValue('');
    }

    // Only allow changing colors for active or past rows
    if (rowIndex > currentRowIndex) return;

    const tile = grid[rowIndex][colIndex];
    if (tile.letter === '') return;

    // Cycle colors: absent (gray) -> present (yellow) -> correct (green) -> absent
    const newStatus: TileStatus =
      tile.status === 'absent' ? 'present' :
        tile.status === 'present' ? 'correct' :
          tile.status === 'correct' ? 'absent' : 'present';

    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = { ...tile, status: newStatus };
    setGrid(newGrid);
  };

  const handleRightClick = (rowIndex: number, colIndex: number) => {
    // 关闭grid tooltip（用户已经右键点击了tile）
    closeTooltip('tooltip-grid-interaction');

    // 保存原始值
    const originalValue = grid[rowIndex][colIndex].letter;
    setEditingCellOriginalValue(originalValue);
    // 右键设置编辑格子（只对有字母的格子生效，在 Grid 组件中已过滤）
    setEditingCell({ row: rowIndex, col: colIndex });
  };

  const handleEscape = () => {
    // ESC 退出编辑模式，恢复原始值
    if (editingCell) {
      const tile = grid[editingCell.row][editingCell.col];
      // 如果编辑的格子为空或值被修改，恢复原始值
      if (!tile.letter || tile.letter === '') {
        const newGrid = [...grid];
        newGrid[editingCell.row][editingCell.col] = {
          ...newGrid[editingCell.row][editingCell.col],
          letter: editingCellOriginalValue,
        };
        setGrid(newGrid);
      }
      setEditingCell(null);
      setEditingCellOriginalValue('');
    }
  };

  // const handleCalculate = async () => {
  //   setLoading(true);
  //   // Find how many words are candidates (simulated or returned from API)
  //   // In a real app we might pass this to the API or the API returns it

  //   const response = await getWordleSuggestions(grid, currentRowIndex + 1);

  //   setSuggestions(response.suggestions);
  //   setInsights(response.insights);
  //   setSuggestionCount(response.suggestions.length > 0 ? 124 : 0); // Fake total count or get from API
  //   setLoading(false);
  // };

  const handleReset = async () => {
    setGrid([createEmptyRow()]);
    setCurrentRowIndex(0);
    setEditingCell(null);
    setEditingCellOriginalValue('');
    setToast(null);
    setShowCompletionModal(false);
    setGameResult(null);
    setGameCompleted(false);

    // 重新获取每日推荐
    try {
      setLoading(true);
      const res = await fetch('/api/daily-picks');
      const data = await res.json();
      if (data.success && data.picks?.length > 0) {
        const initialSuggestions: Suggestion[] = data.picks.map((pick: { word: string; reason?: string }, index: number) => ({
          word: pick.word,
          score: 100 - index * 10,
          rank: index + 1,
          reason: pick.reason,
        }));
        setSuggestions(initialSuggestions);
        setSuggestionCount(data.picks.length);
      }
    } catch (error) {
      setSuggestions([]);
      setSuggestionCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 模式切换处理
  const handleModeChange = (isHard: boolean) => {
    if (isHard !== isHardMode) {
      setIsHardMode(isHard);
      // 切换模式时重置游戏
      handleReset();
      setToast({
        message: `Switched to ${isHard ? 'Hard' : 'Classic'} Mode`,
        type: 'info',
      });
    }
  };

  // 点击建议词，自动填充到当前行
  const handleWordClick = (word: string) => {
    // 关闭suggestions tooltip（用户已经点击了建议）
    closeTooltip('tooltip-suggestions-click');

    const letters = word.toUpperCase().split('');

    if (letters.length !== COLS) return;

    // 困难模式验证
    if (isHardMode) {
      const isValid = isWordValidForHardMode(word, grid, currentRowIndex);
      if (!isValid) {
        setToast({
          message: 'This word does not meet Hard Mode requirements',
          type: 'error',
        });
        return;
      }
    }

    const newGrid = [...grid];

    // 如果有每日答案，自动验证颜色
    if (dailyAnswer) {
      const statuses = validateGuess(word, dailyAnswer);
      newGrid[currentRowIndex] = letters.map((letter, index) => ({
        letter,
        status: statuses[index],
      }));
    } else {
      // 没有答案时使用默认颜色
      newGrid[currentRowIndex] = letters.map((letter, index) => ({
        letter,
        status: getDefaultStatus(letter, index),
      }));
    }

    setGrid(newGrid);
  };

  // 实时过滤候选词
  const updateCandidates = useCallback(() => {
    const result = filterCandidates(grid);

    // 困难模式下过滤建议词
    let filteredCandidates = result.candidates;
    if (isHardMode && currentRowIndex > 0) {
      filteredCandidates = result.candidates.filter(word =>
        isWordValidForHardMode(word, grid, currentRowIndex)
      );
    }

    // 将候选词转换为 Suggestion 格式
    const newSuggestions: Suggestion[] = filteredCandidates
      .slice(0, 10) // 只取前10个
      .map((word, index) => ({
        word: word.toUpperCase(),
        score: Math.round(100 - (index * 5)), // 简单的分数计算
        rank: index + 1,
      }));

    setSuggestions(newSuggestions);
    setSuggestionCount(filteredCandidates.length);
  }, [grid, isHardMode, currentRowIndex]);

  // 页面加载时获取每日推荐词和答案
  useEffect(() => {
    async function fetchDailyData() {
      try {
        setLoading(true);

        // 同时获取每日推荐和答案
        const [picksRes, answerRes] = await Promise.all([
          fetch('/api/daily-picks'),
          fetch('/api/daily-answer'),
        ]);

        const picksData = await picksRes.json();
        const answerData = await answerRes.json();

        if (picksData.success && picksData.picks?.length > 0) {
          const initialSuggestions: Suggestion[] = picksData.picks?.map((pick: { word: string; reason?: string }, index: number) => ({
            word: pick.word,
            score: 100 - index * 10,
            rank: index + 1,
            reason: pick.reason,
          }));
          setSuggestions(initialSuggestions);
          setSuggestionCount(picksData.picks.length);
        }

        // 设置每日答案
        if (answerData.success && answerData.answer) {
          setDailyAnswer(answerData.answer);
          console.log('Daily answer loaded:', answerData.answer);
        }
      } catch (error) {
        console.error('Failed to fetch daily data:', error);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }

    fetchDailyData();
  }, []);

  // 监听 grid 变化，实时更新候选词（初始加载后才生效）
  useEffect(() => {
    console.log(grid?.[0]?.some(tile => tile.letter !== ''));

    if (grid?.[0]?.some(tile => tile.letter !== '')) {
      updateCandidates();
    }
  }, [updateCandidates]);

  // 检测最后一行是否完成，自动添加新行
  useEffect(() => {
    const lastRow = grid[grid.length - 1];

    // 检查最后一行是否完成：所有格子都有字母且都已上色
    const isRowComplete = lastRow.every(
      tile => tile.letter !== '' && tile.status !== 'empty'
    );

    // 如果最后一行完成且未达到最大行数，添加新行
    if (isRowComplete && grid.length < MAX_ROWS) {
      setGrid(prev => [...prev, createEmptyRow()]);
      setCurrentRowIndex(prev => prev + 1);
    }
  }, [grid]);

  // 检测游戏完成
  useEffect(() => {
    // 如果游戏已经完成过，不再重复检测
    if (gameCompleted) return;

    // 遍历所有行，检查是否有全绿色的行（游戏成功）
    for (let i = 0; i < grid.length; i++) {
      const row = grid[i];
      const isWinRow = row.every(
        tile => tile.letter !== '' && tile.status === 'correct'
      );

      if (isWinRow) {
        // 游戏成功
        const result = {
          isWin: true,
          attempts: i + 1,
          resultText: formatGameResult(),
        };
        setGameResult(result);
        // setShowCompletionModal(true); // 隐藏完成弹窗
        setGameCompleted(true);
        return;
      }
    }
  }, [grid, gameCompleted]);

  // Listen for physical keyboard
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleEscape();
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === 'Enter') handleEnter();
      else if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key.toUpperCase());
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [grid, currentRowIndex, editingCell]);

  return (
    <>
      {/* Completion Modal */}
      {gameResult && (
        <CompletionModal
          isOpen={showCompletionModal}
          isWin={gameResult.isWin}
          attempts={gameResult.attempts}
          resultText={gameResult.resultText}
          onClose={() => setShowCompletionModal(false)}
        />
      )}

      <Header isHardMode={isHardMode} onModeChange={handleModeChange} />
      <main className="flex-1 w-full mx-auto px-3 py-4 sm:p-4 gap-8">

        {/* Toast 提示 */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* LEFT COLUMN (Grid & Keyboard) */}
        <div className="lg:col-span-8 flex flex-col items-center gap-8">

          {/* Instructions Box */}
          {showTips && (
            <div className="w-full max-w-3xl bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-primary border border-slate-200">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">touch_app</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                    Help Wordle - Free AI Solver for Classic & Hard Mode
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                    Type your word, then <span className="font-semibold">tap</span> tiles to cycle colors: <span className="text-primary font-bold">Green</span> (Correct), <span className="text-yellow-500 font-bold">Yellow</span> (Present), <span className="text-slate-500 font-bold">Grey</span> (Absent). <span className="font-semibold">Long-press</span> any tile to edit it. Get instant suggestions and win every game!
                  </p>
                </div>
                <button onClick={() => setShowTips(false)} className="absolute top-2 right-2 sm:static text-slate-400 hover:text-slate-700 transition-colors p-2">
                  <span className="material-symbols-outlined text-lg sm:text-xl">close</span>
                </button>
              </div>
            </div>
          )}


          {/* Game Grid 与 Suggestions 并排布局（桌面端）/ 垂直布局（移动端） */}
          <div className="flex flex-col items-center gap-4 w-full max-w-4xl">
            <div className="flex flex-col md:flex-row items-start justify-center gap-4 w-full">
              <div
                className="flex flex-col items-center gap-3 w-full md:w-auto relative z-10"
                onClick={() => {
                  // 移动端点击聚焦input以弹出键盘
                  if (isMobile && inputRef.current && !editingCell) {
                    inputRef.current.focus();
                  }
                }}
              >
                <Grid
                  grid={grid}
                  currentRowIndex={currentRowIndex}
                  onTileClick={handleTileClick}
                  onRightClick={handleRightClick}
                  editingCell={editingCell}
                />

                {/* Grid 下方的 Tooltip - 仅在桌面端显示 */}
                <div className="hidden md:block max-w-md">
                  <Tooltip
                    message="Left-click tiles to cycle colors, right-click to edit letters"
                    storageKey="tooltip-grid-interaction"
                  />
                </div>

                {/* 移动端提示 - 使用更简洁的文案 */}
                <div className="block md:hidden max-w-sm px-2">
                  <Tooltip
                    message="Tap anywhere to open keyboard, tap tiles to change colors"
                    storageKey="tooltip-grid-interaction-mobile"
                  />
                </div>
              </div>

              <div className="w-full md:w-auto flex justify-center">
                <Suggestions
                  suggestions={suggestions}
                  loading={loading}
                  count={suggestionCount}
                  onWordClick={handleWordClick}
                  onReset={handleReset}
                />
              </div>
            </div>
          </div>



          {/* 移动端隐藏input - 用于触发系统键盘 */}
          {isMobile && (
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className="fixed opacity-0"
              style={{ top: '-100px', left: '0', width: '1px', height: '1px' }}
              onInput={(e) => {
                const input = e.target as HTMLInputElement;
                const value = input.value.toUpperCase();

                if (value.length > 0) {
                  const lastChar = value[value.length - 1];
                  if (/^[A-Z]$/.test(lastChar)) {
                    handleKeyPress(lastChar);
                  }
                  // 清空input以便继续输入
                  input.value = '';
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace') {
                  e.preventDefault();
                  handleBackspace();
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  handleEnter();
                }
              }}
            />
          )}

        </div>

        {/* RIGHT COLUMN (Suggestions & Insights) */}
        {/* <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-[500px]">
           <Suggestions suggestions={suggestions} loading={loading} count={suggestionCount} />
           <Insights insights={insights} />
        </div> */}

      </main>

      {/* SEO Content Section - Collapsible */}
      <section className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <details className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
          <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-between">
            <span className="text-lg">📖 Learn More About Our Free Wordle Solver</span>
            <span className="material-symbols-outlined text-slate-400">expand_more</span>
          </summary>
          <div className="px-6 py-4 space-y-6 text-slate-600 border-t border-slate-100">
            {/* How It Works */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">How Our Free Wordle Solver Works</h2>
              <p className="text-base leading-relaxed mb-3">
                Help Wordle is a <strong>free AI-powered Wordle solver</strong> that instantly filters possible answers based on your color feedback. Our advanced algorithm analyzes thousands of five-letter words to give you the statistically best next guess for both classic and hard mode.
              </p>
              <p className="text-base leading-relaxed">
                Simply type your word guess, then <strong>tap tiles to set their colors</strong>: <span className="text-primary font-semibold">Green</span> for correct position, <span className="text-secondary font-semibold">Yellow</span> for wrong position, and <span className="text-slate-500 font-semibold">Gray</span> for letters not in the word. Our Wordle helper instantly updates with smart recommendations to help you win every game.
              </p>
            </div>

            {/* Best Starting Words */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Best Starting Words for Wordle</h2>
              <p className="text-base leading-relaxed mb-3">
                Choosing the <strong>best Wordle starting word</strong> is crucial for success. Our statistical analysis shows that <strong>CRANE, SLATE, TRACE, and ADIEU</strong> are among the top starting words because they contain the most common vowels and consonants in the English language.
              </p>
              <p className="text-base leading-relaxed">
                These <strong>best starting words for Wordle</strong> maximize your chances of getting useful green and yellow feedback on your first guess. Our AI solver automatically suggests optimal starting words based on letter frequency analysis, helping you establish a strong foundation for solving today's puzzle. Learn more about <a href="/best-starting-words" className="text-primary font-semibold hover:underline">why these words work best</a>.
              </p>
            </div>

            {/* Hard Mode Helper */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Master Wordle Hard Mode with Our Helper</h2>
              <p className="text-base leading-relaxed mb-3">
                Playing <strong>Wordle in hard mode</strong>? Our <strong>Wordle hard mode helper</strong> fully supports hard mode rules, where you must use confirmed letters in their correct positions and include all present letters in subsequent guesses. Check out our complete <a href="/hard-mode-guide" className="text-primary font-semibold hover:underline">Hard Mode strategy guide</a> for advanced tips.
              </p>
              <p className="text-base leading-relaxed mb-3">
                Switch to hard mode using the toggle in the header, and our solver will automatically filter suggestions to ensure they meet hard mode requirements. Whether you're tackling the daily Wordle puzzle or practicing your strategy, our <strong>free Wordle helper</strong> gives you smart hints and the best next moves to maintain your winning streak.
              </p>
              <p className="text-base leading-relaxed">
                Need help with today's puzzle? Check our <a href="/blog" className="text-primary font-semibold hover:underline">daily Wordle hints and answers</a> for spoiler-free guidance.
              </p>
            </div>

            {/* Additional Features */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-3">Why Choose Help Wordle?</h3>
              <ul className="space-y-2 text-base">
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary mr-2 mt-0.5">check_circle</span>
                  <span><strong>100% Free</strong> - No registration or payment required to use our Wordle solver</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary mr-2 mt-0.5">check_circle</span>
                  <span><strong>AI-Powered</strong> - Advanced algorithms for instant answer filtering and smart suggestions</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary mr-2 mt-0.5">check_circle</span>
                  <span><strong>Letter Frequency Analysis</strong> - Statistical insights to improve your Wordle strategy</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary mr-2 mt-0.5">check_circle</span>
                  <span><strong>Daily Help</strong> - Get hints and answers for today's Wordle puzzle without spoilers</span>
                </li>
              </ul>
            </div>
          </div>
        </details>
      </section>

      {/* Footer */}
      <footer className="w-full py-3 sm:py-4 text-center text-xs text-slate-400 flex flex-col items-center gap-2 sm:gap-3 px-3">
        {/* Partner Badge */}
        {/* <a 
          href="https://launchigniter.com/product/helpwordle-org?ref=badge-helpwordle-org" 
          target="_blank"
          rel="noopener"
        >
          <img 
            src="https://launchigniter.com/api/badge/helpwordle-org?theme=light" 
            alt="Featured on LaunchIgniter" 
            width="212" 
            height="55" 
          />
        </a> */}

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <a
            href="https://link.zhihu.com/?target=https://helpwordle.org/"
            className="hover:text-slate-500 transition-colors text-xs sm:text-sm"
            target="_blank"
            rel="noopener"
          >
            Community
          </a>
          <a
            href="https://link.csdn.net/?target=https://helpwordle.org/"
            className="hover:text-slate-500 transition-colors text-xs sm:text-sm"
            target="_blank"
            rel="noopener"
          >
            Dev
          </a>
          <a
            href="https://steamcommunity.com/linkfilter/?url=https://helpwordle.org/"
            className="hover:text-slate-500 transition-colors text-xs sm:text-sm"
            target="_blank"
            rel="noopener"
          >
            Gaming
          </a>
          <a
            href="https://www.youtube.com/redirect?q=https://helpwordle.org/"
            className="hover:text-slate-500 transition-colors text-xs sm:text-sm"
            target="_blank"
            rel="noopener"
          >
            Video
          </a>
          <a
            href="mailto:hi@helpwordle.org?subject=Help%20Wordle%20Feedback"
            className="hover:text-slate-500 transition-colors text-xs sm:text-sm"
            target="_blank"
            rel="noopener"
          >
            Feedback
          </a>
        </div>
      </footer>
    </>
  );
};

export default App;
