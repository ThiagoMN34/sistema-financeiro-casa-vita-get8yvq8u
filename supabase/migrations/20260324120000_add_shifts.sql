CREATE TABLE IF NOT EXISTS public.shifts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'AUTHORIZED', 'PAID')),
  transaction_id TEXT REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "auth_all_shifts" ON public.shifts;
  CREATE POLICY "auth_all_shifts" ON public.shifts FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;
