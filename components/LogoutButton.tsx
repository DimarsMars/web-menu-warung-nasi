"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // replace agar halaman admin tidak tertinggal di history browser
    router.replace("/admin/login");
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-warung-coklat ring-1 ring-warung-coklat/30 transition-all duration-300 hover:scale-105 hover:bg-warung-coklat hover:text-white disabled:opacity-60"
    >
      {loading ? "Keluar..." : "Keluar"}
    </button>
  );
}
