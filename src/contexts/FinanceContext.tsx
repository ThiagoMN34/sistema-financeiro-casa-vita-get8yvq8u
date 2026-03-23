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
  debtInstallmentId?: string
}

export interface Debt {
  id: string
  companyId: string
  description: string
  creditor: string
  totalAmount: number
  totalInstallments: number
  startDate: string
  status: 'ACTIVE' | 'COMPLETED'
}

export interface DebtInstallment {
  id: string
  debtId: string
  installmentNumber: number
  dueDate: string
  amount: number
  status: 'PENDING' | 'PAID'
  transactionId?: string
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
  debts: Debt[]
  debtInstallments: DebtInstallment[]
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  addTransaction: (t: Transaction) => void
  updateTransaction: (id: string, t: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addCategory: (c: Category) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  addDebt: (d: Omit<Debt, 'id'>, installments: Omit<DebtInstallment, 'id' | 'debtId'>[]) => void
  deleteDebt: (id: string) => void
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
  const [debts, setDebts] = useState<Debt[]>([])
  const [debtInstallments, setDebtInstallments] = useState<DebtInstallment[]>([])
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [aiDictionary, setAiDictionary] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!session) return

    const fetchData = async () => {
      const [comps, accs, cats, txs, patterns, debtsRes, instsRes] = await Promise.all([
        supabase.from('companies').select('*'),
        supabase.from('accounts').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('transactions').select('*').order('payment_date', { ascending: false }),
        supabase.from('ai_patterns').select('*'),
        supabase.from('debts').select('*').order('created_at', { ascending: false }),
        supabase.from('debt_installments').select('*').order('due_date', { ascending: true }),
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
            debtInstallmentId: t.debt_installment_id || undefined,
          })),
        )
      }
      if (patterns.data) {
        const dict: Record<string, string> = {}
        patterns.data.forEach((p: any) => {
          dict[p.keyword] = p.category_id
        })
        setAiDictionary(dict)
      }
      if (debtsRes.data) {
        setDebts(
          debtsRes.data.map((d: any) => ({
            id: d.id,
            companyId: d.company_id,
            description: d.description,
            creditor: d.creditor,
            totalAmount: Number(d.total_amount),
            totalInstallments: d.total_installments,
            startDate: d.start_date,
            status: d.status,
          })),
        )
      }
      if (instsRes.data) {
        setDebtInstallments(
          instsRes.data.map((i: any) => ({
            id: i.id,
            debtId: i.debt_id,
            installmentNumber: i.installment_number,
            dueDate: i.due_date,
            amount: Number(i.amount),
            status: i.status,
            transactionId: i.transaction_id || undefined,
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

    if (t.debtInstallmentId) {
      setDebtInstallments((prev) =>
        prev.map((i) =>
          i.id === t.debtInstallmentId ? { ...i, status: 'PAID', transactionId: newTx.id } : i,
        ),
      )
    }

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
        debt_installment_id: t.debtInstallmentId || null,
      })
      .select()
      .single()

    if (data) {
      setTransactions((prev) =>
        prev.map((pt) => (pt.id === newTx.id ? { ...newTx, id: data.id } : pt)),
      )
      if (t.debtInstallmentId) {
        setDebtInstallments((prev) =>
          prev.map((i) => (i.id === t.debtInstallmentId ? { ...i, transactionId: data.id } : i)),
        )
      }
    }
  }, [])

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => {
      const oldTx = prev.find((t) => t.id === id)
      if (
        oldTx &&
        updates.debtInstallmentId !== undefined &&
        oldTx.debtInstallmentId !== updates.debtInstallmentId
      ) {
        setDebtInstallments((prevInsts) =>
          prevInsts.map((i) => {
            if (i.id === oldTx.debtInstallmentId)
              return { ...i, status: 'PENDING', transactionId: undefined }
            if (i.id === updates.debtInstallmentId)
              return { ...i, status: 'PAID', transactionId: id }
            return i
          }),
        )
      } else if (updates.debtInstallmentId !== undefined && !oldTx?.debtInstallmentId) {
        setDebtInstallments((prevInsts) =>
          prevInsts.map((i) =>
            i.id === updates.debtInstallmentId ? { ...i, status: 'PAID', transactionId: id } : i,
          ),
        )
      }
      return prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    })

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
    if (updates.debtInstallmentId !== undefined)
      payload.debt_installment_id = updates.debtInstallmentId || null

    await supabase.from('transactions').update(payload).eq('id', id)
  }, [])

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions((prev) => {
      const oldTx = prev.find((t) => t.id === id)
      if (oldTx?.debtInstallmentId) {
        setDebtInstallments((prevInsts) =>
          prevInsts.map((i) =>
            i.id === oldTx.debtInstallmentId
              ? { ...i, status: 'PENDING', transactionId: undefined }
              : i,
          ),
        )
      }
      return prev.filter((t) => t.id !== id)
    })
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

  const addDebt = useCallback(
    async (d: Omit<Debt, 'id'>, installments: Omit<DebtInstallment, 'id' | 'debtId'>[]) => {
      const tempId = `temp-${Date.now()}`
      const newDebt: Debt = { ...d, id: tempId }

      setDebts((prev) => [newDebt, ...prev])

      const { data: debtData } = await supabase
        .from('debts')
        .insert({
          company_id: d.companyId,
          description: d.description,
          creditor: d.creditor,
          total_amount: d.totalAmount,
          total_installments: d.totalInstallments,
          start_date: d.startDate,
          status: d.status,
        })
        .select()
        .single()

      if (debtData) {
        setDebts((prev) => prev.map((p) => (p.id === tempId ? { ...p, id: debtData.id } : p)))

        const { data: instData } = await supabase
          .from('debt_installments')
          .insert(
            installments.map((i) => ({
              debt_id: debtData.id,
              installment_number: i.installmentNumber,
              due_date: i.dueDate,
              amount: i.amount,
              status: i.status,
            })),
          )
          .select()

        if (instData) {
          const newInsts = instData.map((i) => ({
            id: i.id,
            debtId: i.debt_id,
            installmentNumber: i.installment_number,
            dueDate: i.due_date,
            amount: Number(i.amount),
            status: i.status as any,
            transactionId: i.transaction_id || undefined,
          }))
          setDebtInstallments((prev) => [...newInsts, ...prev])
        }
      }
    },
    [],
  )

  const deleteDebt = useCallback(async (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id))
    setDebtInstallments((prev) => prev.filter((i) => i.debtId !== id))
    await supabase.from('debts').delete().eq('id', id)
  }, [])

  const aiSuggestCategory = useCallback(
    (description: string) => {
      const descClean = description
        .toLowerCase()
        .replace(/[0-9]/g, '')
        .replace(/[^\w\sÀ-ÿ]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (!descClean || descClean.length < 3) {
        return { categoryId: categories[0]?.id || 'c13', confidence: 'low' as const }
      }

      const patterns = Object.entries(aiDictionary).sort((a, b) => b[0].length - a[0].length)
      for (const [keyword, catId] of patterns) {
        if (descClean.includes(keyword)) {
          return { categoryId: catId, confidence: 'high' as const }
        }
      }

      const words = descClean.split(' ').filter((w) => w.length > 2)
      if (words.length > 0) {
        let bestMatchCat = null
        let bestScore = 0

        const recentTxs = transactions.slice(0, 500)

        for (const tx of recentTxs) {
          const txDescClean = tx.description
            .toLowerCase()
            .replace(/[0-9]/g, '')
            .replace(/[^\w\sÀ-ÿ]/g, '')
            .replace(/\s+/g, ' ')
            .trim()

          let score = 0
          for (const w of words) {
            if (txDescClean.includes(w)) score++
          }

          const requiredScore = Math.max(1, Math.ceil(words.length * 0.6))
          if (score > bestScore && score >= requiredScore) {
            bestScore = score
            bestMatchCat = tx.categoryId
          }
        }

        if (bestMatchCat) {
          return { categoryId: bestMatchCat, confidence: 'medium' as const }
        }
      }

      const defaultCat = categories.find((c) => c.name.toLowerCase().includes('outras despesas'))
      return {
        categoryId: defaultCat?.id || categories[0]?.id || 'c13',
        confidence: 'low' as const,
      }
    },
    [aiDictionary, transactions, categories],
  )

  const learnAiMapping = useCallback(async (description: string, categoryId: string) => {
    const keyword = description
      .toLowerCase()
      .replace(/[0-9]/g, '')
      .replace(/[^\w\sÀ-ÿ]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (keyword.length < 3) return

    setAiDictionary((prev) => ({ ...prev, [keyword]: categoryId }))

    await supabase
      .from('ai_patterns')
      .upsert({ keyword, category_id: categoryId }, { onConflict: 'keyword' })
  }, [])

  return React.createElement(
    FinanceContext.Provider,
    {
      value: {
        transactions,
        categories,
        accounts,
        companies,
        debts,
        debtInstallments,
        filters,
        setFilters,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateAccount,
        addDebt,
        deleteDebt,
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
