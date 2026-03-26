-- Adiciona as colunas de anexo na tabela transactions se elas não existirem
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS nf_attachment_url TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS pc_attachment_url TEXT;

-- Cria o bucket de storage para os anexos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true) 
ON CONFLICT (id) DO NOTHING;

-- Remove as políticas caso existam e recria com segurança
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');

-- Atualiza o cache de schema do postgrest
NOTIFY pgrst, 'reload schema';
