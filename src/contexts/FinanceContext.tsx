import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

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

export interface Shift {
  id: string
  companyId: string
  employeeName: string
  date: string
  amount: number
  status: 'PENDING' | 'AUTHORIZED' | 'PAID'
  transactionId?: string
  shiftType?: string
  guestName?: string
  reason?: string
  authorizedBy?: string
  checkInTime?: string
  latitude?: number
  longitude?: number
}

export interface Employee {
  id: string
  name: string
  active: boolean
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
  shifts: Shift[]
  employees: Employee[]
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  addTransaction: (t: Transaction) => void
  updateTransaction: (id: string, t: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addCategory: (c: Category) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  addDebt: (d: Omit<Debt, 'id'>, installments: Omit<DebtInstallment, 'id' | 'debtId'>[]) => void
  deleteDebt: (id: string) => void
  addShift: (s: Omit<Shift, 'id' | 'transactionId'>) => void
  updateShift: (id: string, s: Partial<Shift>) => void
  deleteShift: (id: string) => void
  payShift: (id: string, accountId: string, categoryId: string) => Promise<void>
  addEmployee: (name: string) => Promise<void>
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>
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
  const { session, profile } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [debtInstallments, setDebtInstallments] = useState<DebtInstallment[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [aiDictionary, setAiDictionary] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!session || !profile) return

    const fetchData = async () => {
      // MANAGER only needs companies, shifts and employees
      if (profile.role === 'MANAGER') {
        const [comps, shiftsRes, empsRes] = await Promise.all([
          supabase.from('companies').select('*'),
          supabase
            .from('shifts' as any)
            .select('*')
            .order('date', { ascending: false }),
          supabase
            .from('employees' as any)
            .select('*')
            .order('name'),
        ])
        if (comps.data) setCompanies(comps.data.map((c) => ({ id: c.id, name: c.name })))
        if (shiftsRes.data) {
          setShifts(
            shiftsRes.data.map((s: any) => ({
              id: s.id,
              companyId: s.company_id,
              employeeName: s.employee_name,
              date: s.date,
              amount: Number(s.amount),
              status: s.status,
              transactionId: s.transaction_id || undefined,
              shiftType: s.shift_type || undefined,
              guestName: s.guest_name || undefined,
              reason: s.reason || undefined,
              authorizedBy: s.authorized_by || undefined,
              checkInTime: s.check_in_time || undefined,
              latitude: s.latitude ? Number(s.latitude) : undefined,
              longitude: s.longitude ? Number(s.longitude) : undefined,
            })),
          )
        }
        if (empsRes.data) {
          setEmployees(
            empsRes.data.map((e: any) => ({
              id: e.id,
              name: e.name,
              active: e.active,
            })),
          )
        }
        return
      }

      // ADMIN fetches everything
      const [comps, accs, cats, txs, patterns, debtsRes, instsRes, shiftsRes, empsRes] =
        await Promise.all([
          supabase.from('companies').select('*'),
          supabase.from('accounts').select('*'),
          supabase.from('categories').select('*'),
          supabase.from('transactions').select('*').order('payment_date', { ascending: false }),
          supabase.from('ai_patterns').select('*'),
          supabase.from('debts').select('*').order('created_at', { ascending: false }),
          supabase.from('debt_installments').select('*').order('due_date', { ascending: true }),
          supabase
            .from('shifts' as any)
            .select('*')
            .order('date', { ascending: false }),
          supabase
            .from('employees' as any)
            .select('*')
            .order('name'),
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
      if (shiftsRes.data) {
        setShifts(
          shiftsRes.data.map((s: any) => ({
            id: s.id,
            companyId: s.company_id,
            employeeName: s.employee_name,
            date: s.date,
            amount: Number(s.amount),
            status: s.status,
            transactionId: s.transaction_id || undefined,
            shiftType: s.shift_type || undefined,
            guestName: s.guest_name || undefined,
            reason: s.reason || undefined,
            authorizedBy: s.authorized_by || undefined,
            checkInTime: s.check_in_time || undefined,
            latitude: s.latitude ? Number(s.latitude) : undefined,
            longitude: s.longitude ? Number(s.longitude) : undefined,
          })),
        )
      }
      if (empsRes.data) {
        setEmployees(
          empsRes.data.map((e: any) => ({
            id: e.id,
            name: e.name,
            active: e.active,
          })),
        )
      }
    }

    fetchData()
  }, [session, profile])

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

  const addShift = useCallback(async (s: Omit<Shift, 'id' | 'transactionId'>) => {
    const tempId = `temp-${Date.now()}`
    const newShift: Shift = { ...s, id: tempId }
    setShifts((prev) => [newShift, ...prev])

    const { data, error } = await supabase
      .from('shifts' as any)
      .insert({
        company_id: s.companyId,
        employee_name: s.employeeName,
        date: s.date,
        amount: s.amount,
        status: s.status,
        shift_type: s.shiftType,
        guest_name: s.guestName,
        reason: s.reason,
        authorized_by: s.authorizedBy,
        check_in_time: s.checkInTime,
        latitude: s.latitude,
        longitude: s.longitude,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create shift:', error)
      toast({
        title: 'Erro ao criar',
        description: 'Não foi possível salvar o novo plantão.',
        variant: 'destructive',
      })
      setShifts((prev) => prev.filter((ps) => ps.id !== tempId)) // Revert
      return
    }

    if (data) {
      setShifts((prev) =>
        prev.map((ps) =>
          ps.id === tempId
            ? {
                id: data.id,
                companyId: data.company_id,
                employeeName: data.employee_name,
                date: data.date,
                amount: Number(data.amount),
                status: data.status,
                transactionId: data.transaction_id || undefined,
                shiftType: data.shift_type || undefined,
                guestName: data.guest_name || undefined,
                reason: data.reason || undefined,
                authorizedBy: data.authorized_by || undefined,
                checkInTime: data.check_in_time || undefined,
                latitude: data.latitude ? Number(data.latitude) : undefined,
                longitude: data.longitude ? Number(data.longitude) : undefined,
              }
            : ps,
        ),
      )
    }
  }, [])

  const updateShift = useCallback(async (id: string, updates: Partial<Shift>) => {
    let originalShift: Shift | undefined
    setShifts((prev) => {
      originalShift = prev.find((s) => s.id === id)
      return prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    })

    const payload: any = {}
    if (updates.companyId !== undefined) payload.company_id = updates.companyId
    if (updates.employeeName !== undefined) payload.employee_name = updates.employeeName
    if (updates.date !== undefined) payload.date = updates.date
    if (updates.amount !== undefined) payload.amount = updates.amount
    if (updates.status !== undefined) payload.status = updates.status
    if (updates.transactionId !== undefined) payload.transaction_id = updates.transactionId
    if (updates.shiftType !== undefined) payload.shift_type = updates.shiftType
    if (updates.guestName !== undefined) payload.guest_name = updates.guestName
    if (updates.reason !== undefined) payload.reason = updates.reason
    if (updates.authorizedBy !== undefined) payload.authorized_by = updates.authorizedBy

    const { error } = await supabase
      .from('shifts' as any)
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error('Failed to update shift:', error)
      toast({
        title: 'Erro ao atualizar',
        description: 'As alterações não foram salvas no banco de dados. Tente novamente.',
        variant: 'destructive',
      })
      if (originalShift) {
        setShifts((prev) => prev.map((s) => (s.id === id ? originalShift! : s)))
      }
    }
  }, [])

  const deleteShift = useCallback(async (id: string) => {
    let originalShift: Shift | undefined
    setShifts((prev) => {
      originalShift = prev.find((s) => s.id === id)
      return prev.filter((s) => s.id !== id)
    })

    const { error } = await supabase
      .from('shifts' as any)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete shift:', error)
      toast({
        title: 'Erro ao excluir',
        description: 'O plantão não pôde ser excluído.',
        variant: 'destructive',
      })
      if (originalShift) {
        setShifts((prev) => [...prev, originalShift!])
      }
    }
  }, [])

  const payShift = useCallback(
    async (shiftId: string, accountId: string, categoryId: string) => {
      const shift = shifts.find((s) => s.id === shiftId)
      if (!shift) return

      // Create transaction
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert({
          competence_date: shift.date,
          payment_date: new Date().toISOString(),
          company_id: shift.companyId,
          account_id: accountId,
          category_id: categoryId,
          description: `Plantão Extra: ${shift.employeeName}`,
          value: shift.amount,
          type: 'OUT',
          status: 'CONFIRMED',
        })
        .select()
        .single()

      if (txError || !txData) {
        console.error('Failed to generate shift payment transaction:', txError)
        toast({
          title: 'Erro no Pagamento',
          description: 'Não foi possível gerar a transação financeira no banco de dados.',
          variant: 'destructive',
        })
        return
      }

      // Add transaction to UI
      const newTx: Transaction = {
        id: txData.id,
        competenceDate: txData.competence_date,
        paymentDate: txData.payment_date,
        companyId: txData.company_id,
        accountId: txData.account_id,
        categoryId: txData.category_id,
        description: txData.description,
        value: Number(txData.value),
        type: txData.type as any,
        status: txData.status as any,
      }
      setTransactions((prev) => [newTx, ...prev])

      // Update shift status
      const { error: shiftError } = await supabase
        .from('shifts' as any)
        .update({ status: 'PAID', transaction_id: txData.id })
        .eq('id', shiftId)

      if (shiftError) {
        console.error('Failed to link payment to shift:', shiftError)
        toast({
          title: 'Aviso',
          description:
            'A transação foi criada, mas não foi possível atualizar o status do plantão. O sistema continuará exibindo como pendente. Entre em contato com o suporte.',
          variant: 'destructive',
        })
        // Update local state anyway to prevent immediate duplicate payments by the user
        setShifts((prev) =>
          prev.map((s) =>
            s.id === shiftId ? { ...s, status: 'PAID', transactionId: txData.id } : s,
          ),
        )
      } else {
        setShifts((prev) =>
          prev.map((s) =>
            s.id === shiftId ? { ...s, status: 'PAID', transactionId: txData.id } : s,
          ),
        )
        toast({
          title: 'Pagamento Efetivado',
          description: 'O plantão foi pago e enviado para o histórico.',
        })
      }
    },
    [shifts],
  )

  const addEmployee = useCallback(async (name: string) => {
    const tempId = `temp-${Date.now()}`
    const newEmp: Employee = { id: tempId, name, active: true }
    setEmployees((prev) => [...prev, newEmp].sort((a, b) => a.name.localeCompare(b.name)))

    const { data } = await supabase
      .from('employees' as any)
      .insert({ name, active: true })
      .select()
      .single()

    if (data) {
      setEmployees((prev) => prev.map((e) => (e.id === tempId ? { ...e, id: data.id } : e)))
    }
  }, [])

  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
    await supabase
      .from('employees' as any)
      .update(updates)
      .eq('id', id)
  }, [])

  const deleteEmployee = useCallback(async (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id))
    await supabase
      .from('employees' as any)
      .delete()
      .eq('id', id)
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
        shifts,
        employees,
        filters,
        setFilters,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateAccount,
        addDebt,
        deleteDebt,
        addShift,
        updateShift,
        deleteShift,
        payShift,
        addEmployee,
        updateEmployee,
        deleteEmployee,
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
