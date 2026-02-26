import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// 初始化 Supabase Admin 客户端 (用于写入，绕过 RLS)
// 在构建时使用默认值，运行时会使用实际的环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// 初始化 DeepSeek 客户端 (兼容 OpenAI SDK)
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'placeholder-key',
  baseURL: 'https://api.deepseek.com',
});

export interface DailyPick {
  id?: number;
  date: string;
  word: string;
  reason: string;
  model_used: string;
  created_at?: string;
}

/**
 * 获取今天的日期 (UTC)
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 生成每日推荐词（5个）
 */
// Helper to fetch NYT answer
async function fetchWordleAnswer(date: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.nytimes.com/svc/wordle/v2/${date}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.solution || null;
  } catch (e) {
    console.error('Failed to fetch NYT answer:', e);
    return null;
  }
}

export async function generateDailyPicks(date: string): Promise<DailyPick[]> {
  // 运行时验证环境变量
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('Missing required environment variable: DEEPSEEK_API_KEY');
  }

  try {
    // 1. 检查今天是否已经有数据
    const { data: existing } = await supabase
      .from('daily_picks')
      .select('*')
      .eq('date', date);

    // 如果已有 5 条或更多，直接返回
    if (existing && existing.length >= 5) {
      return existing;
    }

    // 2. 获取今日正确答案（作为“作弊码”传给 AI）
    const trueAnswer = await fetchWordleAnswer(date);
    const answerContext = trueAnswer 
      ? `The secret answer for today (${date}) is "${trueAnswer.toUpperCase()}". DO NOT REVEAL IT. Instead, use this knowledge to suggest starting words that are particularly effective for this specific answer (e.g., revealing key vowels or consonants early).`
      : `I do not know the answer for today. Just interpret based on general probability.`;

    // 3. 调用 DeepSeek 生成 5 个推荐词
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a Wordle Strategy Expert.
Task: Recommend FIVE different best starting words for today, ordered by strategic value.
Context: ${answerContext}

Requirements:
1. absolutely NO spoilers. Do not pick the answer itself as a starter unless it is a very common starting word (like SLATE).
2. The reason should sound analytical, not like you peeked at the answer.
3. Varied strategies (some vowel-heavy, some consonant-heavy).

Output Format: JSON object with key "picks" containing an array of 5 objects, each with:
- "word": 5 letters, uppercase, unique
- "reason": max 20 words, encouraging and strategic

Example:
{
  "picks": [
    {"word": "CRANE", "reason": "Excellent vowel coverage and common consonants"},
    {"word": "SLATE", "reason": "High frequency letters in optimal positions"},
    ...
  ]
}`,
        },
        {
          role: 'user',
          content: `Generate 5 strategic Wordle starters for ${date}.`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const aiContent = JSON.parse(completion.choices[0].message.content || '{}');

    // 验证 AI 返回的数据格式
    if (!aiContent.picks || !Array.isArray(aiContent.picks) || aiContent.picks.length !== 5) {
      throw new Error('Invalid AI response: must return 5 picks');
    }

    // 验证每个词都是 5 个字母
    for (const pick of aiContent.picks) {
      if (!pick.word || pick.word.length !== 5) {
        throw new Error(`Invalid word: ${pick.word}`);
      }
    }

    // 4. 批量写入数据库
    const records = aiContent.picks.map((pick: { word: string; reason: string }) => ({
      date,
      word: pick.word.toUpperCase(),
      reason: pick.reason,
      model_used: 'deepseek-chat',
    }));

    const { data, error } = await supabase
      .from('daily_picks')
      .insert(records)
      .select();

    if (error) throw error;

    return data || [];
  } catch (error: unknown) {
    console.error('Generate Daily Picks Error:', error);
    throw error;
  }
}

/**
 * 获取指定日期的推荐词
 */
export async function getDailyPicks(date: string): Promise<DailyPick[]> {
  const { data, error } = await supabase
    .from('daily_picks')
    .select('*')
    .eq('date', date)
    .order('id', { ascending: true });

  if (error) throw error;

  return data || [];
}
