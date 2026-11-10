-- ============================================================
-- RESET OTOMATIS STATUS MENU (pg_cron)
-- Jalankan di: Supabase Dashboard → SQL Editor → New query → Run
--
-- Setiap hari jam 00:00 WIB (= 17:00 UTC), semua menu otomatis
-- ditandai HABIS — siap untuk dipersiapkan esok harinya.
--
-- Perubahan ini juga memicu realtime update ke pelanggan.
-- ============================================================

-- 1. Aktifkan ekstensi pg_cron (biasanya sudah aktif di Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Grant izin agar cron bisa update tabel menus
GRANT EXECUTE ON FUNCTION cron.schedule TO postgres;

-- 3. Buat jadwal: setiap hari 17:00 UTC = 00:00 WIB
--    (Ganti ke '0 18 * * *' jika ingin jam 01:00 WIB)
--    Menu dengan auto_reset = false (📌 selalu-ready) TIDAK ikut direset
SELECT cron.schedule(
  'reset-menu-tengah-malam',
  '0 17 * * *',
  $$UPDATE public.menus SET is_ready = false WHERE is_ready = true AND auto_reset = true$$
);

-- Cek jadwal yang sudah terdaftar:
-- SELECT * FROM cron.job;
