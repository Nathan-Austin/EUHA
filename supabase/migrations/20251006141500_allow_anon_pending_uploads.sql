-- Allow anonymous users to upload to pending folder for supplier registration
-- This is safe because:
-- 1. Images are in a temporary 'pending' folder
-- 2. Only service role can move them to permanent locations
-- 3. Pending images can be cleaned up periodically

DROP POLICY IF EXISTS "Authenticated users can upload to pending" ON storage.objects;

CREATE POLICY "Anyone can upload to pending folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sauce-media'
  AND (storage.foldername(name))[1] = 'pending'
);
