-- Allow ADMIN users to perform all operations on the profiles table
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;

CREATE POLICY "admin_all_profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.get_user_role() = 'ADMIN');
