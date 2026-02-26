import { NextResponse } from 'next/server';
import { getDailyPicks, generateDailyPicks, getToday } from '@/services/dailyPicksService';

/**
 * 获取每日推荐词
 * - 如果当天已有数据，直接返回
 * - 如果当天没有数据，自动触发生成
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getToday();

    // 1. 先尝试获取现有数据
    let picks = await getDailyPicks(date);

    // 2. 如果没有数据或数据不足 5 条，触发生成
    if (!picks || picks.length < 5) {
      console.log(`No sufficient data for ${date}, generating...`);
      picks = await generateDailyPicks(date);
    }

    return NextResponse.json({
      success: true,
      date,
      picks,
      count: picks.length,
    });
  } catch (error: unknown) {
    console.error('Get Daily Picks Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
