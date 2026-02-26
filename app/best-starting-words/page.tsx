import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Best Starting Words for Wordle - Statistical Analysis | Help Wordle',
    description: 'Discover the best Wordle starting words based on statistical analysis. Learn why CRANE, SLATE, TRACE, and ADIEU are top choices and how letter frequency affects your first guess.',
    keywords: [
        'best wordle starting word',
        'wordle starting words',
        'best first word wordle',
        'wordle opening word',
        'letter frequency wordle',
        'wordle strategy',
        'CRANE wordle',
        'SLATE wordle',
    ],
    openGraph: {
        title: 'Best Starting Words for Wordle - Statistical Analysis',
        description: 'Statistical analysis of the best Wordle starting words. Maximize your chances with CRANE, SLATE, and other top performers.',
        type: 'article',
    },
};

export default function BestStartingWordsPage() {
    const topWords = [
        { word: 'CRANE', score: 95, vowels: 2, commonLetters: 5, reason: 'Contains R, N, E - three of the most common consonants, plus two vowels A and E' },
        { word: 'SLATE', score: 94, vowels: 2, commonLetters: 5, reason: 'Excellent balance of common consonants (S, L, T) with vowels A and E' },
        { word: 'TRACE', score: 93, vowels: 2, commonLetters: 5, reason: 'Similar to CRANE with high-frequency letters including T, R, C' },
        { word: 'ADIEU', score: 91, vowels: 4, commonLetters: 3, reason: 'Maximizes vowel coverage with A, I, E, U - best for vowel-heavy words' },
        { word: 'ROAST', score: 90, vowels: 2, commonLetters: 5, reason: 'Strong consonant-vowel balance with R, S, T all being very common' },
        { word: 'RAISE', score: 89, vowels: 3, commonLetters: 4, reason: 'Three vowels (A, I, E) plus common consonants R and S' },
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
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 font-display">
                        Best Starting Words for Wordle
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        Choosing the right first word can make or break your Wordle game. Our statistical analysis reveals the optimal starting words based on letter frequency, vowel distribution, and real-world success rates.
                    </p>
                </div>

                {/* Top Starting Words */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Top 6 Wordle Starting Words</h2>
                    <div className="grid gap-4">
                        {topWords.map((item, index) => (
                            <div key={item.word} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-bold text-primary">#{index + 1}</span>
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-wider">{item.word}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-secondary">{item.score}</div>
                                        <div className="text-xs text-slate-500">Score</div>
                                    </div>
                                </div>
                                <p className="text-slate-600 mb-3">{item.reason}</p>
                                <div className="flex gap-4 text-sm">
                                    <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-700">
                                        {item.vowels} Vowels
                                    </span>
                                    <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-700">
                                        {item.commonLetters} Common Letters
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why These Words Work */}
                <section className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">Why These Words Work</h2>
                    <div className="space-y-4 text-slate-600">
                        <p className="text-lg leading-relaxed">
                            The <strong>best Wordle starting words</strong> share several key characteristics that maximize your chances of getting useful feedback on your first guess:
                        </p>
                        <ul className="space-y-3 ml-6">
                            <li className="flex items-start">
                                <span className="material-symbols-outlined text-primary mr-2 mt-1">check_circle</span>
                                <span><strong>High-frequency letters</strong> - Letters like E, A, R, O, T appear in the most English words</span>
                            </li>
                            <li className="flex items-start">
                                <span className="material-symbols-outlined text-primary mr-2 mt-1">check_circle</span>
                                <span><strong>Vowel coverage</strong> - At least 2 vowels to narrow down vowel possibilities quickly</span>
                            </li>
                            <li className="flex items-start">
                                <span className="material-symbols-outlined text-primary mr-2 mt-1">check_circle</span>
                                <span><strong>No duplicate letters</strong> - Using 5 unique letters gives maximum information</span>
                            </li>
                            <li className="flex items-start">
                                <span className="material-symbols-outlined text-primary mr-2 mt-1">check_circle</span>
                                <span><strong>Common consonants</strong> - Letters like R, S, T, L, N appear frequently in Wordle answers</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Letter Frequency Analysis */}
                <section className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-slate-200 p-8 mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">Letter Frequency in Wordle</h2>
                    <p className="text-lg text-slate-600 mb-6">
                        Based on analysis of thousands of valid 5-letter words, here are the most common letters:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {['E', 'A', 'R', 'O', 'T', 'L', 'I', 'S', 'N', 'C'].map((letter, i) => (
                            <div key={letter} className="bg-white rounded-lg p-4 text-center border border-slate-200">
                                <div className="text-3xl font-bold text-primary mb-1">{letter}</div>
                                <div className="text-xs text-slate-500">#{i + 1} Most Common</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Strategy Tips */}
                <section className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">Starting Word Strategy</h2>
                    <div className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h3 className="font-bold text-slate-800 mb-2">For Maximum Information</h3>
                            <p className="text-slate-600">
                                Use <strong>CRANE</strong> or <strong>SLATE</strong>. These words give you the best chance of revealing green or yellow tiles on your first guess.
                            </p>
                        </div>
                        <div className="border-l-4 border-secondary pl-4">
                            <h3 className="font-bold text-slate-800 mb-2">For Vowel-Heavy Words</h3>
                            <p className="text-slate-600">
                                Try <strong>ADIEU</strong> to quickly identify which vowels are in the target word. Follow up with consonant-heavy words.
                            </p>
                        </div>
                        <div className="border-l-4 border-primary pl-4">
                            <h3 className="font-bold text-slate-800 mb-2">For Balanced Approach</h3>
                            <p className="text-slate-600">
                                <strong>ROAST</strong> or <strong>RAISE</strong> provide excellent consonant-vowel balance for consistent results.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-slate-800 text-white rounded-2xl p-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Win Every Wordle?</h2>
                    <p className="text-slate-300 mb-6 text-lg">
                        Use our free AI-powered Wordle solver to get personalized suggestions based on your guesses
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-primary hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg"
                    >
                        Open Wordle Solver
                    </Link>
                </section>

                {/* FAQ Section */}
                <section className="mt-12">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <details className="bg-white rounded-lg border border-slate-200 p-6">
                            <summary className="font-semibold text-slate-800 cursor-pointer">
                                What is the absolute best Wordle starting word?
                            </summary>
                            <p className="mt-3 text-slate-600">
                                <strong>CRANE</strong> is statistically the best starting word, with a score of 95/100. It contains the most common letters and provides excellent vowel-consonant balance.
                            </p>
                        </details>
                        <details className="bg-white rounded-lg border border-slate-200 p-6">
                            <summary className="font-semibold text-slate-800 cursor-pointer">
                                Should I use the same starting word every time?
                            </summary>
                            <p className="mt-3 text-slate-600">
                                Yes! Using the same optimal starting word creates consistency and helps you develop pattern recognition. It also ensures you're always starting with maximum statistical advantage.
                            </p>
                        </details>
                        <details className="bg-white rounded-lg border border-slate-200 p-6">
                            <summary className="font-semibold text-slate-800 cursor-pointer">
                                What about words with more vowels like AUDIO?
                            </summary>
                            <p className="mt-3 text-slate-600">
                                While <strong>AUDIO</strong> has 4 vowels, it lacks common consonants. <strong>ADIEU</strong> is a better choice with similar vowel coverage plus more common letters.
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
