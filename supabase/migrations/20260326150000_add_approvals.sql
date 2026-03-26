-- Upgrade transactions status constraint and add attachment columns
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_status_check CHECK (status IN ('PENDING', 'AUTHORIZED', 'CONFIRMED'));

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS nf_attachment_url TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS pc_attachment_url TEXT;

-- Create bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true) ON CONFLICT (id) DO NOTHING;

-- Policies for storage
DROP POLICY IF EXISTS "Public access to attachments" ON storage.objects;
CREATE POLICY "Public access to attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Auth insert to attachments" ON storage.objects;
CREATE POLICY "Auth insert to attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Auth update to attachments" ON storage.objects;
CREATE POLICY "Auth update to attachments" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Auth delete to attachments" ON storage.objects;
CREATE POLICY "Auth delete to attachments" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'attachments');
