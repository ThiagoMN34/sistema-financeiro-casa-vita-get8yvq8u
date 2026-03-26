ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS nf_attachment_url TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS pc_attachment_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for attachments" ON storage.objects;
CREATE POLICY "Public read access for attachments" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload attachments" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'attachments');
