import { createAdminClient } from '@/lib/supabase/admin';
import { buildCertificate } from '@/lib/certificate';
import { getDefaultDesign } from '@/lib/certSettings';
import { isDesign } from '@/lib/certStyles';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { serial: string } }) {
  const serial = decodeURIComponent(params.serial).toUpperCase();
  const { data: c } = await createAdminClient()
    .from('certificates')
    .select('serial, student_name, exam_title, score, issued_at, revoked')
    .eq('serial', serial)
    .maybeSingle();
  if (!c || c.revoked) return new Response('Not found', { status: 404 });
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? new URL(req.url).origin;
  const asked = new URL(req.url).searchParams.get('design');
  const design = isDesign(asked) ? asked : await getDefaultDesign();
  const bytes = await buildCertificate(
    {
      serial: c.serial,
      name: c.student_name,
      exam: c.exam_title,
      score: c.score,
      issued: new Date(c.issued_at),
      verifyUrl: origin + '/certificates/' + c.serial,
    },
    undefined,
    { design }
  );
  return new Response(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="' + c.serial + '.pdf"',
      'Cache-Control': 'private, max-age=0',
    },
  });
}
