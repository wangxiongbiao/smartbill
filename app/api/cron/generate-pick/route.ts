import { NextResponse } from 'next/server';
import { generateDailyPicks, getToday } from '@/services/dailyPicksService';

/**
 * Vercel Cron 定时任务
 * 每日 UTC 00:00 自动触发
 */
export async function GET(request: Request) {
  // 1. 安全鉴权
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const today = getToday();
    
    // 2. 调用共用生成逻辑
    const picks = await generateDailyPicks(today);

    return NextResponse.json({
      success: true,
      message: picks.length >= 5 ? 'Generated successfully' : 'Already exists for today',
      date: today,
      count: picks.length,
      picks,
    });
  } catch (error: unknown) {
    console.error('Cron Job Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
