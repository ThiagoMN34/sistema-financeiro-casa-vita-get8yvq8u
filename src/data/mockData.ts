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
  { id: 'c4', name: 'Energia elétrica', type: 'OUT' },
  { id: 'c5', name: 'Água', type: 'OUT' },
  { id: 'c6', name: 'Aluguel e IPTU', type: 'OUT' },
  { id: 'c7', name: 'Internet e Telefone', type: 'OUT' },
  { id: 'c8', name: 'Salários', type: 'OUT' },
  { id: 'c9', name: 'Impostos e taxas', type: 'OUT' },
  { id: 'c10', name: 'Material de limpeza e dedetização', type: 'OUT' },
  { id: 'c11', name: 'Medicamentos', type: 'OUT' },
  { id: 'c12', name: 'Manutenção predial', type: 'OUT' },
  { id: 'c13', name: 'Desconhecida / Outros', type: 'BOTH' },
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
