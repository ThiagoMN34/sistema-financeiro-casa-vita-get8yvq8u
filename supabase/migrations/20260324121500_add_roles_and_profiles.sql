-- Create profiles table for RBAC
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'MANAGER' CHECK (role IN ('ADMIN', 'MANAGER')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

-- Trigger to create profile automatically on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, CASE WHEN NEW.email = 'thiagomnaves@yahoo.com.br' THEN 'ADMIN' ELSE 'MANAGER' END);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed the initial users
DO $$
DECLARE
  admin_id uuid;
  manager_id uuid;
BEGIN
  -- Admin User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'thiagomnaves@yahoo.com.br') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'thiagomnaves@yahoo.com.br',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Manager User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'gestora@casavita.com.br') THEN
    manager_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      manager_id,
      '00000000-0000-0000-0000-000000000000',
      'gestora@casavita.com.br',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Gestora"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END $$;

-- Insert profile for any existing users that might have missed the trigger
INSERT INTO public.profiles (id, email, role)
SELECT id, email, CASE WHEN email = 'thiagomnaves@yahoo.com.br' THEN 'ADMIN' ELSE 'MANAGER' END
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Create helper function for RLS checks
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Apply RLS based on Roles
DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY['accounts', 'ai_patterns', 'categories', 'companies', 'debt_installments', 'debts', 'shifts', 'transactions'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "auth_all_%s" ON public.%I', t, t);
  END LOOP;
END $$;

-- Policies for Accounts
DROP POLICY IF EXISTS "admin_all_accounts" ON public.accounts;
CREATE POLICY "admin_all_accounts" ON public.accounts FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');

-- Policies for AI Patterns
DROP POLICY IF EXISTS "admin_all_ai_patterns" ON public.ai_patterns;
CREATE POLICY "admin_all_ai_patterns" ON public.ai_patterns FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');

-- Policies for Categories
DROP POLICY IF EXISTS "admin_all_categories" ON public.categories;
CREATE POLICY "admin_all_categories" ON public.categories FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');

-- Policies for Companies
DROP POLICY IF EXISTS "admin_all_companies" ON public.companies;
CREATE POLICY "admin_all_companies" ON public.companies FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
DROP POLICY IF EXISTS "manager_select_companies" ON public.companies;
CREATE POLICY "manager_select_companies" ON public.companies FOR SELECT TO authenticated USING (public.get_user_role() = 'MANAGER');

-- Policies for Debt Installments
DROP POLICY IF EXISTS "admin_all_debt_installments" ON public.debt_installments;
CREATE POLICY "admin_all_debt_installments" ON public.debt_installments FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');

-- Policies for Debts
DROP POLICY IF EXISTS "admin_all_debts" ON public.debts;
CREATE POLICY "admin_all_debts" ON public.debts FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');

-- Policies for Shifts (Admin full, Manager full so they can create/update to authorized)
DROP POLICY IF EXISTS "admin_all_shifts" ON public.shifts;
CREATE POLICY "admin_all_shifts" ON public.shifts FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
DROP POLICY IF EXISTS "manager_all_shifts" ON public.shifts;
CREATE POLICY "manager_all_shifts" ON public.shifts FOR ALL TO authenticated USING (public.get_user_role() = 'MANAGER');

-- Policies for Transactions
DROP POLICY IF EXISTS "admin_all_transactions" ON public.transactions;
CREATE POLICY "admin_all_transactions" ON public.transactions FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
