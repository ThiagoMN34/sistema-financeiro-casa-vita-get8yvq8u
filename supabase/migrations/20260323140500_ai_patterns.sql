-- Migration to add ai_patterns table for machine learning of categories
DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.ai_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL UNIQUE,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE public.ai_patterns ENABLE ROW LEVEL SECURITY;

-- Setup Policies
DROP POLICY IF EXISTS "auth_all_ai_patterns" ON public.ai_patterns;
CREATE POLICY "auth_all_ai_patterns" ON public.ai_patterns 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed initial patterns
INSERT INTO public.ai_patterns (keyword, category_id) VALUES
  ('neoenergia', 'c4'),
  ('compesa', 'c5'),
  ('limpeza', 'c10'),
  ('atacadão', 'c10'),
  ('folha', 'c8'),
  ('salario', 'c8')
ON CONFLICT (keyword) DO NOTHING;
