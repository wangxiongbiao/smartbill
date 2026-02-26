/**
 * 手动插入SEO博客文章到Supabase
 * 运行方式: node scripts/insert-seo-blog.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const blogPost = {
  slug: "practice-wordle-unlimited-simulator",
  title:
    "Master the Game: The Ultimate Free Wordle Simulator for Practice & Strategy",
  excerpt:
    "Looking for a Wordle simulator without the daily limit? Use our free practice tool to test starting words and improve your strategy.",
  publish_date: new Date().toISOString().split("T")[0], // 今天的日期
  wordle_answer: null, // 这不是每日提示文章，不需要答案
  content: `Have you ever lost a 100-day Wordle streak because of one careless guess? Have you ever wondered if ADIEU is truly the best starting word, but only had one chance per day to test it?

That's exactly why we built **HelpWordle Practice Mode** — a free Wordle simulator where you can practice as much as you want, with no daily limit.

## Why You Need a Wordle Simulator

Don't risk your official streak on a hunch. A Wordle simulator is the best way to sharpen your skills before tackling the New York Times daily puzzle.

- **Test New Openers**: Want to switch from STARE to CRANE? Play 10 rounds here to see which one yields more green tiles.
- **Understand Patterns**: The more you play, the better you get at recognizing common letter structures (like -IGHT, -OUND, or SH-).
- **Stress-Free Gaming**: Enjoy Wordle without limits. If you fail, just hit refresh. No shame, only learning.

## How to Use HelpWordle to Test Your Starting Words

Many players search for the "best starting word," but the best way to learn is by doing. Our tool is designed specifically for strategy testing.

1. **Pick a Word**: Let's say you want to test "AUDIO" as your opener.
2. **Play 5 Rounds**: Use "AUDIO" as your first guess for 5 consecutive games in our practice mode.
3. **Analyze Results**: How often did you solve it in 3 tries? Did you get stuck on the 5th row?
4. **Consult the AI**: Unlike a basic Wordle archive, our built-in AI solver shows you the statistically best next guess based on your current tiles.

## Features That Make This the Best Practice Tool

Most Wordle unlimited clones are just simple copies of the original game. We built a tool for **thinkers**.

### Live Feedback
As you type each letter, our system instantly shows you whether it's correct (green), present (yellow), or absent (gray). No need to wait until you submit the full word.

### Hard Mode Support
Toggle between Standard and Hard Mode to simulate the real challenge. Hard Mode forces you to use discovered hints in subsequent guesses — just like the official game.

### Unlimited Plays
Play as many rounds as you want. Test theories, experiment with uncommon starters, and build muscle memory for those tricky 5-letter patterns.

## Ready to Level Up Your Wordle Game?

Stop guessing blindly. Stop losing streaks to bad luck.

HelpWordle is not just a game — it's your personal **Wordle training gym**.

[**Start Practicing Now →**](/)

Whether you're a casual player or a competitive streak-chaser, our practice mode will help you become a Wordle master.`,
};

async function insertBlog() {
  console.log("Inserting blog post...");
  console.log("Title:", blogPost.title);
  console.log("Slug:", blogPost.slug);

  const { data, error } = await supabase
    .from("blog_posts")
    .upsert(blogPost, { onConflict: "slug" })
    .select();

  if (error) {
    console.error("Error inserting blog:", error);
    process.exit(1);
  }

  console.log("✅ Blog post inserted successfully!");
  console.log("View at: /blog/" + blogPost.slug);
  console.log("Data:", data);
}

insertBlog();
