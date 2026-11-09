/**
 * Script test koneksi ke Supabase
 * Jalankan dengan: npx tsx scripts/test-supabase.ts
 * (atau: node --experimental-strip-types scripts/test-supabase.ts)
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Environment variables tidak ditemukan!");
  console.error("   Pastikan .env.local sudah berisi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("🔌 Mencoba koneksi ke:", supabaseUrl);
  console.log("");

  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Gagal mengambil data:", error.message);
    console.error("   Detail:", error.details, error.hint);
    process.exit(1);
  }

  console.log(`✅ Koneksi berhasil! Ditemukan ${data.length} menu:`);
  console.log("");
  for (const menu of data) {
    console.log(`  🍽️  ${menu.nama}`);
    console.log(`      Harga   : Rp ${Number(menu.harga).toLocaleString("id-ID")}`);
    console.log(`      Kategori: ${menu.kategori}`);
    console.log(`      Status  : ${menu.is_ready ? "READY ✅" : "HABIS ❌"}`);
    console.log(`      Deskripsi: ${menu.deskripsi ?? "-"}`);
    console.log("");
  }
}

test();
