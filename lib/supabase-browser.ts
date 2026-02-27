import { createBrowserClient } from '@supabase/ssr'

// Singleton for client-side usage
// Usage: import { supabase } from '@/lib/supabase-browser'
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
