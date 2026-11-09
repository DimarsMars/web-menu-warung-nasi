import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";
import AdminMenuManager from "@/components/AdminMenuManager";
import LogoutButton from "@/components/LogoutButton";
import type { Menu } from "@/lib/types";

// Halaman admin selalu dinamis (butuh session login)
export const instant = false;

export default async function AdminPage() {
  // Middleware sudah memastikan user login
  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  // Ambil semua menu
  const { data: menus } = await supabase
    .from("menus")
    .select("*")
    .order("kategori", { ascending: true })
    .order("nama", { ascending: true });

  const daftarMenu: Menu[] = menus ?? [];

  return (
    <main className="min-h-screen bg-warung-krem">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-warung-hijau/10 bg-warung-krem/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:py-4">
          <Image
            src="/logo.svg"
            alt="Logo Warung"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full ring-2 ring-warung-emas"
            priority
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold text-warung-hijau-tua sm:text-xl">
              Dashboard Admin
            </h1>
            <p className="truncate text-xs text-stone-500 sm:text-sm">
              {user?.email}
            </p>
          </div>
          <Link
            href="/"
            className="hidden shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-warung-hijau ring-1 ring-warung-hijau/30 transition-all duration-300 hover:scale-105 hover:bg-warung-hijau hover:text-warung-emas sm:block"
          >
            Lihat Menu
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Konten */}
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:pt-8">
        <p className="mb-1 text-sm text-stone-500">
          Kelola menu warung kamu di sini. Perubahan langsung terlihat oleh
          pelanggan.
        </p>
        <AdminMenuManager menus={daftarMenu} />
      </div>
    </main>
  );
}
