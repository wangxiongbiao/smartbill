import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Wordle Hard Mode Guide - Master the Challenge | Help Wordle',
    description: 'Complete guide to mastering Wordle Hard Mode. Learn advanced strategies, rules, and tips to maintain your streak while playing under hard mode constraints.',
    keywords: [
        'wordle hard mode',
        'wordle hard mode helper',
        'hard mode wordle',
        'wordle hard mode rules',
        'wordle hard mode strategy',
        'wordle hard mode tips',
        'how to play wordle hard mode',
    ],
    openGraph: {
        title: 'Wordle Hard Mode Guide - Master the Challenge',
        description: 'Master Wordle Hard Mode with our complete guide covering rules, strategies, and expert tips.',
        type: 'article',
    },
};

export default function HardModeGuidePage() {
    const rules = [
        {
            title: 'Use Revealed Hints',
            icon: 'check_circle',
            description: 'Any revealed hints (green or yellow tiles) must be used in subsequent guesses.',
        },
        {
            title: 'Correct Position Letters',
            icon: 'place',
            description: 'Green letters must remain in their correct positions in all future guesses.',
        },
        {
            title: 'Include Present Letters',
            icon: 'sync',
            description: 'Yellow letters must be included in your next guesses, even if not in the right spot.',
        },
    ];

    const strategies = [
        {
            step: 1,
            title: 'Choose Your Starting Word Wisely',
            content: 'In hard mode, your first word matters even more. Use words like CRANE or SLATE that give maximum information without locking you into difficult patterns.',
            tip: 'Avoid starting with words that have repeated letters (like SPELL or ROBOT)',
        },
        {
            step: 2,
            title: 'Plan Ahead for Green Letters',
            content: 'Before making a guess, verify that all green letters from previous guesses are in their correct positions. One wrong placement means starting over.',
            tip: 'Keep a mental or written note of confirmed letter positions',
        },
        {
            step: 3,
            title: 'Strategic Yellow Letter Placement',
            content: 'Yellow letters must be included but in different positions. Use your knowledge of word patterns to test different locations efficiently.',
            tip: 'Try common letter combinations (like -ING, -ED, -ER) to narrow down positions',
        },
        {
            step: 4,
            title: 'Avoid Getting Trapped',
            content: 'Be cautious of guesses that might lock you into impossible patterns. If you have multiple yellows, consider which positions they could realistically occupy.',
            tip: 'Use our Wordle solver to validate your planned guess meets hard mode rules',
        },
    ];

    const commonMistakes = [
        {
            mistake: 'Forgetting Yellow Letters',
            solution: 'Always double-check that your next guess includes ALL yellow letters from previous attempts.',
        },
        {
            mistake: 'Moving Green Letters',
            solution: 'Green letters are locked! They must stay exactly where they appeared.',
        },
        {
            mistake: 'Using Eliminated Letters',
            solution: 'Gray letters are still eliminated in hard mode. Don\'t use them in future guesses.',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-4 px-4">
                <div className="container mx-auto max-w-4xl flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="material-symbols-outlined text-primary">arrow_back</span>
                        <span className="font-semibold text-slate-700">Back to Solver</span>
                    </Link>
                    <h1 className="text-xl font-bold text-slate-800">Help Wordle</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary to-green-700 text-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-5xl">military_tech</span>
                        <h1 className="text-4xl md:text-5xl font-bold font-display">
                            Wordle Hard Mode Guide
                        </h1>
                    </div>
                    <p className="text-xl opacity-90 leading-relaxed">
                        Master the ultimate Wordle challenge with our comprehensive guide to Hard Mode rules, strategies, and expert tips.
                    </p>
                </div>

                {/* What is Hard Mode */}
                <section className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">What is Wordle Hard Mode?</h2>
                    <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                        <strong>Wordle Hard Mode</strong> adds an extra layer of difficulty by forcing you to use all revealed clues in subsequent guesses. Unlike classic mode where you can test new letters freely, hard mode requires strategic thinking and careful planning.
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        This mode is perfect for experienced players looking to challenge themselves and improve their Wordle strategy.
                    </p>
                </section>

                {/* Hard Mode Rules */}
                <section className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Hard Mode Rules</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {rules.map((rule) => (
                            <div key={rule.title} className="bg-white rounded-xl border-2 border-primary/20 p-6 hover:border-primary/40 transition-colors">
                                <span className="material-symbols-outlined text-5xl text-primary mb-3 block">{rule.icon}</span>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{rule.title}</h3>
                                <p className="text-slate-600">{rule.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Step-by-Step Strategy */}
                <section className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Hard Mode Strategy (Step-by-Step)</h2>
                    <div className="space-y-6">
                        {strategies.map((strategy) => (
                            <div key={strategy.step} className="bg-white rounded-xl border border-slate-200 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                                        {strategy.step}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{strategy.title}</h3>
                                        <p className="text-slate-600 mb-3">{strategy.content}</p>
                                        <div className="bg-secondary/10 border-l-4 border-secondary px-4 py-3 rounded">
                                            <p className="text-sm text-slate-700">
                                                <strong>💡 Pro Tip:</strong> {strategy.tip}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Common Mistakes */}
                <section className="bg-red-50 rounded-xl border border-red-200 p-8 mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Common Hard Mode Mistakes to Avoid</h2>
                    <div className="space-y-4">
                        {commonMistakes.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg p-5 border border-red-100">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                                    <div>
                                        <h3 className="font-bold text-slate-800 mb-1">❌ {item.mistake}</h3>
                                        <p className="text-slate-600">✅ {item.solution}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Example Walkthrough */}
                <section className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Example Hard Mode Walkthrough</h2>
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="font-bold text-slate-700">Guess 1:</span>
                                <div className="flex gap-1">
                                    {['C', 'R', 'A', 'N', 'E'].map((letter, i) => (
                                        <div key={i} className={`w-12 h-12 flex items-center justify-center font-bold text-white rounded ${i === 1 ? 'bg-secondary' : i === 4 ? 'bg-primary' : 'bg-slate-400'}`}>
                                            {letter}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-600 ml-24">R is in the word but wrong position. E is correct!</p>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="font-bold text-slate-700">Guess 2:</span>
                                <div className="flex gap-1">
                                    {['F', 'I', 'R', 'E', 'S'].map((letter, i) => (
                                        <div key={i} className={`w-12 h-12 flex items-center justify-center font-bold text-white rounded ${i === 2 ? 'bg-secondary' : i === 3 ? 'bg-primary' : i === 4 ? 'bg-primary' : 'bg-slate-400'}`}>
                                            {letter}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-600 ml-24">Hard mode forces us to keep E in position 5. R still not in right spot, but S is correct!</p>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="font-bold text-slate-700">Guess 3:</span>
                                <div className="flex gap-1">
                                    {['W', 'O', 'R', 'S', 'E'].map((letter, i) => (
                                        <div key={i} className="w-12 h-12 flex items-center justify-center font-bold text-white rounded bg-primary">
                                            {letter}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-600 ml-24">✅ Success! R moved to position 3, kept E and S where required. WORSE is the answer!</p>
                        </div>
                    </div>
                </section>

                {/* Using Our Helper */}
                <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-8 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-4xl text-primary">smart_toy</span>
                        <h2 className="text-3xl font-bold">Use Our Hard Mode Helper</h2>
                    </div>
                    <p className="text-slate-200 mb-6 text-lg">
                        Our <strong>AI-powered Wordle solver</strong> automatically validates your guesses against hard mode rules and suggests only valid words that meet all constraints.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-primary hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg"
                    >
                        Try Hard Mode Solver
                    </Link>
                </section>

                {/* FAQ */}
                <section>
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Hard Mode FAQ</h2>
                    <div className="space-y-4">
                        <details className="bg-white rounded-lg border border-slate-200 p-6">
                            <summary className="font-semibold text-slate-800 cursor-pointer">
                                Can I switch between classic and hard mode mid-game?
                            </summary>
                            <p className="mt-3 text-slate-600">
                                No, you must enable hard mode before your first guess. Once you start a game in either mode, you can't change it for that puzzle.
                            </p>
                        </details>
                        <details className="bg-white rounded-lg border border-slate-200 p-6">
                            <summary className="font-semibold text-slate-800 cursor-pointer">
                                Does hard mode give you harder words to solve?
                            </summary>
                            <p className="mt-3 text-slate-600">
                                No, the target word is the same in both modes. Hard mode only changes the rules about how you can make guesses, not the difficulty of the word itself.
                            </p>
                        </details>
                        <details className="bg-white rounded-lg border border-slate-200 p-6">
                            <summary className="font-semibold text-slate-800 cursor-pointer">
                                What's a good hard mode win rate?
                            </summary>
                            <p className="mt-3 text-slate-600">
                                A 90%+ win rate in hard mode is excellent. Most experienced players maintain an 85-95% success rate with strategic play.
                            </p>
                        </details>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-6 px-4 mt-12">
                <div className="container mx-auto max-w-4xl text-center">
                    <p className="text-slate-500 text-sm">
                        <Link href="/" className="text-primary hover:underline">Help Wordle</Link> - Free AI-Powered Wordle Solver
                    </p>
                </div>
            </footer>
        </div>
    );
}
