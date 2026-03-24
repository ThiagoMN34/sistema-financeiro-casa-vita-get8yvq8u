-- Seed the new manager user
DO $$
DECLARE
  new_manager_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'naves034@gmail.com') THEN
    new_manager_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_manager_id,
      '00000000-0000-0000-0000-000000000000',
      'naves034@gmail.com',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Gestora"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, role)
    VALUES (new_manager_id, 'naves034@gmail.com', 'MANAGER')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_audit_logs" ON public.audit_logs;
CREATE POLICY "admin_all_audit_logs" ON public.audit_logs
  FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');

-- Create trigger for shifts
CREATE OR REPLACE FUNCTION public.log_shift_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (v_user_id, 'INSERT', 'SHIFT', NEW.id, row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if there are changes to avoid spam
    IF row_to_json(OLD) IS DISTINCT FROM row_to_json(NEW) THEN
      INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
      VALUES (v_user_id, 'UPDATE', 'SHIFT', NEW.id, jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (v_user_id, 'DELETE', 'SHIFT', OLD.id, row_to_json(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS log_shift_changes_trigger ON public.shifts;
CREATE TRIGGER log_shift_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.shifts
FOR EACH ROW EXECUTE FUNCTION public.log_shift_changes();
