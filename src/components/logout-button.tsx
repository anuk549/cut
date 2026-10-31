"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton({
  endpoint,
  redirectTo,
  className,
  children,
}: {
  endpoint: string;
  redirectTo: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch(endpoint, { method: "POST" });
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={logout} disabled={loading} className={className}>
      {loading ? "..." : children}
    </button>
  );
}
