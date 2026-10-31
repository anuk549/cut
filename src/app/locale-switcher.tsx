"use client";

import { useState } from "react";

export default function LocaleSwitcher({ current }: { current: string }) {
  const [locale, setLocale] = useState(current);
  async function change(l: string) {
    setLocale(l);
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: l }),
    });
    window.location.reload();
  }
  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => change(e.target.value)}
      className="h-9 border border-line bg-transparent px-2 text-[0.75rem] font-medium uppercase tracking-[0.11em] text-ink/80 outline-none transition-colors hover:border-clay focus:border-clay"
    >
      <option value="en">EN</option>
      <option value="si">සිං</option>
      <option value="ta">த</option>
    </select>
  );
}
