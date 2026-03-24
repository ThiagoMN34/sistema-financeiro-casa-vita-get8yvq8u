-- Implementa uma trava de estado (Workflow) para garantir que plantões
-- pagos não retornem para o status de pendente ou autorizado, 
-- e que plantões autorizados não retornem para pendentes.

CREATE OR REPLACE FUNCTION public.enforce_shift_workflow()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Prevent downgrading from PAID to PENDING or AUTHORIZED
    IF OLD.status = 'PAID' AND NEW.status IN ('PENDING', 'AUTHORIZED') THEN
      NEW.status = 'PAID';
    END IF;
    -- Prevent downgrading from AUTHORIZED to PENDING
    IF OLD.status = 'AUTHORIZED' AND NEW.status = 'PENDING' THEN
      NEW.status = 'AUTHORIZED';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_shift_workflow_trigger ON public.shifts;
CREATE TRIGGER enforce_shift_workflow_trigger
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_shift_workflow();
