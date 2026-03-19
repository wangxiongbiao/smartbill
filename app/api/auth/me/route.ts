import { NextRequest, NextResponse } from 'next/server';
import { getRequestAuthContext } from '@/lib/server/auth';
import { getUserProfile } from '@/lib/supabase-db';

export async function GET(request: NextRequest) {
  try {
    const auth = await getRequestAuthContext(request);

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const profile = await getUserProfile(auth.user.id, auth.supabase);

    return NextResponse.json(
      {
        user: {
          id: auth.user.id,
          email: auth.user.email ?? null,
          provider: typeof auth.user.app_metadata?.provider === 'string'
            ? auth.user.app_metadata.provider
            : null,
        },
        profile: profile
          ? {
              id: profile.id,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
            }
          : null,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('[api/auth/me][GET] Failed to load auth session:', error);
    return NextResponse.json(
      { error: 'Failed to load auth session' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
