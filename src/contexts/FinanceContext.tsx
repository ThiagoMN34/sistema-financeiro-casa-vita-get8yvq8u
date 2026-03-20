import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import {
  Transaction,
  Category,
  Account,
  Company,
  MOCK_CATEGORIES,
  MOCK_ACCOUNTS,
  MOCK_COMPANIES,
  MOCK_TRANSACTIONS,
} from '@/data/mockData'
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

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
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS)
  const [companies] = useState<Company[]>(MOCK_COMPANIES)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [aiDictionary, setAiDictionary] = useState<Record<string, string>>({
    neoenergia: 'c4',
    compesa: 'c5',
    limpeza: 'c10',
    atacadão: 'c10',
    folha: 'c8',
    salario: 'c8',
  })

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

  const addTransaction = useCallback((t: Transaction) => {
    setTransactions((prev) => [...prev, t])
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addCategory = useCallback((c: Category) => {
    setCategories((prev) => [...prev, c])
  }, [])

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))
  }, [])

  const aiSuggestCategory = useCallback(
    (description: string) => {
      const desc = description.toLowerCase()
      for (const [keyword, catId] of Object.entries(aiDictionary)) {
        if (desc.includes(keyword)) {
          return { categoryId: catId, confidence: 'high' as const }
        }
      }
      return { categoryId: 'c13', confidence: 'low' as const } // Default / Outros
    },
    [aiDictionary],
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
