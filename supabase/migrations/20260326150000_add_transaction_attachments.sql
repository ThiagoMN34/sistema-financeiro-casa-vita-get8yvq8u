-- Adiciona colunas para armazenar as URLs dos anexos de NF e PC na tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS nf_attachment_url TEXT,
ADD COLUMN IF NOT EXISTS pc_attachment_url TEXT;
