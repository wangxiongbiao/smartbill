import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('[Middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
            return supabaseResponse
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
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
            error
        } = await supabase.auth.getUser()

        if (error) {
            console.error('[Middleware] auth.getUser() error:', error.message)
        }

        // 可选：添加日志用于调试
        if (user) {
            console.log('[Middleware] User session refreshed:', user.email)
        }
    } catch (e) {
        console.error('[Middleware] Unexpected error:', e)
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
