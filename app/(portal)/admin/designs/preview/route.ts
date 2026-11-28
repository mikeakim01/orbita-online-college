import { createClient } from '@/lib/supabase/server';
import { buildCertificate } from '@/lib/certificate';
import { DEFAULT_DESIGN, isDesign } from '@/lib/certStyles';

export const dynamic = 'force-dynamic';

// A sample certificate in the requested design. Administrators only.
export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Sign in required', { status: 401 });
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!prof || prof.role !== 'admin') return new Response('Forbidden', { status: 403 });
  const q = new URL(req.url).searchParams.get('design');
  const design = isDesign(q) ? q : DEFAULT_DESIGN;
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? new URL(req.url).origin;
  const bytes = await buildCertificate(
    { serial: 'ICE-2026-000001', name: 'Александр Иванов', exam: 'Bachelor of Science in Cyber Security', score: 88, issued: new Date(), verifyUrl: origin + '/certificates/ICE-2026-000001' },
    undefined,
    { design, sample: true }
  );
  return new Response(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="design-' + design + '.pdf"', 'Cache-Control': 'private, max-age=0' } });
}
