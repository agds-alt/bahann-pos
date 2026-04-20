import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// Supabase JS client communicates via PostgREST HTTP (not direct TCP to PostgreSQL).
// PostgREST maintains its own internal connection pool — no connection exhaustion
// in serverless environments. Direct pg connections are only used in migration scripts.
export const supabaseAdmin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})
