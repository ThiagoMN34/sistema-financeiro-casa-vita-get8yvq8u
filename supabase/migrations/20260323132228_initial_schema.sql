-- Create tables
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initial_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'BOTH')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  competence_date TIMESTAMPTZ NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  nf_number TEXT,
  value NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED')),
  ai_confidence TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  -- Companies
  DROP POLICY IF EXISTS "auth_all_companies" ON public.companies;
  CREATE POLICY "auth_all_companies" ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Accounts
  DROP POLICY IF EXISTS "auth_all_accounts" ON public.accounts;
  CREATE POLICY "auth_all_accounts" ON public.accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Categories
  DROP POLICY IF EXISTS "auth_all_categories" ON public.categories;
  CREATE POLICY "auth_all_categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Transactions
  DROP POLICY IF EXISTS "auth_all_transactions" ON public.transactions;
  CREATE POLICY "auth_all_transactions" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

-- Seed data and initial user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed initial user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'thiagomnaves@yahoo.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'thiagomnaves@yahoo.com.br',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
  
  -- Seed Companies
  INSERT INTO public.companies (id, name) VALUES
    ('1', 'Casa Vita 1'),
    ('2', 'Casa Vita 2')
  ON CONFLICT (id) DO NOTHING;

  -- Seed Accounts
  INSERT INTO public.accounts (id, company_id, name, initial_balance) VALUES
    ('1', '1', 'Banco Bradesco', 150000),
    ('2', '2', 'Banco Inter', 85000)
  ON CONFLICT (id) DO NOTHING;

  -- Seed Categories
  INSERT INTO public.categories (id, name, type) VALUES
    ('c1', '(+) Juros recebidos', 'IN'),
    ('c2', '(+) Receitas de Produtos e Serviços', 'IN'),
    ('c3', '(+) Receitas Operacionais', 'IN'),
    ('cat_4', '(+ / -) Ajustes de Saldo', 'BOTH'),
    ('cat_5', '(+ / -) Aplicações e Resgates', 'BOTH'),
    ('cat_6', '(+ / -) Transferência entre contas', 'BOTH'),
    ('cat_7', 'Absorventes', 'OUT'),
    ('cat_8', 'Ações trabalhistas', 'OUT'),
    ('c5', 'Água', 'OUT'),
    ('cat_10', 'Alimentação clientes - exceto cheiro verde', 'OUT'),
    ('cat_11', 'Alimentação interna', 'OUT'),
    ('cat_12', 'Alimentação transportada hóspedes', 'OUT'),
    ('c6', 'Aluguel e IPTU', 'OUT'),
    ('cat_14', 'Benefícios diversos', 'OUT'),
    ('cat_15', 'COFINS', 'OUT'),
    ('cat_16', 'Comissões', 'OUT'),
    ('cat_17', 'Contabilidade', 'OUT'),
    ('cat_18', 'Contr. Social - CSLL', 'OUT'),
    ('cat_19', 'DARM - impostos e taxas municipais', 'OUT'),
    ('cat_20', 'DAS', 'OUT'),
    ('cat_21', 'Dietas, frascos, equipos e seringas de 20mL', 'OUT'),
    ('cat_22', 'Empréstimos (+) e Devoluções (-)', 'BOTH'),
    ('cat_23', 'Encargos', 'OUT'),
    ('c4', 'Energia elétrica', 'OUT'),
    ('cat_25', 'Equipamentos adm. / escritório', 'OUT'),
    ('cat_26', 'Equipamentos de enfermagem / hospedagem', 'OUT'),
    ('cat_27', 'Espessantes', 'OUT'),
    ('cat_28', 'Eventos, festas e afins', 'OUT'),
    ('cat_29', 'Exames médicos e laboratoriais', 'OUT'),
    ('cat_30', 'Férias', 'OUT'),
    ('cat_31', 'FGTS', 'OUT'),
    ('cat_32', 'Fraldas EG', 'OUT'),
    ('cat_33', 'Fraldas G', 'OUT'),
    ('cat_34', 'Gás', 'OUT'),
    ('cat_35', 'Gastos de enfermagem não reembolsáveis', 'OUT'),
    ('cat_36', 'Horas extras', 'OUT'),
    ('cat_37', 'Impostos e taxas federais atrasados', 'OUT'),
    ('cat_38', 'INSS', 'OUT'),
    ('cat_39', 'Investimento em nova unidade', 'OUT'),
    ('cat_40', 'IRPJ', 'OUT'),
    ('cat_41', 'ISS', 'OUT'),
    ('cat_42', 'Juros Pagos', 'OUT'),
    ('cat_43', 'Lavanderia', 'OUT'),
    ('cat_44', 'Lenços', 'OUT'),
    ('cat_45', 'Locação de móveis e eqptos - não reembolsável', 'OUT'),
    ('cat_46', 'Locação de móveis e eqptos - reembolsável', 'OUT'),
    ('cat_47', 'Locação equipamentos operacionais para a Casa (maq. lavar louça)', 'OUT'),
    ('cat_48', 'Luvas', 'OUT'),
    ('cat_49', 'Manutenção eqptos escritório computadores câmeras TV', 'OUT'),
    ('cat_50', 'Manutenção eqptos operacionais / hosp.', 'OUT'),
    ('c12', 'Manutenção predial', 'OUT'),
    ('cat_52', 'Marketing e assessoria de imprensa', 'OUT'),
    ('cat_53', 'Materiais de enfermagem - não reembolsáveis', 'OUT'),
    ('cat_54', 'Materiais de enfermagem - reembolsáveis', 'OUT'),
    ('c10', 'Material de limpeza e dedetização', 'OUT'),
    ('cat_56', 'Material de papelaria e cartuchos', 'OUT'),
    ('cat_57', 'Material descartável', 'OUT'),
    ('c11', 'Medicamentos', 'OUT'),
    ('cat_59', 'Medicina do trabalho', 'OUT'),
    ('cat_60', 'Mensageiro, bike e motoboy', 'OUT'),
    ('cat_61', 'Nutricionista', 'OUT'),
    ('cat_62', 'Obras de Melhorias', 'OUT'),
    ('c13', 'Outras despesas', 'BOTH'),
    ('cat_64', 'Outros ativos', 'OUT'),
    ('cat_65', 'Oxigênio - aluguel de cilindro', 'OUT'),
    ('cat_66', 'Oxigênio - recarga', 'OUT'),
    ('cat_67', 'PIS', 'OUT'),
    ('cat_68', 'Plantões não reembolsados - admissão', 'OUT'),
    ('cat_69', 'Plantões não reembolsados - emergencial', 'OUT'),
    ('cat_70', 'Plantões não reembolsados - planejado', 'OUT'),
    ('cat_71', 'Plantões reembolsados', 'OUT'),
    ('cat_72', 'Prêmios / Bônus', 'OUT'),
    ('cat_73', 'Prestadores de Serviços - Administrativos', 'OUT'),
    ('cat_74', 'Prestadores de Serviços - Operacionais (limpeza 3)', 'OUT'),
    ('cat_75', 'Pro-labore sócios & antecipação lucros - Luis', 'OUT'),
    ('cat_76', 'Pro-labore sócios & antecipação lucros - Thiago', 'OUT'),
    ('cat_77', 'Recrutamento e seleção', 'OUT'),
    ('cat_78', 'Reembolso de despesas diversas', 'OUT'),
    ('cat_79', 'Remoções ambulância', 'OUT'),
    ('cat_80', 'Rescisões e quitações', 'OUT'),
    ('cat_81', 'Rouparia', 'OUT'),
    ('c8', 'Salários', 'OUT'),
    ('cat_83', 'Salários e férias - estagiários', 'OUT'),
    ('cat_84', 'Segurança', 'OUT'),
    ('cat_85', 'Serviços de terc. adm. (exceto contabilidade)', 'OUT'),
    ('cat_86', 'Serviços de terceiros - diretos (ativ., manicure)', 'OUT'),
    ('cat_87', 'Sindicatos, conselhos e associações', 'OUT'),
    ('cat_88', 'Softwares e licenças', 'OUT'),
    ('cat_89', 'Suplementos', 'OUT'),
    ('cat_90', 'Tarifas bancárias e IOF', 'OUT'),
    ('c7', 'Telefone, internet', 'OUT'),
    ('cat_92', 'Treinamentos', 'OUT'),
    ('cat_93', 'TRSS - Taxas de Resíduos Sólidos', 'OUT'),
    ('cat_94', 'Uniformes', 'OUT'),
    ('cat_95', 'Vale transporte', 'OUT')
  ON CONFLICT (id) DO NOTHING;

  -- Seed initial transactions
  INSERT INTO public.transactions (id, competence_date, payment_date, company_id, account_id, category_id, description, value, type, status, ai_confidence) VALUES
    ('t1', NOW(), NOW(), '1', '1', 'c2', 'Mensalidade Hospedagem Silva', 12500, 'IN', 'CONFIRMED', NULL),
    ('t2', NOW(), NOW(), '1', '1', 'c4', 'Conta Neoenergia', 1200.5, 'OUT', 'CONFIRMED', NULL),
    ('t3', NOW(), NOW(), '2', '2', 'c8', 'Folha Pagamento', 25000, 'OUT', 'CONFIRMED', NULL),
    ('t4', NOW(), NOW(), '1', '1', 'c10', 'Compra Material Limpeza Atacadão', 450.0, 'OUT', 'PENDING', 'low'),
    ('t5', NOW(), NOW(), '2', '2', 'c5', 'Compesa S/A', 320.0, 'OUT', 'PENDING', 'high')
  ON CONFLICT (id) DO NOTHING;

END $$;
