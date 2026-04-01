-- Add new fields to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS role text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS work_schedule text,
ADD COLUMN IF NOT EXISTS has_transport_voucher boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_meal_voucher boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS transport_voucher_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS bank_agency text,
ADD COLUMN IF NOT EXISTS bank_account_type text,
ADD COLUMN IF NOT EXISTS bank_account_number text,
ADD COLUMN IF NOT EXISTS admission_date date,
ADD COLUMN IF NOT EXISTS workplace text,
ADD COLUMN IF NOT EXISTS dismissal_date date,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS rg text,
ADD COLUMN IF NOT EXISTS pis text,
ADD COLUMN IF NOT EXISTS ctps text,
ADD COLUMN IF NOT EXISTS cbo text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS address_street text,
ADD COLUMN IF NOT EXISTS address_neighborhood text,
ADD COLUMN IF NOT EXISTS address_number text,
ADD COLUMN IF NOT EXISTS address_complement text,
ADD COLUMN IF NOT EXISTS address_zip text,
ADD COLUMN IF NOT EXISTS address_state text,
ADD COLUMN IF NOT EXISTS address_city text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS emergency_contact1_name text,
ADD COLUMN IF NOT EXISTS emergency_contact1_phone text,
ADD COLUMN IF NOT EXISTS emergency_contact2_name text,
ADD COLUMN IF NOT EXISTS emergency_contact2_phone text;

-- Create shift_reasons table
CREATE TABLE IF NOT EXISTS public.shift_reasons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reason text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shift_reasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_shift_reasons" ON public.shift_reasons;
CREATE POLICY "auth_all_shift_reasons" ON public.shift_reasons
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
