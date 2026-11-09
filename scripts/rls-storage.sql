-- ============================================================
-- KEBIJAKAN STORAGE TAHAP 5 — FOTO MENU
-- Jalankan di: Supabase Dashboard → SQL Editor → New query → Run
--
-- Untuk bucket "menu-photos":
--   - Publik boleh MELIHAT foto (untuk halaman menu)
--   - Admin yang login boleh UPLOAD / UPDATE / HAPUS foto
-- ============================================================

-- Publik boleh melihat foto menu
CREATE POLICY "Publik bisa lihat foto menu"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'menu-photos');

-- Admin yang login boleh upload foto
CREATE POLICY "Admin bisa upload foto"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-photos');

-- Admin yang login boleh mengganti foto
CREATE POLICY "Admin bisa update foto"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-photos')
WITH CHECK (bucket_id = 'menu-photos');

-- Admin yang login boleh menghapus foto
CREATE POLICY "Admin bisa hapus foto"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'menu-photos');
