-- ============================================================
-- KOLOM AUTO_RESET (TAHAP BONUS)
-- Jalankan di: Supabase Dashboard → SQL Editor → New query → Run
--
-- auto_reset = true  → menu IKUT di-reset jadi habis tiap tengah malam
-- auto_reset = false → menu TETAP READY (untuk menu yang selalu ada,
--                      cth: air mineral, es teh, kerupuk)
--
-- Menu yang sudah ada otomatis di-set auto_reset = true
-- (perilaku seperti sebelumnya), nanti tinggal kamu matikan
-- untuk menu yang selalu tersedia.
-- ============================================================

-- Tambah kolom auto_reset (default true = ikut reset seperti biasa)
ALTER TABLE menus
ADD COLUMN IF NOT EXISTS auto_reset BOOLEAN NOT NULL DEFAULT true;
