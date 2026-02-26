import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { BlogPost } from '@/types';

// Revalidate every hour
export const revalidate = 3600;

async function getPosts() {
    // Use service role key to ensure we can read even if RLS is strict (though public read should be enabled)
    // Standard Next.js server component pattern would use cookies/auth helper but here we want public static-like generation
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('publish_date', { ascending: false });

    return (data || []) as BlogPost[];
}

export default async function BlogIndex() {
    const posts = await getPosts();

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-slate-800">
                    Wordle Hints & Strategies
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Daily spoiler-free hints, strategies, and answers to keep your streak alive.
                </p>
            </div>

            <div className="grid md:grid-cols-[1fr_300px] gap-8">
                {/* Main Content: Blog Entries */}
                <main className="space-y-6">
                    {posts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
                            <p className="text-slate-500 text-lg">No posts yet. Check back tomorrow!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <article key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
                                <Link href={`/blog/${post.slug}`} className="block group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                                            {post.publish_date}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-slate-600 text-lg mb-4 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center text-primary font-medium group-hover:underline">
                                        Read Hints & Answer
                                        <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
                                    </div>
                                </Link>
                            </article>
                        ))
                    )}
                </main>

                {/* Sidebar: Solver CTA */}
                <aside>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8">
                        <div className="text-center mb-4">
                            <span className="material-symbols-outlined text-4xl text-secondary">lightbulb</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Stuck on today's word?</h3>
                        <p className="text-slate-600 text-sm mb-6 text-center">
                            Our AI solver analyzes thousands of possibilities to give you the statistically best next guess.
                        </p>
                        <Link
                            href="/"
                            className="block w-full py-3 px-4 bg-primary hover:bg-green-600 text-white font-bold rounded-lg text-center transition-colors shadow-sm"
                        >
                            Open Wordle Solver
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    );
}
