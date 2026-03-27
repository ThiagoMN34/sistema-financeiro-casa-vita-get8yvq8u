CREATE TABLE IF NOT EXISTS public.shift_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_type TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.shift_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_shift_rates" ON public.shift_rates;
CREATE POLICY "auth_all_shift_rates" ON public.shift_rates FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.shift_rates (shift_type, amount) VALUES 
('12h diurno clínica', 0),
('12h noturno clínica', 0),
('12h diurno hóspede', 0),
('12h noturno hóspede', 0)
ON CONFLICT (shift_type) DO NOTHING;
