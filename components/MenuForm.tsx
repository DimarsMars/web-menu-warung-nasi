"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase-browser";
import type { Menu } from "@/lib/types";
import { refreshMenus } from "@/app/actions";

interface MenuFormProps {
  menu: Menu | null; // null = mode tambah, ada nilai = mode edit
  onClose: () => void;
  onSaved: () => void;
}

const KATEGORI_SARAN = ["Nasi Goreng", "Ayam", "Ikan", "Sayur", "Minuman"];
const MAX_FOTO_MB = 3;

// Opsi kompresi: sisi terpanjang 1200px, target ~300KB
const OPSI_KOMPRES = {
  maxSizeMB: 0.3,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  fileType: "image/jpeg" as const,
};

export default function MenuForm({ menu, onClose, onSaved }: MenuFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const isEdit = Boolean(menu);

  const [nama, setNama] = useState(menu?.nama ?? "");
  const [harga, setHarga] = useState(menu ? String(menu.harga) : "");
  const [kategori, setKategori] = useState(menu?.kategori ?? "");
  const [deskripsi, setDeskripsi] = useState(menu?.deskripsi ?? "");
  const [isReady, setIsReady] = useState(menu?.is_ready ?? true);

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(
    menu?.foto_url ?? null
  );
  const [kompresi, setKompresi] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kunci scroll body saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Preview foto saat dipilih — langsung dikompres otomatis
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WebP, dll).");
      return;
    }

    // Validasi ukuran maksimal (sebelum kompresi)
    if (file.size > MAX_FOTO_MB * 1024 * 1024) {
      setError(
        `Ukuran foto maksimal ${MAX_FOTO_MB}MB sebelum kompresi. Silakan pilih foto lain.`
      );
      return;
    }

    setError(null);
    setKompresi(true);
    try {
      // Kompres otomatis di browser — foto dari HP langsung dikecilkan
      const fileKecil = await imageCompression(file, OPSI_KOMPRES);
      setFotoFile(fileKecil);
      setFotoPreview(URL.createObjectURL(fileKecil));
    } catch {
      setError("Gagal mengompres foto. Coba foto lain atau kompres manual.");
    } finally {
      setKompresi(false);
    }
  }

  // Hapus foto
  function handleRemoveFoto() {
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Validasi form
  function validate(): string | null {
    if (!nama.trim()) return "Nama menu wajib diisi.";
    if (nama.trim().length > 100) return "Nama menu maksimal 100 karakter.";
    const hargaNum = Number(harga);
    if (!harga || isNaN(hargaNum)) return "Harga wajib diisi dengan angka.";
    if (hargaNum < 0) return "Harga tidak boleh negatif.";
    if (hargaNum > 10_000_000) return "Harga terlalu besar (maks 10 juta).";
    if (kategori.trim().length > 50) return "Kategori maksimal 50 karakter.";
    if (deskripsi.trim().length > 300)
      return "Deskripsi maksimal 300 karakter.";
    return null;
  }

  // Upload foto ke Supabase Storage, return URL publik
  async function uploadFoto(
    supabase: ReturnType<typeof createClient>
  ): Promise<string | null> {
    if (!fotoFile) return null;

    // Nama file unik: timestamp + nama yang aman
    const ekstensi = fotoFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const namaAman = nama
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    const namaFile = `${namaAman}-${Date.now()}.${ekstensi}`;

    const { error } = await supabase.storage
      .from("menu-photos")
      .upload(namaFile, fotoFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error(`Gagal upload foto: ${error.message}`);

    const { data } = supabase.storage
      .from("menu-photos")
      .getPublicUrl(namaFile);

    return data.publicUrl;
  }

  // Simpan (tambah atau edit)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validasiError = validate();
    if (validasiError) {
      setError(validasiError);
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const supabase = createClient();

      // Upload foto jika ada file baru
      let fotoUrl = menu?.foto_url ?? null;
      if (fotoFile) {
        const urlBaru = await uploadFoto(supabase);

        // Hapus foto lama saat mengganti foto di mode edit
        if (urlBaru && menu?.foto_url) {
          const namaFileLama = menu.foto_url.split("/").pop();
          if (namaFileLama) {
            await supabase.storage
              .from("menu-photos")
              .remove([namaFileLama]);
          }
        }
        fotoUrl = urlBaru;
      }

      const payload = {
        nama: nama.trim(),
        harga: Number(harga),
        kategori: kategori.trim() || null,
        deskripsi: deskripsi.trim() || null,
        foto_url: fotoUrl,
        is_ready: isReady,
      };

      if (isEdit && menu) {
        const { error } = await supabase
          .from("menus")
          .update(payload)
          .eq("id", menu.id);
        if (error) throw new Error(`Gagal menyimpan perubahan: ${error.message}`);
      } else {
        const { error } = await supabase.from("menus").insert(payload);
        if (error) throw new Error(`Gagal menambah menu: ${error.message}`);
      }

      await refreshMenus();
      startTransition(() => router.refresh());
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="animate-fade-in absolute inset-0 bg-warung-hijau-tua/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="animate-fade-up relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-warung-hijau to-warung-hijau-muda px-6 py-4">
          <h2 className="text-lg font-extrabold text-warung-emas">
            {isEdit ? "✏️ Edit Menu" : "➕ Tambah Menu Baru"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-white transition-all hover:scale-110 hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        {/* Form — bisa di-scroll */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto px-6 py-5"
        >
          {/* Upload Foto */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-warung-hijau-tua">
              Foto Menu <span className="font-normal text-stone-400">(opsional, maks {MAX_FOTO_MB}MB)</span>
            </label>
            {fotoPreview ? (
              <div className="relative overflow-hidden rounded-2xl ring-1 ring-stone-200">
                <Image
                  src={fotoPreview}
                  alt="Preview foto menu"
                  width={600}
                  height={300}
                  className="h-40 w-full object-cover"
                  unoptimized={fotoFile !== null}
                />
                <button
                  type="button"
                  onClick={handleRemoveFoto}
                  className="absolute right-3 top-3 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105"
                >
                  🗑️ Hapus Foto
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={kompresi}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-warung-emas/50 bg-warung-krem px-4 py-8 text-center transition-all duration-300 hover:border-warung-emas hover:bg-warung-emas/10 disabled:cursor-wait disabled:opacity-70"
              >
                <span className="text-3xl">{kompresi ? "⏳" : "📷"}</span>
                <span className="text-sm font-semibold text-warung-hijau-tua">
                  {kompresi
                    ? "Mengompres foto..."
                    : "Klik untuk pilih foto (auto-compress)"}
                </span>
                <span className="text-xs text-stone-400">
                  JPG, PNG, atau WebP · maks {MAX_FOTO_MB}MB
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Nama */}
          <div>
            <label
              htmlFor="nama"
              className="mb-1.5 block text-sm font-semibold text-warung-hijau-tua"
            >
              Nama Menu <span className="text-warung-coklat">*</span>
            </label>
            <input
              id="nama"
              type="text"
              required
              maxLength={100}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="cth: Nasi Goreng Spesial"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-warung-emas focus:bg-white focus:ring-2 focus:ring-warung-emas/30"
            />
          </div>

          {/* Harga + Kategori */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="harga"
                className="mb-1.5 block text-sm font-semibold text-warung-hijau-tua"
              >
                Harga (Rp) <span className="text-warung-coklat">*</span>
              </label>
              <input
                id="harga"
                type="number"
                required
                min={0}
                max={10000000}
                step={500}
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                placeholder="15000"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-warung-emas focus:bg-white focus:ring-2 focus:ring-warung-emas/30"
              />
            </div>
            <div>
              <label
                htmlFor="kategori"
                className="mb-1.5 block text-sm font-semibold text-warung-hijau-tua"
              >
                Kategori
              </label>
              <input
                id="kategori"
                type="text"
                maxLength={50}
                list="kategori-saran"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="cth: Nasi Goreng"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-warung-emas focus:bg-white focus:ring-2 focus:ring-warung-emas/30"
              />
              <datalist id="kategori-saran">
                {KATEGORI_SARAN.map((k) => (
                  <option key={k} value={k} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label
              htmlFor="deskripsi"
              className="mb-1.5 block text-sm font-semibold text-warung-hijau-tua"
            >
              Deskripsi{" "}
              <span className="font-normal text-stone-400">
                ({deskripsi.length}/300)
              </span>
            </label>
            <textarea
              id="deskripsi"
              maxLength={300}
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="cth: Nasi goreng spesial dengan telur, ayam, dan sambal terasi"
              className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-warung-emas focus:bg-white focus:ring-2 focus:ring-warung-emas/30"
            />
          </div>

          {/* Status Ready */}
          <label className="flex cursor-pointer items-center justify-between rounded-xl bg-warung-krem px-4 py-3.5 ring-1 ring-stone-200">
            <div>
              <p className="text-sm font-semibold text-warung-hijau-tua">
                Menu Ready
              </p>
              <p className="text-xs text-stone-500">
                {isReady
                  ? "Pelanggan melihat badge READY"
                  : "Pelanggan melihat badge HABIS"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isReady}
              onClick={() => setIsReady(!isReady)}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ${
                isReady ? "bg-emerald-500" : "bg-stone-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                  isReady ? "translate-x-6.5" : "translate-x-1"
                }`}
              />
            </button>
          </label>

          {/* Error */}
          {error && (
            <div className="animate-fade-up rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
              ⚠️ {error}
            </div>
          )}

          {/* Tombol Aksi */}
          <div className="flex gap-3 pb-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl bg-stone-100 py-3 text-sm font-bold text-stone-600 transition-all duration-200 hover:bg-stone-200 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] rounded-xl bg-gradient-to-r from-warung-hijau to-warung-hijau-muda py-3 text-sm font-bold text-warung-emas shadow-lg shadow-warung-hijau/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {saving
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Tambah Menu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
