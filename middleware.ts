import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: 避免在 Server Components 中写 cookies
    // 在 middleware 中调用 getUser() 来刷新过期的 Auth tokens 并同步到客户端
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 可选：添加日志用于调试
    if (user) {
        console.log('[Middleware] User session refreshed:', user.email)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * 匹配所有路径，除了:
         * - _next/static (静态文件)
         * - _next/image (图片优化)
         * - favicon.ico (favicon)
         * - 图片文件
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
