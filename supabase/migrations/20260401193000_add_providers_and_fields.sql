-- Add pix_key to employees
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS pix_key text;

-- Add is_imported to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_imported boolean DEFAULT false;

-- Create providers table
CREATE TABLE IF NOT EXISTS public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Dados da Empresa
  company_name text NOT NULL,
  trade_name text,
  cnpj text,
  municipal_registration text,
  address_street text,
  address_number text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_zip text,
  -- Dados de Contato
  legal_representative_name text,
  legal_representative_cpf text,
  legal_representative_rg text,
  email text,
  phone text,
  -- Dados Bancários
  bank_name text,
  bank_code text,
  bank_agency text,
  bank_account_number text,
  pix_key text,
  -- Informações Fiscais
  company_type text,
  main_cnae text,
  active boolean DEFAULT true
);

-- RLS for providers
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_providers" ON public.providers;
CREATE POLICY "auth_all_providers" ON public.providers FOR ALL TO authenticated USING (true) WITH CHECK (true);
