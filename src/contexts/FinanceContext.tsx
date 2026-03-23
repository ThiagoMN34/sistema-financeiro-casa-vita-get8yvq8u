import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

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

interface DateRange {
  from: Date
  to: Date
}

interface Filters {
  companyId: string
  accountId: string
  dateRange: DateRange
}

interface FinanceContextData {
  transactions: Transaction[]
  categories: Category[]
  accounts: Account[]
  companies: Company[]
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  addTransaction: (t: Transaction) => void
  updateTransaction: (id: string, t: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addCategory: (c: Category) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  filteredTransactions: Transaction[]
  pendingTransactions: Transaction[]
  summary: { balance: number; revenue: number; expenses: number; net: number }
  aiSuggestCategory: (description: string) => {
    categoryId: string
    confidence: 'high' | 'medium' | 'low'
  }
  learnAiMapping: (keyword: string, categoryId: string) => void
}

const FinanceContext = createContext<FinanceContextData | undefined>(undefined)

const initialFilters: Filters = {
  companyId: 'all',
  accountId: 'all',
  dateRange: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [aiDictionary, setAiDictionary] = useState<Record<string, string>>({
    neoenergia: 'c4',
    compesa: 'c5',
    limpeza: 'c10',
    atacadão: 'c10',
    folha: 'c8',
    salario: 'c8',
  })

  useEffect(() => {
    if (!session) return

    const fetchData = async () => {
      const [comps, accs, cats, txs] = await Promise.all([
        supabase.from('companies').select('*'),
        supabase.from('accounts').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('transactions').select('*').order('payment_date', { ascending: false }),
      ])

      if (comps.data) setCompanies(comps.data.map((c) => ({ id: c.id, name: c.name })))
      if (accs.data)
        setAccounts(
          accs.data.map((a) => ({
            id: a.id,
            companyId: a.company_id,
            name: a.name,
            initialBalance: Number(a.initial_balance),
          })),
        )
      if (cats.data)
        setCategories(
          cats.data.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type as any,
          })),
        )
      if (txs.data) {
        setTransactions(
          txs.data.map((t) => ({
            id: t.id,
            competenceDate: t.competence_date,
            paymentDate: t.payment_date,
            companyId: t.company_id,
            accountId: t.account_id,
            categoryId: t.category_id,
            description: t.description,
            nfNumber: t.nf_number || undefined,
            value: Number(t.value),
            type: t.type as TransactionType,
            status: t.status as any,
            aiConfidence: t.ai_confidence as any,
          })),
        )
      }
    }

    fetchData()
  }, [session])

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchCompany = filters.companyId === 'all' || t.companyId === filters.companyId
        const matchAccount = filters.accountId === 'all' || t.accountId === filters.accountId
        const date = new Date(t.paymentDate)
        const matchDate = isWithinInterval(date, {
          start: filters.dateRange.from,
          end: filters.dateRange.to,
        })
        return matchCompany && matchAccount && matchDate
      })
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
  }, [transactions, filters])

  const pendingTransactions = useMemo(() => {
    return transactions.filter((t) => t.status === 'PENDING')
  }, [transactions])

  const summary = useMemo(() => {
    let revenue = 0
    let expenses = 0
    filteredTransactions.forEach((t) => {
      if (t.type === 'IN') revenue += t.value
      else expenses += t.value
    })

    const initialBal = accounts.reduce((acc, a) => {
      if (filters.accountId !== 'all' && a.id !== filters.accountId) return acc
      if (filters.companyId !== 'all' && a.companyId !== filters.companyId) return acc
      return acc + a.initialBalance
    }, 0)

    const balance = initialBal + revenue - expenses
    const net = revenue - expenses

    return { balance, revenue, expenses, net }
  }, [filteredTransactions, accounts, filters])

  const addTransaction = useCallback(async (t: Transaction) => {
    const newTx = { ...t, id: t.id || Math.random().toString(36).substring(7) }
    setTransactions((prev) => [newTx, ...prev])

    const { data } = await supabase
      .from('transactions')
      .insert({
        competence_date: t.competenceDate,
        payment_date: t.paymentDate,
        company_id: t.companyId,
        account_id: t.accountId,
        category_id: t.categoryId,
        description: t.description,
        nf_number: t.nfNumber,
        value: t.value,
        type: t.type,
        status: t.status,
        ai_confidence: t.aiConfidence,
      })
      .select()
      .single()

    if (data) {
      setTransactions((prev) =>
        prev.map((pt) => (pt.id === newTx.id ? { ...newTx, id: data.id } : pt)),
      )
    }
  }, [])

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))

    const payload: any = {}
    if (updates.competenceDate) payload.competence_date = updates.competenceDate
    if (updates.paymentDate) payload.payment_date = updates.paymentDate
    if (updates.companyId) payload.company_id = updates.companyId
    if (updates.accountId) payload.account_id = updates.accountId
    if (updates.categoryId) payload.category_id = updates.categoryId
    if (updates.description) payload.description = updates.description
    if (updates.nfNumber !== undefined) payload.nf_number = updates.nfNumber
    if (updates.value !== undefined) payload.value = updates.value
    if (updates.type) payload.type = updates.type
    if (updates.status) payload.status = updates.status
    if (updates.aiConfidence !== undefined) payload.ai_confidence = updates.aiConfidence

    await supabase.from('transactions').update(payload).eq('id', id)
  }, [])

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    await supabase.from('transactions').delete().eq('id', id)
  }, [])

  const addCategory = useCallback(async (c: Category) => {
    setCategories((prev) => [...prev, c])
    const { data } = await supabase
      .from('categories')
      .insert({
        name: c.name,
        type: c.type,
      })
      .select()
      .single()
    if (data) {
      setCategories((prev) => prev.map((pc) => (pc.id === c.id ? { ...pc, id: data.id } : pc)))
    }
  }, [])

  const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))

    const payload: any = {}
    if (updates.initialBalance !== undefined) payload.initial_balance = updates.initialBalance
    if (updates.name !== undefined) payload.name = updates.name

    await supabase.from('accounts').update(payload).eq('id', id)
  }, [])

  const aiSuggestCategory = useCallback(
    (description: string) => {
      const desc = description.toLowerCase()
      for (const [keyword, catId] of Object.entries(aiDictionary)) {
        if (desc.includes(keyword)) {
          return { categoryId: catId, confidence: 'high' as const }
        }
      }
      const defaultCat = categories.find((c) => c.name.toLowerCase().includes('outras despesas'))
      return {
        categoryId: defaultCat?.id || categories[0]?.id || 'c13',
        confidence: 'low' as const,
      }
    },
    [aiDictionary, categories],
  )

  const learnAiMapping = useCallback((keyword: string, categoryId: string) => {
    setAiDictionary((prev) => ({ ...prev, [keyword.toLowerCase()]: categoryId }))
  }, [])

  return React.createElement(
    FinanceContext.Provider,
    {
      value: {
        transactions,
        categories,
        accounts,
        companies,
        filters,
        setFilters,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateAccount,
        filteredTransactions,
        pendingTransactions,
        summary,
        aiSuggestCategory,
        learnAiMapping,
      },
    },
    children,
  )
}

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (!context) throw new Error('useFinance must be used within FinanceProvider')
  return context
}
