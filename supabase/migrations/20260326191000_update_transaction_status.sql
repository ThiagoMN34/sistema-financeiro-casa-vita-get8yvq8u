-- Drop the existing constraint that only allows PENDING and CONFIRMED
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

-- Add the updated constraint including 'AUTHORIZED' to support the multi-step approval workflow
ALTER TABLE public.transactions ADD CONSTRAINT transactions_status_check CHECK (status IN ('PENDING', 'AUTHORIZED', 'CONFIRMED'));
