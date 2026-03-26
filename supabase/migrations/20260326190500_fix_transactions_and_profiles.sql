-- Add missing columns for attachments in transactions
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS nf_attachment_url TEXT,
ADD COLUMN IF NOT EXISTS pc_attachment_url TEXT;

-- Allow users to insert their own profile to gracefully handle cases where the trigger fails
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Ensure existing users have profiles to fix any desyncs
INSERT INTO public.profiles (id, email, role)
SELECT id, email, CASE WHEN email = 'thiagomnaves@yahoo.com.br' THEN 'ADMIN' ELSE 'MANAGER' END
FROM auth.users
ON CONFLICT (id) DO NOTHING;
