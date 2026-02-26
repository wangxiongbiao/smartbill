import { NextRequest, NextResponse } from "next/server";

const indexNowKey = process.env.INDEXNOW_KEY;

/**
 * IndexNow key verification endpoint
 * URL: /api/indexnow/[key]/route.ts
 * This allows search engines to verify ownership of the IndexNow key
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  // Only respond if the requested key matches our configured key
  if (indexNowKey && key === indexNowKey) {
    return new NextResponse(indexNowKey, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
