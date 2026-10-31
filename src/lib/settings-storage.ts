import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const SETTINGS_BUCKET = "mati-settings";

export async function ensureSettingsBucket() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.storage.getBucket(SETTINGS_BUCKET);
  if (data) return supabase;
  await supabase.storage.createBucket(SETTINGS_BUCKET, { public: false });
  return supabase;
}
