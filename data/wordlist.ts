/**
 * Wordle 词库
 * 来源: https://github.com/stuartpb/wordles
 * 
 * answers: 所有可能的答案词 (2,309个)
 * validGuesses: 可接受的猜测词但不是答案 (10,638个)
 */

import answersData from './answers.json';
import validGuessesData from './validGuesses.json';

// 答案词库 - 每日谜题的正确答案池
export const answers: string[] = answersData;

// 猜测词库 - 可接受的猜测词但不是答案
export const validGuesses: string[] = validGuessesData;

// 所有有效词汇 (答案 + 猜测)
export const allValidWords: Set<string> = new Set([...answers, ...validGuesses]);

// 答案词集合 (用于快速查找)
export const answersSet: Set<string> = new Set(answers);

/**
 * 检查单词是否为有效的 Wordle 猜测
 */
export const isValidWord = (word: string): boolean => {
  return allValidWords.has(word.toLowerCase());
};

/**
 * 检查单词是否可能是答案
 */
export const isPossibleAnswer = (word: string): boolean => {
  return answersSet.has(word.toLowerCase());
};

/**
 * 根据条件过滤答案词
 * @param filters 过滤条件
 * @returns 符合条件的答案词列表
 */
export const filterAnswers = (filters: {
  mustContain?: string[];      // 必须包含的字母
  mustNotContain?: string[];   // 不能包含的字母
  exactPositions?: (string | null)[]; // 确定位置的字母 (5位, null表示未知)
  wrongPositions?: { letter: string; position: number }[]; // 字母存在但位置错误
}): string[] => {
  return answers.filter(word => {
    const letters = word.split('');
    
    // 检查必须包含的字母
    if (filters.mustContain) {
      for (const letter of filters.mustContain) {
        if (!word.includes(letter)) return false;
      }
    }
    
    // 检查不能包含的字母
    if (filters.mustNotContain) {
      for (const letter of filters.mustNotContain) {
        if (word.includes(letter)) return false;
      }
    }
    
    // 检查确定位置的字母
    if (filters.exactPositions) {
      for (let i = 0; i < 5; i++) {
        const expected = filters.exactPositions[i];
        if (expected && letters[i] !== expected) return false;
      }
    }
    
    // 检查位置错误的字母
    if (filters.wrongPositions) {
      for (const { letter, position } of filters.wrongPositions) {
        if (letters[position] === letter) return false;
        if (!word.includes(letter)) return false;
      }
    }
    
    return true;
  });
};

export default {
  answers,
  validGuesses,
  allValidWords,
  answersSet,
  isValidWord,
  isPossibleAnswer,
  filterAnswers,
};
