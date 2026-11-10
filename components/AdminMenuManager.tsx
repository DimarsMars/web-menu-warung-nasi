"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase-browser";
import { formatRupiah, type Menu } from "@/lib/types";
import { refreshMenus } from "@/app/actions";
import MenuForm from "@/components/MenuForm";

export default function AdminMenuManager({ menus }: { menus: Menu[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State modal form
  const [formOpen, setFormOpen] = useState(false);
  const [menuEdit, setMenuEdit] = useState<Menu | null>(null);

  // Filter kategori untuk dashboard admin
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const kategoriList = useMemo(() => {
    const set = new Set<string>(
      menus.map((m) => m.kategori).filter((k): k is string => Boolean(k))
    );
    return ["Semua", ...Array.from(set).sort()];
  }, [menus]);

  const menusTampil = useMemo(() => {
    let hasil = menus;
    if (kategoriAktif === "Semua") return [...hasil].sort(
      (a, b) =>
        Number(b.is_ready) - Number(a.is_ready) ||
        (a.kategori ?? "").localeCompare(b.kategori ?? "", "id") ||
        a.nama.localeCompare(b.nama, "id")
    );
    hasil = hasil.filter((m) => m.kategori === kategoriAktif);
    return [...hasil].sort(
      (a, b) =>
        Number(b.is_ready) - Number(a.is_ready) ||
        (a.kategori ?? "").localeCompare(b.kategori ?? "", "id") ||
        a.nama.localeCompare(b.nama, "id")
    );
  }, [menus, kategoriAktif]);

  const jumlahReady = menus.filter((m) => m.is_ready).length;

  // Reset semua status menu jadi HABIS (untuk persiapan besok)
  async function handleResetSemua() {
    const konfirmasi = window.confirm(
      `Reset SEMUA status menu jadi HABIS?\n\n${jumlahReady} menu yang sedang ready akan ditandai habis.\n\nBiasanya dilakukan saat warung sudah tutup.`
    );
    if (!konfirmasi) return;

    setResetting(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("menus")
      .update({ is_ready: false })
      .eq("is_ready", true);

    if (error) {
      setError(`Gagal reset status: ${error.message}`);
      setResetting(false);
      return;
    }

    await refreshMenus();
    startTransition(() => router.refresh());
    setResetting(false);
  }

  // Toggle status ready / habis
  async function handleToggle(menu: Menu) {
    setBusyId(menu.id);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("menus")
      .update({ is_ready: !menu.is_ready })
      .eq("id", menu.id);

    if (error) {
      setError(`Gagal mengubah status: ${error.message}`);
      setBusyId(null);
      return;
    }

    await refreshMenus();
    startTransition(() => router.refresh());
    setBusyId(null);
  }

  // Hapus menu (dengan konfirmasi)
  async function handleDelete(menu: Menu) {
    const konfirmasi = window.confirm(
      `Hapus menu "${menu.nama}"?\n\nTindakan ini tidak bisa dibatalkan.`
    );
    if (!konfirmasi) return;

    setBusyId(menu.id);
    setError(null);
    const supabase = createClient();

    // Hapus foto dari storage jika ada
    if (menu.foto_url) {
      const namaFile = menu.foto_url.split("/").pop();
      if (namaFile) {
        await supabase.storage.from("menu-photos").remove([namaFile]);
      }
    }

    const { error } = await supabase.from("menus").delete().eq("id", menu.id);

    if (error) {
      setError(`Gagal menghapus menu: ${error.message}`);
      setBusyId(null);
      return;
    }

    await refreshMenus();
    startTransition(() => router.refresh());
    setBusyId(null);
  }

  // Callback setelah form tambah/edit sukses
  function handleSaved() {
    setFormOpen(false);
    setMenuEdit(null);
    startTransition(() => router.refresh());
  }

  return (
    <div>
      {/* Statistik singkat */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="animate-fade-up rounded-2xl bg-warung-hijau px-5 py-4 text-white shadow-md shadow-warung-hijau/20">
          <p className="text-2xl font-extrabold sm:text-3xl">{menus.length}</p>
          <p className="text-xs text-white/70 sm:text-sm">Total Menu</p>
        </div>
        <div className="animate-fade-up stagger-1 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-emerald-200">
          <p className="text-2xl font-extrabold text-emerald-600 sm:text-3xl">
            {jumlahReady}
          </p>
          <p className="text-xs text-stone-500 sm:text-sm">Ready</p>
        </div>
        <div className="animate-fade-up stagger-2 col-span-2 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-red-200 sm:col-span-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-2xl font-extrabold text-warung-coklat sm:text-3xl">
                {menus.length - jumlahReady}
              </p>
              <p className="text-xs text-stone-500 sm:text-sm">Habis</p>
            </div>
            {/* Tombol reset semua status */}
            <button
              onClick={handleResetSemua}
              disabled={resetting || isPending || jumlahReady === 0}
              title="Tandai semua menu jadi HABIS (untuk saat warung tutup)"
              className="shrink-0 rounded-full bg-warung-coklat/10 px-3 py-1.5 text-[11px] font-bold text-warung-coklat ring-1 ring-warung-coklat/30 transition-all duration-300 hover:scale-105 hover:bg-warung-coklat hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:text-xs"
            >
              {resetting ? "⏳..." : "🌙 Reset Tutup"}
            </button>
          </div>
        </div>
      </div>

      {/* Bar aksi: filter + tombol tambah */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {kategoriList.map((kategori) => (
            <button
              key={kategori}
              onClick={() => setKategoriAktif(kategori)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                kategoriAktif === kategori
                  ? "scale-105 bg-warung-hijau text-warung-emas shadow-md shadow-warung-hijau/30"
                  : "bg-white text-stone-600 ring-1 ring-stone-200 hover:scale-105 hover:bg-warung-emas/20 hover:text-warung-hijau-tua hover:ring-warung-emas/50"
              }`}
            >
              {kategori}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setMenuEdit(null);
            setFormOpen(true);
          }}
          className="shrink-0 rounded-xl bg-gradient-to-r from-warung-hijau to-warung-hijau-muda px-5 py-2.5 text-sm font-bold text-warung-emas shadow-lg shadow-warung-hijau/25 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
        >
          + Tambah Menu
        </button>
      </div>

      {/* Pesan error */}
      {error && (
        <div className="animate-fade-up mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Daftar menu (tabel responsif) */}
      {menusTampil.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-14 text-center shadow-sm ring-1 ring-stone-200/70">
          <span className="text-4xl">📭</span>
          <p className="font-semibold text-warung-hijau-tua">
            Belum ada menu di kategori ini
          </p>
          <p className="text-sm text-stone-500">
            Klik "Tambah Menu" untuk menambahkan menu baru!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {menusTampil.map((menu, index) => (
            <div
              key={menu.id}
              className={`animate-fade-up stagger-${(index % 8) + 1} flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-200/70 transition-all duration-300 hover:shadow-md hover:ring-warung-emas/50 sm:gap-4 sm:p-4 ${
                busyId === menu.id || isPending ? "opacity-60" : ""
              }`}
            >
              {/* Thumbnail */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-warung-krem ring-1 ring-stone-200 sm:h-20 sm:w-20">
                {menu.foto_url ? (
                  <Image
                    src={menu.foto_url}
                    alt={menu.nama}
                    fill
                    sizes="80px"
                    className={`object-cover ${!menu.is_ready && "grayscale"}`}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">
                    🍛
                  </div>
                )}
              </div>

              {/* Info — bisa diklik untuk buka form edit */}
              <div
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => {
                  setMenuEdit(menu);
                  setFormOpen(true);
                }}
                title="Klik untuk edit menu"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-bold text-warung-hijau-tua">
                    {menu.nama}
                  </h3>
                  {menu.kategori && (
                    <span className="rounded-full bg-warung-emas/20 px-2.5 py-0.5 text-[11px] font-semibold text-warung-hijau-tua">
                      {menu.kategori}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm font-bold text-warung-coklat">
                  {formatRupiah(menu.harga)}
                </p>
                {menu.deskripsi && (
                  <p className="mt-0.5 hidden truncate text-xs text-stone-500 sm:block">
                    {menu.deskripsi}
                  </p>
                )}
                {/* Hint deskripsi di mobile — deskripsi full ada di form edit */}
                {menu.deskripsi && (
                  <p className="mt-0.5 text-xs text-stone-400 italic sm:hidden">
                    Deskripsi tersedia — ketuk untuk lihat/edit
                  </p>
                )}
              </div>

              {/* Aksi */}
              <div className="flex shrink-0 items-center gap-2">
                {/* Toggle Ready */}
                <button
                  onClick={() => handleToggle(menu)}
                  disabled={busyId === menu.id || isPending}
                  title={menu.is_ready ? "Klik untuk tandai habis" : "Klik untuk tandai ready"}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 disabled:cursor-wait ${
                    menu.is_ready ? "bg-emerald-500" : "bg-stone-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                      menu.is_ready ? "translate-x-6.5" : "translate-x-1"
                    }`}
                  />
                </button>

                {/* Edit */}
                <button
                  onClick={() => {
                    setMenuEdit(menu);
                    setFormOpen(true);
                  }}
                  disabled={busyId === menu.id || isPending}
                  title="Edit menu"
                  className="rounded-lg bg-warung-emas/15 px-2.5 py-2 text-sm font-semibold text-warung-hijau-tua transition-all duration-200 hover:scale-110 hover:bg-warung-emas/30"
                >
                  ✏️
                </button>

                {/* Hapus */}
                <button
                  onClick={() => handleDelete(menu)}
                  disabled={busyId === menu.id || isPending}
                  title="Hapus menu"
                  className="rounded-lg bg-red-50 px-2.5 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:scale-110 hover:bg-red-100"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      {formOpen && (
        <MenuForm
          menu={menuEdit}
          onClose={() => {
            setFormOpen(false);
            setMenuEdit(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
