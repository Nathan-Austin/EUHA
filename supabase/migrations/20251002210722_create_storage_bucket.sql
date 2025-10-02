-- Create storage bucket for sauce images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sauce-media',
  'sauce-media',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to sauce images
CREATE POLICY "Public can view sauce images"
ON storage.objects FOR SELECT
USING (bucket_id = 'sauce-media');

-- Allow authenticated users to upload to pending folder
CREATE POLICY "Authenticated users can upload to pending"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sauce-media'
  AND (storage.foldername(name))[1] = 'pending'
);

-- Allow service role to manage all files in sauce-media bucket
CREATE POLICY "Service role can manage sauce media"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'sauce-media')
WITH CHECK (bucket_id = 'sauce-media');

-- Allow authenticated users to update their pending uploads
CREATE POLICY "Users can update pending uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'sauce-media'
  AND (storage.foldername(name))[1] = 'pending'
)
WITH CHECK (
  bucket_id = 'sauce-media'
  AND (storage.foldername(name))[1] = 'pending'
);
