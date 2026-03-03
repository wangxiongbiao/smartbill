import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log('[OAuth Callback] Session established successfully')
            // 重定向到原始页面或首页
            return NextResponse.redirect(`${origin}${next}`)
        }

        console.error('[OAuth Callback] Exchange code error:', error)
    }

    // 错误处理：重定向到首页并显示错误
    return NextResponse.redirect(`${origin}/?auth_error=true`)
}
