import { type NextRequest, NextResponse } from 'next/server'

const LEGACY_VIEW_REDIRECTS: Record<string, string> = {
    home: '/dashboard',
    records: '/invoices',
    templates: '/templates',
    profile: '/settings',
    editor: '/invoices/new',
}

const ENABLE_LEGACY_VIEW_REDIRECTS = false

export async function middleware(request: NextRequest) {
    const legacyView = request.nextUrl.searchParams.get('view')
    const pathname = request.nextUrl.pathname

    if (ENABLE_LEGACY_VIEW_REDIRECTS && legacyView && (pathname === '/dashboard' || pathname === '/')) {
        const target = LEGACY_VIEW_REDIRECTS[legacyView]
        if (target) {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = target
            redirectUrl.searchParams.delete('view')
            return NextResponse.redirect(redirectUrl)
        }
    }

    return NextResponse.next({ request })
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
