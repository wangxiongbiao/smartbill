/**
 * Wordle 困难模式验证服务
 * 验证用户输入是否符合困难模式规则
 */

import { TileState } from '../types';

/**
 * 困难模式约束条件
 */
export interface HardModeConstraints {
  // 必须在特定位置使用的字母（绿色约束）
  requiredPositions: (string | null)[]; // 长度5
  
  // 必须包含的字母（黄色约束）
  requiredLetters: Set<string>;
  
  // 不能在特定位置使用的字母（黄色的位置信息）
  forbiddenPositions: Map<number, Set<string>>; // position -> letters
}

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  violations: string[];
}

/**
 * 从已完成的行中提取困难模式约束
 * @param grid 游戏网格
 * @param currentRowIndex 当前行索引
 * @returns 困难模式约束
 */
export function extractHardModeConstraints(
  grid: TileState[][],
  currentRowIndex: number
): HardModeConstraints {
  const constraints: HardModeConstraints = {
    requiredPositions: [null, null, null, null, null],
    requiredLetters: new Set<string>(),
    forbiddenPositions: new Map(),
  };

  // 只分析当前行之前的已完成行
  for (let rowIndex = 0; rowIndex < currentRowIndex; rowIndex++) {
    const row = grid[rowIndex];
    
    // 跳过空行
    if (row.every(tile => !tile.letter || tile.status === 'empty')) {
      continue;
    }

    row.forEach((tile, colIndex) => {
      if (!tile.letter || tile.status === 'empty') return;
      
      const letter = tile.letter.toUpperCase();

      switch (tile.status) {
        case 'correct':
          // 绿色：该位置必须使用这个字母
          constraints.requiredPositions[colIndex] = letter;
          constraints.requiredLetters.add(letter);
          break;

        case 'present':
          // 黄色：必须包含这个字母，但不能在此位置
          constraints.requiredLetters.add(letter);
          if (!constraints.forbiddenPositions.has(colIndex)) {
            constraints.forbiddenPositions.set(colIndex, new Set());
          }
          constraints.forbiddenPositions.get(colIndex)!.add(letter);
          break;

        case 'absent':
          // 灰色：不影响困难模式约束（字母不存在或已达上限）
          break;
      }
    });
  }

  return constraints;
}

/**
 * 验证单词是否符合困难模式规则
 * @param word 要验证的单词（5个字母）
 * @param constraints 困难模式约束
 * @returns 验证结果
 */
export function validateWord(
  word: string,
  constraints: HardModeConstraints
): ValidationResult {
  const violations: string[] = [];
  const letters = word.toUpperCase().split('');

  // 验证规则1：检查必须在特定位置的字母（绿色约束）
  constraints.requiredPositions.forEach((requiredLetter, position) => {
    if (requiredLetter && letters[position] !== requiredLetter) {
      violations.push(
        `Position ${position + 1} must be "${requiredLetter}" (previous correct guess)`
      );
    }
  });

  // 验证规则2：检查必须包含的字母（黄色约束）
  constraints.requiredLetters.forEach(requiredLetter => {
    // 如果该字母已经在某个位置确定（绿色），则不需要额外检查
    const isInRequiredPosition = constraints.requiredPositions.some(
      pos => pos === requiredLetter
    );
    
    if (!isInRequiredPosition && !letters.includes(requiredLetter)) {
      violations.push(
        `Must contain letter "${requiredLetter}" (previous clue)`
      );
    }
  });

  // 验证规则3：检查不能在禁止位置的字母（黄色的位置约束）
  constraints.forbiddenPositions.forEach((forbiddenLetters, position) => {
    const letterAtPosition = letters[position];
    if (forbiddenLetters.has(letterAtPosition)) {
      violations.push(
        `Letter "${letterAtPosition}" cannot be at position ${position + 1} (previous yellow clue)`
      );
    }
  });

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * 验证用户输入的当前行是否符合困难模式
 * @param grid 游戏网格
 * @param currentRowIndex 当前行索引
 * @returns 验证结果
 */
export function validateCurrentRow(
  grid: TileState[][],
  currentRowIndex: number
): ValidationResult {
  const currentRow = grid[currentRowIndex];
  
  // 检查当前行是否已填满
  const isFull = currentRow.every(tile => tile.letter !== '');
  if (!isFull) {
    return { isValid: true, violations: [] };
  }

  // 提取当前输入的单词
  const word = currentRow.map(tile => tile.letter).join('');
  
  // 提取困难模式约束
  const constraints = extractHardModeConstraints(grid, currentRowIndex);
  
  // 验证单词
  return validateWord(word, constraints);
}

/**
 * 检查单词是否符合困难模式约束（用于过滤建议词）
 * @param word 候选单词
 * @param grid 游戏网格
 * @param currentRowIndex 当前行索引
 * @returns 是否符合约束
 */
export function isWordValidForHardMode(
  word: string,
  grid: TileState[][],
  currentRowIndex: number
): boolean {
  const constraints = extractHardModeConstraints(grid, currentRowIndex);
  const result = validateWord(word, constraints);
  return result.isValid;
}

/**
 * 获取人类可读的约束描述
 * @param constraints 困难模式约束
 * @returns 约束描述数组
 */
export function getConstraintDescriptions(constraints: HardModeConstraints): string[] {
  const descriptions: string[] = [];

  // 描述位置约束
  constraints.requiredPositions.forEach((letter, position) => {
    if (letter) {
      descriptions.push(`Position ${position + 1}: ${letter}`);
    }
  });

  // 描述必须包含的字母（排除已在位置约束中的）
  const positionLetters = new Set(
    constraints.requiredPositions.filter(l => l !== null)
  );
  
  const additionalRequiredLetters = [...constraints.requiredLetters].filter(
    letter => !positionLetters.has(letter)
  );
  
  if (additionalRequiredLetters.length > 0) {
    descriptions.push(`Must contain: ${additionalRequiredLetters.join(', ')}`);
  }

  return descriptions;
}

export default {
  extractHardModeConstraints,
  validateWord,
  validateCurrentRow,
  isWordValidForHardMode,
  getConstraintDescriptions,
};
