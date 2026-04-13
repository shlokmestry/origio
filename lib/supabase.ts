// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

// Use SSR browser client — persists session in cookies so it survives
// external redirects (Stripe checkout → back to app) without losing auth state.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)