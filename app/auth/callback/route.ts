import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const LEGACY_VIEW_REDIRECTS: Record<string, string> = {
    home: '/dashboard',
    records: '/invoices',
    templates: '/templates',
    profile: '/settings',
    editor: '/invoices/new',
}

function normalizeNext(next: string) {
    try {
        const url = new URL(next, 'http://localhost')
        const legacyView = url.searchParams.get('view')
        if ((url.pathname === '/dashboard' || url.pathname === '/') && legacyView && LEGACY_VIEW_REDIRECTS[legacyView]) {
            return LEGACY_VIEW_REDIRECTS[legacyView]
        }
        if (url.pathname === '/' || url.pathname === '') {
            return '/dashboard'
        }
        return `${url.pathname}${url.search}`
    } catch {
        return '/dashboard'
    }
}

const ALLOWED_MOBILE_PROTOCOLS = new Set(['mobile:', 'smartbill:', 'smartbillpro:', 'exp:', 'exps:'])
const FORWARDED_AUTH_PARAMS = [
    'code',
    'access_token',
    'refresh_token',
    'error',
    'error_description',
]

function resolveMobileRedirect(value: string | null) {
    if (!value) return null

    try {
        const url = new URL(value)
        if (!ALLOWED_MOBILE_PROTOCOLS.has(url.protocol)) {
            return null
        }
        return url
    } catch {
        return null
    }
}

function buildMobileRedirectUrl(mobileRedirect: URL, searchParams: URLSearchParams) {
    const target = new URL(mobileRedirect.toString())

    FORWARDED_AUTH_PARAMS.forEach((key) => {
        const value = searchParams.get(key)
        if (value) {
            target.searchParams.set(key, value)
        }
    })

    if (!FORWARDED_AUTH_PARAMS.some((key) => target.searchParams.has(key))) {
        target.searchParams.set('error', 'missing_auth_payload')
    }

    return target.toString()
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = normalizeNext(searchParams.get('next') ?? '/dashboard')
    const popup = searchParams.get('popup') === '1'
    const rawMobileRedirect = searchParams.get('mobile_redirect')
    const mobileRedirect = resolveMobileRedirect(rawMobileRedirect)

    if (rawMobileRedirect && !mobileRedirect) {
        console.error('[OAuth Callback] Invalid mobile_redirect:', rawMobileRedirect)
        return NextResponse.redirect(`${origin}/?auth_error=true`)
    }

    if (mobileRedirect) {
        return NextResponse.redirect(buildMobileRedirectUrl(mobileRedirect, searchParams))
    }

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log('[OAuth Callback] Session established successfully')
            if (popup) {
                const html = `<!doctype html><html><body><script>
                  try {
                    if (window.opener) {
                      window.opener.postMessage({ type: 'SMARTBILL_AUTH_SUCCESS', next: ${JSON.stringify(next)} }, ${JSON.stringify(origin)});
                    }
                  } catch (e) {}
                  window.close();
                  location.replace(${JSON.stringify(next)});
                </script></body></html>`
                return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
            }
            return NextResponse.redirect(`${origin}${next}`)
        }

        console.error('[OAuth Callback] Exchange code error:', error)
    }

    if (popup) {
        const html = `<!doctype html><html><body><script>
          try {
            if (window.opener) {
              window.opener.postMessage({ type: 'SMARTBILL_AUTH_ERROR' }, ${JSON.stringify(origin)});
            }
          } catch (e) {}
          window.close();
          location.replace('/?auth_error=true');
        </script></body></html>`
        return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
    }

    return NextResponse.redirect(`${origin}/?auth_error=true`)
}
