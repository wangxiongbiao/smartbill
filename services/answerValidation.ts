import { TileStatus } from "@/types";

/**
 * 验证猜测的单词并返回每个字母的状态
 * @param guess 用户猜测的单词
 * @param answer 正确答案
 * @returns 每个位置的状态数组
 */
export function validateGuess(guess: string, answer: string): TileStatus[] {
  const guessLetters = guess.toUpperCase().split("");
  const answerLetters = answer.toUpperCase().split("");
  const result: TileStatus[] = Array(5).fill("absent");

  // 记录答案中每个字母的可用次数
  const letterCounts: Record<string, number> = {};
  answerLetters.forEach((letter) => {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  });

  // 第一遍：标记所有绿色（位置正确）
  guessLetters.forEach((letter, i) => {
    if (letter === answerLetters[i]) {
      result[i] = "correct";
      letterCounts[letter]--;
    }
  });

  // 第二遍：标记黄色（字母存在但位置错误）
  guessLetters.forEach((letter, i) => {
    if (result[i] === "correct") return; // 已经是绿色，跳过

    if (letterCounts[letter] && letterCounts[letter] > 0) {
      result[i] = "present";
      letterCounts[letter]--;
    }
  });

  return result;
}
