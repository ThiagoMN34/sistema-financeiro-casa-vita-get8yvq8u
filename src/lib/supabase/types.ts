// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          company_id: string
          created_at: string
          id: string
          initial_balance: number
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          initial_balance?: number
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          initial_balance?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'accounts_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      ai_patterns: {
        Row: {
          category_id: string
          created_at: string
          id: string
          keyword: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          keyword: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          keyword?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_patterns_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      debt_installments: {
        Row: {
          amount: number
          created_at: string
          debt_id: string
          due_date: string
          id: string
          installment_number: number
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          debt_id: string
          due_date: string
          id?: string
          installment_number: number
          status?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          debt_id?: string
          due_date?: string
          id?: string
          installment_number?: number
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'debt_installments_debt_id_fkey'
            columns: ['debt_id']
            isOneToOne: false
            referencedRelation: 'debts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'debt_installments_transaction_id_fkey'
            columns: ['transaction_id']
            isOneToOne: false
            referencedRelation: 'transactions'
            referencedColumns: ['id']
          },
        ]
      }
      debts: {
        Row: {
          company_id: string
          created_at: string
          creditor: string
          description: string
          id: string
          start_date: string
          status: string
          total_amount: number
          total_installments: number
        }
        Insert: {
          company_id: string
          created_at?: string
          creditor: string
          description: string
          id?: string
          start_date: string
          status?: string
          total_amount: number
          total_installments: number
        }
        Update: {
          company_id?: string
          created_at?: string
          creditor?: string
          description?: string
          id?: string
          start_date?: string
          status?: string
          total_amount?: number
          total_installments?: number
        }
        Relationships: [
          {
            foreignKeyName: 'debts_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          date: string
          employee_name: string
          id: string
          status: string
          transaction_id: string | null
          shift_type: string | null
          guest_name: string | null
          reason: string | null
          authorized_by: string | null
          check_in_time: string | null
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          date: string
          employee_name: string
          id?: string
          status?: string
          transaction_id?: string | null
          shift_type?: string | null
          guest_name?: string | null
          reason?: string | null
          authorized_by?: string | null
          check_in_time?: string | null
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          date?: string
          employee_name?: string
          id?: string
          status?: string
          transaction_id?: string | null
          shift_type?: string | null
          guest_name?: string | null
          reason?: string | null
          authorized_by?: string | null
          check_in_time?: string | null
          latitude?: number | null
          longitude?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'shifts_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'shifts_transaction_id_fkey'
            columns: ['transaction_id']
            isOneToOne: false
            referencedRelation: 'transactions'
            referencedColumns: ['id']
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          ai_confidence: string | null
          category_id: string
          company_id: string
          competence_date: string
          created_at: string
          debt_installment_id: string | null
          description: string
          id: string
          nf_number: string | null
          payment_date: string
          status: string
          type: string
          value: number
        }
        Insert: {
          account_id: string
          ai_confidence?: string | null
          category_id: string
          company_id: string
          competence_date: string
          created_at?: string
          debt_installment_id?: string | null
          description: string
          id?: string
          nf_number?: string | null
          payment_date: string
          status: string
          type: string
          value: number
        }
        Update: {
          account_id?: string
          ai_confidence?: string | null
          category_id?: string
          company_id?: string
          competence_date?: string
          created_at?: string
          debt_installment_id?: string | null
          description?: string
          id?: string
          nf_number?: string | null
          payment_date?: string
          status?: string
          type?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_debt_installment_id_fkey'
            columns: ['debt_installment_id']
            isOneToOne: false
            referencedRelation: 'debt_installments'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
