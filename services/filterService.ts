/**
 * Wordle 词库过滤服务
 * 根据用户输入的颜色反馈，从词库中过滤出符合条件的候选答案
 */

import { TileState } from '../types';
import { answers } from '../data/wordlist';

/**
 * 字母约束条件
 */
interface LetterConstraint {
  // 确定位置：该位置必须是这个字母 (绿色)
  exactPositions: (string | null)[];  // 长度5，null表示未确定
  
  // 排除位置：该位置不能是这些字母 (黄色/灰色位置)
  excludedPositions: Set<string>[];   // 长度5，每个位置的排除字母集合
  
  // 必须包含的字母及其最少出现次数 (绿色+黄色)
  minCounts: Map<string, number>;
  
  // 已确定最多出现次数的字母 (有灰色时确定上限)
  maxCounts: Map<string, number>;
}

/**
 * 从网格状态解析约束条件
 * @param grid 用户输入的网格状态
 * @returns 解析出的约束条件
 */
function parseConstraints(grid: TileState[][]): LetterConstraint {
  const constraints: LetterConstraint = {
    exactPositions: [null, null, null, null, null],
    excludedPositions: [new Set(), new Set(), new Set(), new Set(), new Set()],
    minCounts: new Map(),
    maxCounts: new Map(),
  };

  // 遍历所有行
  for (const row of grid) {
    // 跳过空行
    if (row.every(tile => !tile.letter || tile.status === 'empty')) {
      continue;
    }

    // 统计当前行中每个字母的各状态出现次数
    const letterStats = new Map<string, { green: number; yellow: number; gray: number }>();
    
    row.forEach((tile, position) => {
      if (!tile.letter || tile.status === 'empty') return;
      
      const letter = tile.letter.toLowerCase();
      
      // 初始化字母统计
      if (!letterStats.has(letter)) {
        letterStats.set(letter, { green: 0, yellow: 0, gray: 0 });
      }
      
      const stats = letterStats.get(letter)!;
      
      switch (tile.status) {
        case 'correct':
          // 绿色：确定该位置必须是这个字母
          constraints.exactPositions[position] = letter;
          stats.green++;
          break;
          
        case 'present':
          // 黄色：字母存在但不在此位置
          constraints.excludedPositions[position].add(letter);
          stats.yellow++;
          break;
          
        case 'absent':
          // 灰色：字母不在此位置（可能完全不存在，或已达最大数量）
          constraints.excludedPositions[position].add(letter);
          stats.gray++;
          break;
      }
    });
    
    // 根据统计结果计算每个字母的约束
    letterStats.forEach((stats, letter) => {
      // 确认的出现次数 = 绿色数 + 黄色数
      const confirmedCount = stats.green + stats.yellow;
      
      // 更新最少出现次数（取最大值，因为可能有多行）
      const currentMin = constraints.minCounts.get(letter) || 0;
      if (confirmedCount > currentMin) {
        constraints.minCounts.set(letter, confirmedCount);
      }
      
      // 如果有灰色，说明已确定该字母的最大数量
      // 灰色表示"没有更多这个字母"
      if (stats.gray > 0) {
        const currentMax = constraints.maxCounts.get(letter);
        // 取更严格的限制（更小的值）
        if (currentMax === undefined || confirmedCount < currentMax) {
          constraints.maxCounts.set(letter, confirmedCount);
        }
      }
    });
  }

  return constraints;
}

/**
 * 根据约束条件过滤答案词
 * @param constraints 约束条件
 * @returns 符合条件的答案词列表
 */
function filterByConstraints(constraints: LetterConstraint): string[] {
  return answers.filter(word => {
    const letters = word.toLowerCase().split('');
    
    // 规则1: 检查确定位置 (绿色约束)
    // 如果某位置已确定字母，候选词该位置必须匹配
    for (let i = 0; i < 5; i++) {
      const required = constraints.exactPositions[i];
      if (required && letters[i] !== required) {
        return false;
      }
    }
    
    // 规则2: 检查排除位置 (黄色/灰色约束)
    // 候选词该位置不能是被排除的字母
    for (let i = 0; i < 5; i++) {
      if (constraints.excludedPositions[i].has(letters[i])) {
        return false;
      }
    }
    
    // 规则3: 检查最少出现次数 (黄色+绿色的字母必须存在足够次数)
    for (const [letter, minCount] of constraints.minCounts) {
      const actualCount = letters.filter(l => l === letter).length;
      if (actualCount < minCount) {
        return false;
      }
    }
    
    // 规则4: 检查最多出现次数 (有灰色的字母不能超过确定次数)
    for (const [letter, maxCount] of constraints.maxCounts) {
      const actualCount = letters.filter(l => l === letter).length;
      if (actualCount > maxCount) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * 过滤结果接口
 */
export interface FilterResult {
  candidates: string[];      // 候选词列表
  totalCandidates: number;   // 候选词总数
  constraints: {
    exactPositions: (string | null)[];
    excludedLetters: string[];
    requiredLetters: string[];
  };
}

/**
 * 主入口：从网格状态过滤候选词
 * @param grid 用户输入的网格状态
 * @returns 过滤结果
 */
export function filterCandidates(grid: TileState[][]): FilterResult {
  // 检查是否有有效输入
  const hasInput = grid.some(row => 
    row.some(tile => tile.letter && tile.status !== 'empty')
  );
  
  if (!hasInput) {
    // 无输入时返回全部答案词
    return {
      candidates: answers,
      totalCandidates: answers.length,
      constraints: {
        exactPositions: [null, null, null, null, null],
        excludedLetters: [],
        requiredLetters: [],
      }
    };
  }
  
  const constraints = parseConstraints(grid);
  const candidates = filterByConstraints(constraints);
  
  // 收集排除的字母（maxCount为0的字母）
  const excludedLetters: string[] = [];
  constraints.maxCounts.forEach((count, letter) => {
    if (count === 0) {
      excludedLetters.push(letter.toUpperCase());
    }
  });
  
  // 收集必须包含的字母
  const requiredLetters: string[] = [];
  constraints.minCounts.forEach((count, letter) => {
    if (count > 0) {
      requiredLetters.push(letter.toUpperCase());
    }
  });

  
  return {
    candidates,
    totalCandidates: candidates.length,
    constraints: {
      exactPositions: constraints.exactPositions,
      excludedLetters: excludedLetters.sort(),
      requiredLetters: requiredLetters.sort(),
    }
  };
}

/**
 * 获取候选词的前N个（用于显示建议）
 * @param grid 用户输入的网格状态
 * @param limit 返回数量限制
 * @returns 前N个候选词
 */
export function getTopCandidates(grid: TileState[][], limit: number = 10): string[] {
  const result = filterCandidates(grid);
  return result.candidates.slice(0, limit);
}

/**
 * 调试用：打印约束条件
 */
export function debugConstraints(grid: TileState[][]): void {
  const constraints = parseConstraints(grid);
  
  console.log('=== Wordle 过滤约束 ===');
  console.log('确定位置:', constraints.exactPositions.map((l, i) => l ? `${i}:${l.toUpperCase()}` : '-').join(' '));
  console.log('排除位置:', constraints.excludedPositions.map((set, i) => 
    set.size > 0 ? `${i}:[${[...set].map(l => l.toUpperCase()).join(',')}]` : '-'
  ).join(' '));
  console.log('最少次数:', [...constraints.minCounts.entries()].map(([l, c]) => `${l.toUpperCase()}≥${c}`).join(' '));
  console.log('最多次数:', [...constraints.maxCounts.entries()].map(([l, c]) => `${l.toUpperCase()}≤${c}`).join(' '));
}

export default {
  filterCandidates,
  getTopCandidates,
  debugConstraints,
};
