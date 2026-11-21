import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Service-role client. Bypasses row level security. Use only in server code,
// and only after you have checked who the user is.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
