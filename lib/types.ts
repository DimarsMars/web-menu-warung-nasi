export interface Menu {
  id: string;
  nama: string;
  deskripsi: string | null;
  harga: number;
  kategori: string | null;
  foto_url: string | null;
  is_ready: boolean;
  auto_reset: boolean; // false = menu selalu ada, tidak ikut reset harian
  created_at: string;
}

export function formatRupiah(harga: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(harga);
}
