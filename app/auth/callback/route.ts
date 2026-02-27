import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // If opened as a popup, redirect to the success page which will
            // send a BroadcastChannel message and close the popup window.
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            const baseUrl = isLocalEnv
                ? origin
                : forwardedHost
                    ? `https://${forwardedHost}`
                    : origin

            return NextResponse.redirect(`${baseUrl}/auth/callback-success`)
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-error`)
}
