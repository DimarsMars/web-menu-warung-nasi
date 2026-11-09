-- ============================================================
-- KEBIJAKAN RLS TAHAP 4 — AUTH ADMIN
-- Jalankan di: Supabase Dashboard → SQL Editor → New query → Run
--
-- Kebijakan sebelumnya (dari Tahap 2):
--   "Publik bisa lihat menu" (SELECT untuk anon, authenticated)
--
-- Tahap ini menambahkan:
--   Admin yang sudah login boleh menambah/ubah/hapus menu
-- ============================================================

-- Admin (user yang login) boleh menambah menu
CREATE POLICY "Admin bisa tambah menu"
ON menus
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admin (user yang login) boleh mengubah menu
CREATE POLICY "Admin bisa ubah menu"
ON menus
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Admin (user yang login) boleh menghapus menu
CREATE POLICY "Admin bisa hapus menu"
ON menus
FOR DELETE
TO authenticated
USING (true);
