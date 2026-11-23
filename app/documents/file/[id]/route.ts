import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BUCKET } from '@/lib/documents';

export const dynamic = 'force-dynamic';

// Opens one uploaded document through a short-lived signed link. The row is read with the caller's own
// login, so row level security decides who may open it: the owner or an admin.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', req.url));
  const { data: doc } = await supabase.from('application_documents').select('file_path').eq('id', params.id).maybeSingle();
  if (!doc) return new NextResponse('Not found', { status: 404 });
  const { data } = await createAdminClient().storage.from(BUCKET).createSignedUrl(doc.file_path, 60);
  if (!data?.signedUrl) return new NextResponse('Not found', { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
