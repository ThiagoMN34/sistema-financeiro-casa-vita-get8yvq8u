DO $BODY$
DECLARE
  v_user_id uuid;
BEGIN
  -- Seed Gestora User (naves034@gmail.com)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'naves034@gmail.com') THEN
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

    -- Also insert into profiles to ensure the role is set correctly
    INSERT INTO public.profiles (id, email, role)
    VALUES (v_user_id, 'naves034@gmail.com', 'MANAGER')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $BODY$;
