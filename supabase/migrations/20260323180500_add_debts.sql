CREATE TABLE IF NOT EXISTS public.debts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  creditor TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  total_installments INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.debt_installments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  debt_id TEXT NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID')),
  transaction_id TEXT REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS debt_installment_id TEXT REFERENCES public.debt_installments(id) ON DELETE SET NULL;

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_installments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "auth_all_debts" ON public.debts;
  CREATE POLICY "auth_all_debts" ON public.debts FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "auth_all_debt_installments" ON public.debt_installments;
  CREATE POLICY "auth_all_debt_installments" ON public.debt_installments FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

CREATE OR REPLACE FUNCTION public.update_installment_status()
RETURNS trigger AS $$
BEGIN
  -- If transaction is updated and the debt_installment_id changed, revert the old one
  IF TG_OP = 'UPDATE' AND OLD.debt_installment_id IS NOT NULL AND OLD.debt_installment_id IS DISTINCT FROM NEW.debt_installment_id THEN
    UPDATE public.debt_installments 
    SET status = 'PENDING', transaction_id = NULL
    WHERE id = OLD.debt_installment_id;
  END IF;

  -- Update the new one
  IF NEW.debt_installment_id IS NOT NULL THEN
    UPDATE public.debt_installments 
    SET status = 'PAID', transaction_id = NEW.id
    WHERE id = NEW.debt_installment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_transaction_linked_installment ON public.transactions;
CREATE TRIGGER on_transaction_linked_installment
  AFTER INSERT OR UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_installment_status();

CREATE OR REPLACE FUNCTION public.revert_installment_status()
RETURNS trigger AS $$
BEGIN
  IF OLD.debt_installment_id IS NOT NULL THEN
    UPDATE public.debt_installments 
    SET status = 'PENDING', transaction_id = NULL
    WHERE id = OLD.debt_installment_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_transaction_deleted_installment ON public.transactions;
CREATE TRIGGER on_transaction_deleted_installment
  BEFORE DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.revert_installment_status();
