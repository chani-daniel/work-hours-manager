import { createClient } from '@supabase/supabase-js'

// Single shared Supabase client for the whole app.
// Connection values come from .env (VITE_-prefixed so Vite exposes them).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
