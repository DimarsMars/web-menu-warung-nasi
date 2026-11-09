"use client";

import Image from "next/image";
import { useEffect } from "react";
import { formatRupiah, type Menu } from "@/lib/types";

interface MenuDetailModalProps {
  menu: Menu;
  onClose: () => void;
}

export default function MenuDetailModal({ menu, onClose }: MenuDetailModalProps) {
  // Kunci scroll body saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Tutup dengan tombol Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="animate-fade-in absolute inset-0 bg-warung-hijau-tua/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — bottom sheet di mobile, dialog di tengah di desktop */}
      <div className="animate-fade-up relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        {/* Foto besar */}
        <div className="relative aspect-[16/10] w-full shrink-0 bg-gradient-to-br from-warung-krem to-amber-50">
          {menu.foto_url ? (
            <Image
              src={menu.foto_url}
              alt={menu.nama}
              fill
              sizes="(max-width: 640px) 100vw, 448px"
              className={`object-cover ${!menu.is_ready && "grayscale"}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-6xl opacity-50">🍛</span>
            </div>
          )}

          {/* Tombol tutup */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-warung-hijau-tua/70 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-warung-hijau-tua"
            aria-label="Tutup detail menu"
          >
            ✕
          </button>

          {/* Badge status */}
          {menu.is_ready ? (
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-warung-hijau/95 px-3 py-1 text-[11px] font-bold tracking-wide text-warung-emas shadow-md backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warung-emas opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warung-emas" />
              </span>
              READY
            </span>
          ) : (
            <span className="absolute left-3 top-3 rounded-full bg-warung-coklat/95 px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-md backdrop-blur-sm">
              HABIS
            </span>
          )}
        </div>

        {/* Konten — bisa di-scroll kalau deskripsi panjang */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Kategori */}
          {menu.kategori && (
            <span className="mb-2 inline-block rounded-full bg-warung-emas/20 px-3 py-1 text-xs font-semibold text-warung-hijau-tua">
              {menu.kategori}
            </span>
          )}

          {/* Nama — full tanpa terpotong */}
          <h2 className="text-xl font-extrabold leading-snug text-warung-hijau-tua sm:text-2xl">
            {menu.nama}
          </h2>

          {/* Harga */}
          <p
            className={`mt-2 text-2xl font-extrabold ${
              menu.is_ready ? "gold-shimmer" : "price-muted"
            }`}
          >
            {formatRupiah(menu.harga)}
          </p>

          {/* Deskripsi — full tanpa line-clamp */}
          {menu.deskripsi && (
            <div className="mt-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-400">
                Deskripsi
              </p>
              <p className="text-sm leading-relaxed text-stone-600">
                {menu.deskripsi}
              </p>
            </div>
          )}

          {/* Info status kalau habis */}
          {!menu.is_ready && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
              😔 Menu ini sedang habis. Silakan cek menu lainnya, atau datang
              lagi nanti ya!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
