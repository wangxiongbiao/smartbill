import { NextResponse } from "next/server";

/**
 * 获取NYT Wordle的每日答案
 */
async function fetchWordleAnswer(date: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.nytimes.com/svc/wordle/v2/${date}.json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.solution || null;
  } catch (e) {
    console.error("Failed to fetch NYT answer:", e);
    return null;
  }
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || getToday();

  const answer = await fetchWordleAnswer(date);

  if (!answer) {
    return NextResponse.json(
      { success: false, error: "Answer not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    date,
    answer: answer.toUpperCase(),
  });
}
