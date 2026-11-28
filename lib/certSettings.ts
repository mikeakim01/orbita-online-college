import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_DESIGN, isDesign, type DesignId } from '@/lib/certStyles';

/** The design used for every certificate PDF. Falls back to the default if nothing is saved or the table is missing. */
export async function getDefaultDesign(): Promise<DesignId> {
  try {
    const { data } = await createAdminClient().from('site_settings').select('value').eq('key', 'certificate_design').maybeSingle();
    return isDesign(data?.value) ? data.value : DEFAULT_DESIGN;
  } catch {
    return DEFAULT_DESIGN;
  }
}
