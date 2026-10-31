import { withSupabase } from "@supabase/server";

export const GET = withSupabase({ auth: "none" }, async (_req, ctx) => {
  const { data, error } = await ctx.supabase.auth.getSession();
  return Response.json({
    status: "connected",
    authMode: ctx.authMode,
    session: data.session?.user?.id ?? null,
    error: error?.message ?? null,
  });
});
