import Link from 'next/link';

interface AuthErrorPageProps {
    searchParams: Promise<{
        next?: string;
    }>;
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
    const params = await searchParams;
    const next = params.next || '/';

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
            <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Authentication Error</p>
                <h1 className="mt-4 text-3xl font-black tracking-tight">登录未完成</h1>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                    Google 登录流程没有成功完成，可能是弹窗被关闭、授权被取消，或回调已过期。
                </p>
                <div className="mt-8 flex gap-3">
                    <Link
                        href={next}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        返回继续
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        回到首页
                    </Link>
                </div>
            </div>
        </main>
    );
}
