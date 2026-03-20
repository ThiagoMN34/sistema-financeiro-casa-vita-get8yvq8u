import { addDays, subDays } from 'date-fns'

export type TransactionType = 'IN' | 'OUT'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface Category {
  id: string
  name: string
  type: TransactionType | 'BOTH'
}

export interface Company {
  id: string
  name: string
}

export interface Account {
  id: string
  companyId: string
  name: string
  initialBalance: number
}

export interface Transaction {
  id: string
  competenceDate: string
  paymentDate: string
  companyId: string
  accountId: string
  categoryId: string
  description: string
  nfNumber?: string
  value: number
  type: TransactionType
  status: 'PENDING' | 'CONFIRMED'
  aiConfidence?: ConfidenceLevel
}

export const MOCK_COMPANIES: Company[] = [
  { id: '1', name: 'Casa Vita 1' },
  { id: '2', name: 'Casa Vita 2' },
]

export const MOCK_ACCOUNTS: Account[] = [
  { id: '1', companyId: '1', name: 'Banco Bradesco', initialBalance: 150000 },
  { id: '2', companyId: '2', name: 'Banco Inter', initialBalance: 85000 },
]

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: '(+) Juros recebidos', type: 'IN' },
  { id: 'c2', name: '(+) Receitas de Produtos e Serviços', type: 'IN' },
  { id: 'c3', name: '(+) Receitas Operacionais', type: 'IN' },
  { id: 'cat_4', name: '(+ / -) Ajustes de Saldo', type: 'BOTH' },
  { id: 'cat_5', name: '(+ / -) Aplicações e Resgates', type: 'BOTH' },
  { id: 'cat_6', name: '(+ / -) Transferência entre contas', type: 'BOTH' },
  { id: 'cat_7', name: 'Absorventes', type: 'OUT' },
  { id: 'cat_8', name: 'Ações trabalhistas', type: 'OUT' },
  { id: 'c5', name: 'Água', type: 'OUT' },
  { id: 'cat_10', name: 'Alimentação clientes - exceto cheiro verde', type: 'OUT' },
  { id: 'cat_11', name: 'Alimentação interna', type: 'OUT' },
  { id: 'cat_12', name: 'Alimentação transportada hóspedes', type: 'OUT' },
  { id: 'c6', name: 'Aluguel e IPTU', type: 'OUT' },
  { id: 'cat_14', name: 'Benefícios diversos', type: 'OUT' },
  { id: 'cat_15', name: 'COFINS', type: 'OUT' },
  { id: 'cat_16', name: 'Comissões', type: 'OUT' },
  { id: 'cat_17', name: 'Contabilidade', type: 'OUT' },
  { id: 'cat_18', name: 'Contr. Social - CSLL', type: 'OUT' },
  { id: 'cat_19', name: 'DARM - impostos e taxas municipais', type: 'OUT' },
  { id: 'cat_20', name: 'DAS', type: 'OUT' },
  { id: 'cat_21', name: 'Dietas, frascos, equipos e seringas de 20mL', type: 'OUT' },
  { id: 'cat_22', name: 'Empréstimos (+) e Devoluções (-)', type: 'BOTH' },
  { id: 'cat_23', name: 'Encargos', type: 'OUT' },
  { id: 'c4', name: 'Energia elétrica', type: 'OUT' },
  { id: 'cat_25', name: 'Equipamentos adm. / escritório', type: 'OUT' },
  { id: 'cat_26', name: 'Equipamentos de enfermagem / hospedagem', type: 'OUT' },
  { id: 'cat_27', name: 'Espessantes', type: 'OUT' },
  { id: 'cat_28', name: 'Eventos, festas e afins', type: 'OUT' },
  { id: 'cat_29', name: 'Exames médicos e laboratoriais', type: 'OUT' },
  { id: 'cat_30', name: 'Férias', type: 'OUT' },
  { id: 'cat_31', name: 'FGTS', type: 'OUT' },
  { id: 'cat_32', name: 'Fraldas EG', type: 'OUT' },
  { id: 'cat_33', name: 'Fraldas G', type: 'OUT' },
  { id: 'cat_34', name: 'Gás', type: 'OUT' },
  { id: 'cat_35', name: 'Gastos de enfermagem não reembolsáveis', type: 'OUT' },
  { id: 'cat_36', name: 'Horas extras', type: 'OUT' },
  { id: 'cat_37', name: 'Impostos e taxas federais atrasados', type: 'OUT' },
  { id: 'cat_38', name: 'INSS', type: 'OUT' },
  { id: 'cat_39', name: 'Investimento em nova unidade', type: 'OUT' },
  { id: 'cat_40', name: 'IRPJ', type: 'OUT' },
  { id: 'cat_41', name: 'ISS', type: 'OUT' },
  { id: 'cat_42', name: 'Juros Pagos', type: 'OUT' },
  { id: 'cat_43', name: 'Lavanderia', type: 'OUT' },
  { id: 'cat_44', name: 'Lenços', type: 'OUT' },
  { id: 'cat_45', name: 'Locação de móveis e eqptos - não reembolsável', type: 'OUT' },
  { id: 'cat_46', name: 'Locação de móveis e eqptos - reembolsável', type: 'OUT' },
  {
    id: 'cat_47',
    name: 'Locação equipamentos operacionais para a Casa (maq. lavar louça)',
    type: 'OUT',
  },
  { id: 'cat_48', name: 'Luvas', type: 'OUT' },
  { id: 'cat_49', name: 'Manutenção eqptos escritório computadores câmeras TV', type: 'OUT' },
  { id: 'cat_50', name: 'Manutenção eqptos operacionais / hosp.', type: 'OUT' },
  { id: 'c12', name: 'Manutenção predial', type: 'OUT' },
  { id: 'cat_52', name: 'Marketing e assessoria de imprensa', type: 'OUT' },
  { id: 'cat_53', name: 'Materiais de enfermagem - não reembolsáveis', type: 'OUT' },
  { id: 'cat_54', name: 'Materiais de enfermagem - reembolsáveis', type: 'OUT' },
  { id: 'c10', name: 'Material de limpeza e dedetização', type: 'OUT' },
  { id: 'cat_56', name: 'Material de papelaria e cartuchos', type: 'OUT' },
  { id: 'cat_57', name: 'Material descartável', type: 'OUT' },
  { id: 'c11', name: 'Medicamentos', type: 'OUT' },
  { id: 'cat_59', name: 'Medicina do trabalho', type: 'OUT' },
  { id: 'cat_60', name: 'Mensageiro, bike e motoboy', type: 'OUT' },
  { id: 'cat_61', name: 'Nutricionista', type: 'OUT' },
  { id: 'cat_62', name: 'Obras de Melhorias', type: 'OUT' },
  { id: 'c13', name: 'Outras despesas', type: 'BOTH' },
  { id: 'cat_64', name: 'Outros ativos', type: 'OUT' },
  { id: 'cat_65', name: 'Oxigênio - aluguel de cilindro', type: 'OUT' },
  { id: 'cat_66', name: 'Oxigênio - recarga', type: 'OUT' },
  { id: 'cat_67', name: 'PIS', type: 'OUT' },
  { id: 'cat_68', name: 'Plantões não reembolsados - admissão', type: 'OUT' },
  { id: 'cat_69', name: 'Plantões não reembolsados - emergencial', type: 'OUT' },
  { id: 'cat_70', name: 'Plantões não reembolsados - planejado', type: 'OUT' },
  { id: 'cat_71', name: 'Plantões reembolsados', type: 'OUT' },
  { id: 'cat_72', name: 'Prêmios / Bônus', type: 'OUT' },
  { id: 'cat_73', name: 'Prestadores de Serviços - Administrativos', type: 'OUT' },
  { id: 'cat_74', name: 'Prestadores de Serviços - Operacionais (limpeza 3)', type: 'OUT' },
  { id: 'cat_75', name: 'Pro-labore sócios & antecipação lucros - Luis', type: 'OUT' },
  { id: 'cat_76', name: 'Pro-labore sócios & antecipação lucros - Thiago', type: 'OUT' },
  { id: 'cat_77', name: 'Recrutamento e seleção', type: 'OUT' },
  { id: 'cat_78', name: 'Reembolso de despesas diversas', type: 'OUT' },
  { id: 'cat_79', name: 'Remoções ambulância', type: 'OUT' },
  { id: 'cat_80', name: 'Rescisões e quitações', type: 'OUT' },
  { id: 'cat_81', name: 'Rouparia', type: 'OUT' },
  { id: 'c8', name: 'Salários', type: 'OUT' },
  { id: 'cat_83', name: 'Salários e férias - estagiários', type: 'OUT' },
  { id: 'cat_84', name: 'Segurança', type: 'OUT' },
  { id: 'cat_85', name: 'Serviços de terc. adm. (exceto contabilidade)', type: 'OUT' },
  { id: 'cat_86', name: 'Serviços de terceiros - diretos (ativ., manicure)', type: 'OUT' },
  { id: 'cat_87', name: 'Sindicatos, conselhos e associações', type: 'OUT' },
  { id: 'cat_88', name: 'Softwares e licenças', type: 'OUT' },
  { id: 'cat_89', name: 'Suplementos', type: 'OUT' },
  { id: 'cat_90', name: 'Tarifas bancárias e IOF', type: 'OUT' },
  { id: 'c7', name: 'Telefone, internet', type: 'OUT' },
  { id: 'cat_92', name: 'Treinamentos', type: 'OUT' },
  { id: 'cat_93', name: 'TRSS - Taxas de Resíduos Sólidos', type: 'OUT' },
  { id: 'cat_94', name: 'Uniformes', type: 'OUT' },
  { id: 'cat_95', name: 'Vale transporte', type: 'OUT' },
]

const today = new Date()

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    competenceDate: subDays(today, 2).toISOString(),
    paymentDate: subDays(today, 1).toISOString(),
    companyId: '1',
    accountId: '1',
    categoryId: 'c2',
    description: 'Mensalidade Hospedagem Silva',
    value: 12500,
    type: 'IN',
    status: 'CONFIRMED',
  },
  {
    id: 't2',
    competenceDate: subDays(today, 5).toISOString(),
    paymentDate: subDays(today, 5).toISOString(),
    companyId: '1',
    accountId: '1',
    categoryId: 'c4',
    description: 'Conta Neoenergia',
    value: 1200.5,
    type: 'OUT',
    status: 'CONFIRMED',
  },
  {
    id: 't3',
    competenceDate: subDays(today, 10).toISOString(),
    paymentDate: subDays(today, 10).toISOString(),
    companyId: '2',
    accountId: '2',
    categoryId: 'c8',
    description: 'Folha Pagamento',
    value: 25000,
    type: 'OUT',
    status: 'CONFIRMED',
  },
  {
    id: 't4',
    competenceDate: subDays(today, 1).toISOString(),
    paymentDate: subDays(today, 1).toISOString(),
    companyId: '1',
    accountId: '1',
    categoryId: 'c10',
    description: 'Compra Material Limpeza Atacadão',
    value: 450.0,
    type: 'OUT',
    status: 'PENDING',
    aiConfidence: 'low',
  },
  {
    id: 't5',
    competenceDate: subDays(today, 0).toISOString(),
    paymentDate: subDays(today, 0).toISOString(),
    companyId: '2',
    accountId: '2',
    categoryId: 'c5',
    description: 'Compesa S/A',
    value: 320.0,
    type: 'OUT',
    status: 'PENDING',
    aiConfidence: 'high',
  },
]
