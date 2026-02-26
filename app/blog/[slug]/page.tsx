import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogPost } from '@/types';
import ReactMarkdown from 'react-markdown';
import { Metadata } from 'next';

// Revalidate every hour
export const revalidate = 3600;

async function getPost(slug: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

    return data as BlogPost | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    // Await params for Next.js 15+
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        return {
            title: 'Post Not Found | Help Wordle',
        };
    }

    return {
        title: `${post.title} | Help Wordle`,
        description: post.excerpt,
        keywords: [
            'wordle',
            'wordle hints',
            'wordle answer',
            'wordle help',
            post.publish_date,
            'daily wordle',
            'wordle solver',
        ],
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.publish_date,
            siteName: 'Help Wordle',
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    // JSON-LD for Article
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publish_date,
        author: {
            '@type': 'Organization',
            name: 'Help Wordle AI',
        },
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Schema.org JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <nav className="mb-8 text-sm text-slate-500">
                <Link href="/blog" className="hover:text-primary transition-colors">
                    &larr; Back to Hints
                </Link>
            </nav>

            <article className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
                <header className="mb-8 text-center border-b border-slate-100 pb-8">
                    <div className="text-sm font-medium text-primary mb-2">
                        {post.publish_date}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 font-display leading-tight">
                        {post.title}
                    </h1>
                    {post.excerpt && (
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            {post.excerpt}
                        </p>
                    )}
                </header>

                {/* The Answer Box (Spoiler Protected) */}
                {post.wordle_answer && (
                    <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-lg text-center max-w-md mx-auto">
                        <h3 className="text-sm uppercase tracking-wide text-slate-500 font-bold mb-3">
                            The Answer
                        </h3>
                        <div className="relative group cursor-pointer">
                            {/* Blur Content */}
                            <div className="text-4xl font-bold text-slate-900 blur-md group-hover:blur-0 transition-all duration-300 select-none">
                                {post.wordle_answer.toUpperCase()}
                            </div>

                            {/* Overlay Text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                                <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-semibold text-slate-500 border shadow-sm">
                                    Hover/Tap to Reveal
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Markdown Content */}
                <div className="prose prose-lg prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown>
                        {post.content}
                    </ReactMarkdown>
                </div>

            </article>

            <div className="mt-12 text-center">
                <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">
                        Want to solve it yourself next time?
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Use our advanced Wordle Solver to get the best starting words and eliminate wrong guesses instantly.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-primary hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md"
                    >
                        Sort My Wordle
                    </Link>
                </div>
            </div>
        </div>
    );
}
