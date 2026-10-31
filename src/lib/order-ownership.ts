import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureSettingsBucket, SETTINGS_BUCKET } from "@/lib/settings-storage";

const OWNERS_PREFIX = "order-owners";

function ownerPrefix(userId: string) {
  return `${OWNERS_PREFIX}/${userId}`;
}

function ownerPath(userId: string, orderId: string) {
  return `${ownerPrefix(userId)}/${orderId}.json`;
}

export async function getOwnedOrderIds(userId: string) {
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

export async function claimOrder(userId: string, orderId: string, email: string) {
  const supabase = await ensureSettingsBucket();
  const { error } = await supabase.storage
    .from(SETTINGS_BUCKET)
    .upload(ownerPath(userId, orderId), new Blob([JSON.stringify({ userId, email })]), {
      upsert: true,
      contentType: "application/json",
    });
  if (error) throw new Error(error.message);
}

export async function releaseOrder(userId: string, orderId: string) {
  const supabase = await ensureSettingsBucket();
  const { error } = await supabase.storage
    .from(SETTINGS_BUCKET)
    .remove([ownerPath(userId, orderId)]);
  if (error) throw new Error(error.message);
}

export async function getOrderCountsByUser(userIds: string[]) {
  const counts = new Map<string, number>();
  await Promise.all(
    userIds.map(async (userId) => {
      const orderIds = await getOwnedOrderIds(userId);
      counts.set(userId, orderIds.size);
    }),
  );
  return counts;
}
