"use client";

import { useEffect, useMemo, useState } from "react";
import MenuCard from "@/components/MenuCard";
import { createClient } from "@/lib/supabase-browser";
import type { Menu } from "@/lib/types";

export default function MenuList({ menusAwal }: { menusAwal: Menu[] }) {
  // State menus — di-update realtime oleh Supabase
  const [menus, setMenus] = useState<Menu[]>(menusAwal);
  const [kategoriAktif, setKategoriAktif] = useState<string>("Semua");
  const [cari, setCari] = useState("");

  // Sinkronisasi realtime dengan database
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("menus-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menus" },
        (payload) => {
          setMenus((sebelumnya) => {
            switch (payload.eventType) {
              case "INSERT":
                // Menu baru → tambahkan di awal dengan animasi
                return [payload.new as Menu, ...sebelumnya];
              case "UPDATE":
                return sebelumnya.map((m) =>
                  m.id === payload.new.id ? (payload.new as Menu) : m
                );
              case "DELETE":
                return sebelumnya.filter((m) => m.id !== payload.old.id);
              default:
                return sebelumnya;
            }
          });
        }
      )
      .subscribe();

    // Bersihkan langganan saat komponen unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Daftar kategori unik
  const kategoriList = useMemo(() => {
    const kategori = new Set<string>(
      menus.map((m) => m.kategori).filter((k): k is string => Boolean(k))
    );
    return ["Semua", ...Array.from(kategori).sort()];
  }, [menus]);

  // Filter kategori + pencarian + urutan (ready paling atas)
  const menusTampil = useMemo(() => {
    let hasil = menus;

    if (kategoriAktif !== "Semua") {
      hasil = hasil.filter((m) => m.kategori === kategoriAktif);
    }

    const kataKunci = cari.trim().toLowerCase();
    if (kataKunci) {
      hasil = hasil.filter(
        (m) =>
          m.nama.toLowerCase().includes(kataKunci) ||
          (m.deskripsi?.toLowerCase().includes(kataKunci) ?? false)
      );
    }

    // Ready di atas, lalu urut kategori & nama
    return [...hasil].sort(
      (a, b) =>
        Number(b.is_ready) - Number(a.is_ready) ||
        (a.kategori ?? "").localeCompare(b.kategori ?? "", "id") ||
        a.nama.localeCompare(b.nama, "id")
    );
  }, [menus, kategoriAktif, cari]);

  // Menu yang tersembunyi karena filter/pencarian tapi masih READY
  const jumlahReadyTersembunyi = useMemo(() => {
    const kataKunci = cari.trim().toLowerCase();
    return menus.filter(
      (m) =>
        m.is_ready &&
        (kategoriAktif === "Semua" || m.kategori === kategoriAktif) &&
        kataKunci &&
        !m.nama.toLowerCase().includes(kataKunci) &&
        !(m.deskripsi?.toLowerCase().includes(kataKunci) ?? false)
    ).length;
  }, [menus, kategoriAktif, cari]);

  if (menus.length === 0) {
    return (
      <div className="animate-fade-up flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-stone-200/70">
        <span className="text-5xl">🍽️</span>
        <p className="font-semibold text-warung-hijau-tua">Menu belum tersedia</p>
        <p className="max-w-xs text-sm text-stone-500">
          Mohon maaf, daftar menu masih dalam persiapan. Silakan kembali lagi
          nanti!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Kotak Pencarian */}
      <div className="relative mb-4">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
          🔍
        </span>
        <input
          type="search"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari menu..."
          className="w-full rounded-2xl border border-stone-200 bg-white px-11 py-3 text-sm shadow-sm outline-none transition-all duration-300 placeholder:text-stone-400 focus:border-warung-emas focus:ring-2 focus:ring-warung-emas/30"
        />
        {cari && (
          <button
            onClick={() => setCari("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-500 transition-all hover:scale-110 hover:bg-stone-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Kategori */}
      {kategoriList.length > 2 && (
        <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
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
      )}

      {/* Grid Menu */}
      {menusTampil.length > 0 ? (
        <div
          key={kategoriAktif + cari}
          className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
        >
          {menusTampil.map((menu, index) => (
            <MenuCard key={menu.id} menu={menu} index={index} />
          ))}
        </div>
      ) : (
        <div className="animate-fade-up flex flex-col items-center gap-2 rounded-2xl bg-white py-14 text-center shadow-sm ring-1 ring-stone-200/70">
          <span className="text-4xl">
            {jumlahReadyTersembunyi > 0 ? "🔍" : "🤔"}
          </span>
          <p className="font-semibold text-warung-hijau-tua">
            {cari
              ? `Tidak ada menu cocok dengan "${cari}"`
              : "Belum ada menu di kategori ini"}
          </p>
          <p className="text-sm text-stone-500">
            {cari
              ? "Coba kata kunci lain, misal nama menu yang lebih singkat"
              : "Coba pilih kategori lain ya!"}
          </p>
          {cari && (
            <button
              onClick={() => setCari("")}
              className="mt-1 rounded-full bg-warung-hijau px-4 py-2 text-xs font-semibold text-warung-emas transition-all hover:scale-105"
            >
              Reset pencarian
            </button>
          )}
        </div>
      )}
    </div>
  );
}
