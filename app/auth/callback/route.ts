import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Email links (confirm account, reset password) land here with a one-time code.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const dest = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(origin + dest);
  }
  return NextResponse.redirect(origin + '/login?error=link');
}
