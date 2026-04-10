DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Update thiagomnaves@yahoo.com.br
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'thiagomnaves@yahoo.com.br';
  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET encrypted_password = crypt('1234', gen_salt('bf')),
        updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- Update naves034@gmail.com
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'naves034@gmail.com';
  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET encrypted_password = crypt('1234', gen_salt('bf')),
        updated_at = NOW()
    WHERE id = v_user_id;
  END IF;
END $$;
