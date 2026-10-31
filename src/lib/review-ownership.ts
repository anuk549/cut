import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureSettingsBucket, SETTINGS_BUCKET } from "@/lib/settings-storage";

const OWNERS_PREFIX = "review-owners";

function ownerPrefix(userId: string) {
  return `${OWNERS_PREFIX}/${userId}`;
}

function ownerPath(userId: string, reviewId: string) {
  return `${ownerPrefix(userId)}/${reviewId}.json`;
}

export async function getOwnedReviewIds(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(SETTINGS_BUCKET)
    .list(ownerPrefix(userId), { limit: 1000 });

  if (error) return new Set<string>();

  return new Set(
    (data ?? [])
      .map((entry) => entry.name)
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.slice(0, -5)),
  );
}

export async function claimReview(userId: string, reviewId: string) {
  const supabase = await ensureSettingsBucket();
  const { error } = await supabase.storage
    .from(SETTINGS_BUCKET)
    .upload(ownerPath(userId, reviewId), new Blob([JSON.stringify({ userId })]), {
      upsert: true,
      contentType: "application/json",
    });
  if (error) throw new Error(error.message);
}

export async function releaseReview(userId: string, reviewId: string) {
  const supabase = await ensureSettingsBucket();
  const { error } = await supabase.storage
    .from(SETTINGS_BUCKET)
    .remove([ownerPath(userId, reviewId)]);
  if (error) throw new Error(error.message);
}
