-- 1. Create profiles if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'MANAGER',
  created_at timestamptz DEFAULT NOW()
);

-- Ensure role and email columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'MANAGER';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '';

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Fix NULL tokens bug that prevents login in Supabase
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE
    confirmation_token IS NULL OR recovery_token IS NULL
    OR email_change_token_new IS NULL OR email_change IS NULL
    OR email_change_token_current IS NULL
    OR phone_change IS NULL OR phone_change_token IS NULL
    OR reauthentication_token IS NULL;

  -- 1. thiagomnaves@yahoo.com.br
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'thiagomnaves@yahoo.com.br';
  
  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET encrypted_password = crypt('securepassword123', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE id = v_user_id;
    
    INSERT INTO public.profiles (id, email, role)
    VALUES (v_user_id, 'thiagomnaves@yahoo.com.br', 'ADMIN')
    ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', email = 'thiagomnaves@yahoo.com.br';
  ELSE
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'thiagomnaves@yahoo.com.br',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Thiago Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
    
    INSERT INTO public.profiles (id, email, role)
    VALUES (v_user_id, 'thiagomnaves@yahoo.com.br', 'ADMIN')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 2. naves034@gmail.com
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'naves034@gmail.com';
  
  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET encrypted_password = crypt('securepassword123', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE id = v_user_id;
    
    INSERT INTO public.profiles (id, email, role)
    VALUES (v_user_id, 'naves034@gmail.com', 'MANAGER')
    ON CONFLICT (id) DO UPDATE SET role = 'MANAGER', email = 'naves034@gmail.com';
  ELSE
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
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
    VALUES (v_user_id, 'naves034@gmail.com', 'MANAGER')
    ON CONFLICT (id) DO NOTHING;
  END IF;

END $$;

-- Ensure RLS is active
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_select" ON public.profiles;
CREATE POLICY "allow_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_insert" ON public.profiles;
CREATE POLICY "allow_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "allow_update" ON public.profiles;
CREATE POLICY "allow_update" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
