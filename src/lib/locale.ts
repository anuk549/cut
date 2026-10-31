import { cookies, headers } from "next/headers";
import { locales, defaultLocale, type Locale } from "@/i18n/messages";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const c = cookieStore.get("locale")?.value;
  if (c && (locales as string[]).includes(c)) return c as Locale;
  const accept = (await headers()).get("accept-language") ?? "";
  for (const l of locales) {
    if (accept.toLowerCase().includes(l)) return l;
  }
  return defaultLocale;
}
