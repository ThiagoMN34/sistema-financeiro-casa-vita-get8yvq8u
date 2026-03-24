-- CREATE TABLES
CREATE TABLE IF NOT EXISTS public.credit_cards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  closing_day INTEGER NOT NULL,
  due_day INTEGER NOT NULL,
  limit_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_card_transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  card_id TEXT NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  installment_current INTEGER,
  installment_total INTEGER,
  invoice_month TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_transactions ENABLE ROW LEVEL SECURITY;

DO $
BEGIN
  DROP POLICY IF EXISTS "admin_all_credit_cards" ON public.credit_cards;
  CREATE POLICY "admin_all_credit_cards" ON public.credit_cards 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "admin_all_cc_transactions" ON public.credit_card_transactions;
  CREATE POLICY "admin_all_cc_transactions" ON public.credit_card_transactions 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $;

