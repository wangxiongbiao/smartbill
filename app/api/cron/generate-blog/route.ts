import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY!;
const cronSecret = process.env.CRON_SECRET;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.helpwordle.org";
const indexNowKey = process.env.INDEXNOW_KEY;

/**
 * Notify search engines about new content via IndexNow protocol
 * Supports: Bing, Yandex, Seznam, Naver
 */
async function notifyIndexNow(urls: string[]) {
  if (!indexNowKey) {
    console.log("[IndexNow] Skipped - INDEXNOW_KEY not configured");
    return;
  }

  const host = new URL(siteUrl).host;

  try {
    // IndexNow API - notifies Bing, Yandex, and other participating search engines
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host,
        key: indexNowKey,
        keyLocation: `${siteUrl}/${indexNowKey}.txt`,
        urlList: urls,
      }),
    });

    if (response.ok || response.status === 202) {
      console.log(`[IndexNow] Successfully notified for ${urls.length} URL(s)`);
    } else {
      console.error(`[IndexNow] Failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("[IndexNow] Error:", error);
  }
}

export async function GET(req: NextRequest) {
  // 1. Authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Determine Date (Tomorrow)
    // We want to generate content for the NEXT day to be ahead of the curve.
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD

    console.log(`[Cron] Generating content for: ${dateStr}`);

    // 3. Fetch Answer from NYT
    const nytUrl = `https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`;
    const nytRes = await fetch(nytUrl);

    if (!nytRes.ok) {
      return NextResponse.json(
        { error: `NYT API Error: ${nytRes.status} for date ${dateStr}` },
        { status: 500 }
      );
    }

    const nytData = await nytRes.json();
    const answer = nytData.solution; // e.g., "prism"
    const daysSinceLaunch = nytData.days_since_launch;

    if (!answer) {
      return NextResponse.json(
        { error: "No solution found in NYT response" },
        { status: 500 }
      );
    }

    // 4. Generate Content with AI
    const deepseek = new OpenAI({
      apiKey: deepseekApiKey,
      baseURL: "https://api.deepseek.com",
    });

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are a Wordle Expert and SEO Blog Writer.
Target Audience: People stuck on Wordle #${daysSinceLaunch} (${dateStr}).
Goal: Provide helpful hints without spoiling immediately, then provide the answer and strategy.
Output Format: JSON object with the following keys:
- "title": SEO optimized title (must contain "Wordle Hint" and the Date).
- "excerpt": Short meta description (max 160 chars).
- "content_markdown": The full blog post in Markdown format.
- "slug": URL slug, format: "wordle-hint-${dateStr}"

Content Structure:
- Introduction: Brief talk about difficulty (mention double letters/uncommon letters if any).
- Hints: 3 bullet points (1: Vague, 2: Specific, 3: Very Specific). DO NOT REVEAL THE ANSWER HERE.
- The Answer: A section clearly revealing the answer.
- Strategy: How to solve it efficiently or why it was tough.
`,
        },
        {
          role: "user",
          content: `Write the blog post for Wordle on ${dateStr}. The answer is "${answer}".`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const aiContent = JSON.parse(completion.choices[0].message.content || "{}");

    // Validate AI content
    if (!aiContent.title || !aiContent.content_markdown || !aiContent.slug) {
      throw new Error("Invalid AI response structure");
    }

    // 5. Save to Supabase
    // Note: We use upsert to handle re-runs gracefully
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from("blog_posts").upsert(
      {
        slug: aiContent.slug,
        title: aiContent.title,
        content: aiContent.content_markdown,
        excerpt: aiContent.excerpt || aiContent.title,
        publish_date: dateStr,
        wordle_answer: answer,
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    // 6. Revalidate
    // Revalidate the blog index and the specific post
    revalidatePath("/blog");
    revalidatePath(`/blog/${aiContent.slug}`);

    // 7. Notify search engines via IndexNow (Bing, Yandex, etc.)
    await notifyIndexNow([
      `${siteUrl}/blog/${aiContent.slug}`,
      `${siteUrl}/blog`,
      `${siteUrl}/sitemap.xml`,
    ]);

    return NextResponse.json({
      success: true,
      slug: aiContent.slug,
      date: dateStr,
      answer: "***", // Hide in logs
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
