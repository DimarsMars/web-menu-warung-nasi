"use server";

import { revalidatePath } from "next/cache";

/**
 * Server action untuk menyegarkan halaman setelah data menu berubah.
 * Dipanggil dari client setelah tambah/edit/toggle/hapus menu,
 * agar halaman pelanggan (/) dan dashboard admin (/admin) menampilkan
 * data terbaru.
 */
export async function refreshMenus() {
  revalidatePath("/");
  revalidatePath("/admin");
}
