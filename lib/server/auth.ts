import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export interface RequestAuthContext {
  authType: 'bearer' | 'cookie';
  supabase: SupabaseClient;
  user: User;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!authorization) return null;

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function createBearerClient(accessToken: string) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

export async function getRequestAuthContext(request: Request): Promise<RequestAuthContext | null> {
  const accessToken = getBearerToken(request);

  if (accessToken) {
    const supabase = createBearerClient(accessToken);
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return null;
    }

    return {
      authType: 'bearer',
      supabase,
      user: data.user,
    };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return {
    authType: 'cookie',
    supabase,
    user: data.user,
  };
}
