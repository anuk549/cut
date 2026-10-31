import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SECRET_KEY: z.string().min(20).optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(20).optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20).optional(),
  ADMIN_SESSION_SECRET: z.string().min(32).optional(),
  USER_SESSION_SECRET: z.string().min(32).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
}).refine((data) => data.SUPABASE_URL || data.NEXT_PUBLIC_SUPABASE_URL, {
  message: "Supabase URL is required",
}).refine((data) => data.SUPABASE_SECRET_KEY || data.SUPABASE_PUBLISHABLE_KEY || data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  message: "Supabase key is required",
});

export const env = envSchema.parse(process.env);
