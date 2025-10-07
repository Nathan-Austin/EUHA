-- Create storage bucket for past results images
INSERT INTO storage.buckets (id, name, public)
VALUES ('past-results-images', 'past-results-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'past-results-images' );

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'past-results-images'
  AND auth.role() = 'authenticated'
);

-- Allow service role full access
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
USING ( bucket_id = 'past-results-images' AND auth.role() = 'service_role' );
