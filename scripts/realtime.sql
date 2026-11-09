-- ============================================================
-- TAHAP 6 — AKTIFKAN REALTIME UNTUK TABEL MENUS
-- Jalankan di: Supabase Dashboard → SQL Editor → New query → Run
--
-- Wajib! Tanpa ini, update realtime tidak akan berfungsi.
-- ============================================================

-- Publikasikan perubahan tabel menus via Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE menus;
