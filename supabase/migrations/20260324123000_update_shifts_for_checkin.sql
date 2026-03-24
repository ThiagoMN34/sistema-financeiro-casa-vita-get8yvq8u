-- Add new columns for the check-in feature
ALTER TABLE public.shifts 
  ADD COLUMN IF NOT EXISTS shift_type TEXT,
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS authorized_by TEXT,
  ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Allow amount to default to 0 for check-ins where value is defined later by manager
ALTER TABLE public.shifts ALTER COLUMN amount SET DEFAULT 0;

-- Allow anonymous inserts for check-ins
DROP POLICY IF EXISTS "anon_insert_shifts" ON public.shifts;
CREATE POLICY "anon_insert_shifts" ON public.shifts FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow anonymous select for companies to populate the check-in form
DROP POLICY IF EXISTS "anon_select_companies" ON public.companies;
CREATE POLICY "anon_select_companies" ON public.companies FOR SELECT TO anon, authenticated USING (true);
