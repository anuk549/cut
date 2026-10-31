import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureSettingsBucket, SETTINGS_BUCKET } from "@/lib/settings-storage";

const HIDDEN_PREFIX = "hidden-products";

function hiddenPath(productId: string) {
  return `${HIDDEN_PREFIX}/${productId}.json`;
}

export async function getHiddenProductIds() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(SETTINGS_BUCKET)
    .list(HIDDEN_PREFIX, { limit: 1000 });

  if (error) return new Set<string>();

  return new Set(
    (data ?? [])
      .map((entry) => entry.name)
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.slice(0, -5)),
  );
}

export async function isProductHidden(productId: string) {
  const hidden = await getHiddenProductIds();
  return hidden.has(productId);
}

export async function setProductHidden(productId: string, hidden: boolean) {
  const supabase = await ensureSettingsBucket();
  const path = hiddenPath(productId);

  if (hidden) {
    const { error } = await supabase.storage
      .from(SETTINGS_BUCKET)
      .upload(path, new Blob([JSON.stringify({ hidden: true })]), {
        upsert: true,
        contentType: "application/json",
      });
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.storage.from(SETTINGS_BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}
