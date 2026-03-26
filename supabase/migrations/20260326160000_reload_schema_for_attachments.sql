-- Ensure columns exist
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS nf_attachment_url TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS pc_attachment_url TEXT;

-- Force PostgREST to reload the schema cache so the new columns are recognized
NOTIFY pgrst, 'reload schema';
