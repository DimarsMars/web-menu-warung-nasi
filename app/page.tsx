import Image from "next/image";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import MenuList from "@/components/MenuList";
import type { Menu } from "@/lib/types";

// Komponen async yang mengambil data menu dari Supabase
async function MenuSection() {
  const { data: menus, error } = await supabase
    .from("menus")
    .select("*")
    .order("kategori", { ascending: true })
    .order("nama", { ascending: true });

  const daftarMenu: Menu[] = menus ?? [];

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-14 text-center shadow-sm ring-1 ring-stone-200/70">
        <span className="text-4xl">⚠️</span>
        <p className="font-semibold text-warung-hijau-tua">Gagal memuat menu</p>
        <p className="text-sm text-stone-500">
          Terjadi kendala koneksi. Silakan refresh halaman.
        </p>
      </div>
    );
  }

  return <MenuList menusAwal={daftarMenu} />;
}

// Skeleton loading — tampil saat data sedang diambil
function MenuSkeleton() {
  return (
    <div>
      <div className="mb-6 flex gap-2">
        {[80, 100, 90, 70].map((w, i) => (
          <div
            key={i}
            className="h-9 animate-pulse rounded-full bg-stone-200/80"
            style={{ width: w }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/70"
          >
            <div className="aspect-[4/3] w-full animate-pulse bg-stone-200/80" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200/80" />
              <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-stone-200/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-warung-krem">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-warung-hijau/10 bg-warung-krem/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:py-4">
          {/* Logo — ganti file public/logo.svg dengan logo warung kamu */}
          <Image
            src="/logo.svg"
            alt="Logo Warung"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full ring-2 ring-warung-emas shadow-sm"
            priority
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold text-warung-hijau-tua sm:text-xl">
              Warung Nasi Solo Pak Umar
            </h1>
            <p className="flex items-center gap-1.5 text-xs text-stone-500 sm:text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Buka setiap hari · 09.00 – 21.00 WITA
            </p>
          </div>
        </div>
      </header>

      {/* Konten */}
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:pt-8">
        {/* Hero Sambutan — gradasi sinkron dengan banner */}
        <section className="animate-fade-up relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-warung-hijau via-warung-hijau-muda to-warung-hijau px-6 py-10 text-white shadow-xl shadow-warung-hijau/20 sm:px-10 sm:py-14">
          {/* Ornamen dekoratif — lingkaran emas transparan */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-warung-emas/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-warung-emas/10 blur-2xl" />
          <div className="pointer-events-none absolute right-12 top-8 hidden h-20 w-20 animate-float-soft items-center justify-center rounded-full bg-warung-emas/20 backdrop-blur-sm sm:flex">
            <span className="text-4xl">🍛</span>
          </div>

          <p className="text-sm font-medium text-warung-emas sm:text-base">
            Selamat datang 👋
          </p>
          <h2 className="mt-2 max-w-xl text-2xl font-extrabold leading-tight sm:text-4xl">
            Makan enak, <span className="text-shimmer">harga bersahabat</span>!
          </h2>
          <p className="mt-3 max-w-lg text-sm text-white/80 sm:text-base">
            Cek menu yang ready hari ini di bawah ya. Semua menu diupdate
            setiap hari.
          </p>

          {/* Info cepat */}
          <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
            <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium ring-1 ring-warung-emas/30 backdrop-blur-sm sm:text-sm">
              🍛 Masakan rumahan
            </span>
            <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium ring-1 ring-warung-emas/30 backdrop-blur-sm sm:text-sm">
              💰 Harga mulai Rp 10rb
            </span>
            <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium ring-1 ring-warung-emas/30 backdrop-blur-sm sm:text-sm">
              ⭐ Menu Beragam
            </span>
          </div>
        </section>

        {/* Judul Daftar Menu */}
        <div className="animate-fade-up stagger-2 mb-5 flex items-center gap-3">
          <div className="h-9 w-1.5 rounded-full bg-gradient-to-b from-warung-emas to-warung-coklat" />
          <div>
            <h3 className="text-xl font-extrabold text-warung-hijau-tua sm:text-2xl">
              Daftar Menu
            </h3>
            <p className="text-sm text-stone-500">
              Cek ketersediaan menu hari ini
            </p>
          </div>
        </div>

        {/* Daftar Menu — dengan skeleton loading */}
        <Suspense fallback={<MenuSkeleton />}>
          <MenuSection />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="border-t border-warung-hijau/10 bg-warung-hijau py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm font-semibold text-warung-emas">
            Warung Nasi Solo Pak Umar
          </p>
          <p className="mt-1 text-xs text-white/60">
            Terima kasih sudah berkunjung 🙏 · Diperbarui otomatis setiap hari
          </p>
        </div>
      </footer>
    </main>
  );
}
