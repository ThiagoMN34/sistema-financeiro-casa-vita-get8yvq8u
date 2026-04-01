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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
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
      credit_card_transactions: {
        Row: {
          amount: number
          card_id: string
          category_id: string
          created_at: string
          date: string
          description: string
          id: string
          installment_current: number | null
          installment_total: number | null
          invoice_month: string
        }
        Insert: {
          amount: number
          card_id: string
          category_id: string
          created_at?: string
          date: string
          description: string
          id?: string
          installment_current?: number | null
          installment_total?: number | null
          invoice_month: string
        }
        Update: {
          amount?: number
          card_id?: string
          category_id?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          installment_current?: number | null
          installment_total?: number | null
          invoice_month?: string
        }
        Relationships: [
          {
            foreignKeyName: 'credit_card_transactions_card_id_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'credit_cards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'credit_card_transactions_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      credit_cards: {
        Row: {
          closing_day: number
          company_id: string
          created_at: string
          due_day: number
          id: string
          limit_amount: number
          name: string
        }
        Insert: {
          closing_day: number
          company_id: string
          created_at?: string
          due_day: number
          id?: string
          limit_amount?: number
          name: string
        }
        Update: {
          closing_day?: number
          company_id?: string
          created_at?: string
          due_day?: number
          id?: string
          limit_amount?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'credit_cards_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
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
      employees: {
        Row: {
          active: boolean
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          admission_date: string | null
          bank_account_number: string | null
          bank_account_type: string | null
          bank_agency: string | null
          bank_name: string | null
          birth_date: string | null
          cbo: string | null
          cpf: string | null
          created_at: string
          ctps: string | null
          department: string | null
          dismissal_date: string | null
          email: string | null
          emergency_contact1_name: string | null
          emergency_contact1_phone: string | null
          emergency_contact2_name: string | null
          emergency_contact2_phone: string | null
          has_meal_voucher: boolean | null
          has_transport_voucher: boolean | null
          id: string
          name: string
          phone: string | null
          pis: string | null
          rg: string | null
          role: string | null
          transport_voucher_amount: number | null
          work_schedule: string | null
          workplace: string | null
        }
        Insert: {
          active?: boolean
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          admission_date?: string | null
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          birth_date?: string | null
          cbo?: string | null
          cpf?: string | null
          created_at?: string
          ctps?: string | null
          department?: string | null
          dismissal_date?: string | null
          email?: string | null
          emergency_contact1_name?: string | null
          emergency_contact1_phone?: string | null
          emergency_contact2_name?: string | null
          emergency_contact2_phone?: string | null
          has_meal_voucher?: boolean | null
          has_transport_voucher?: boolean | null
          id?: string
          name: string
          phone?: string | null
          pis?: string | null
          rg?: string | null
          role?: string | null
          transport_voucher_amount?: number | null
          work_schedule?: string | null
          workplace?: string | null
        }
        Update: {
          active?: boolean
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          admission_date?: string | null
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          birth_date?: string | null
          cbo?: string | null
          cpf?: string | null
          created_at?: string
          ctps?: string | null
          department?: string | null
          dismissal_date?: string | null
          email?: string | null
          emergency_contact1_name?: string | null
          emergency_contact1_phone?: string | null
          emergency_contact2_name?: string | null
          emergency_contact2_phone?: string | null
          has_meal_voucher?: boolean | null
          has_transport_voucher?: boolean | null
          id?: string
          name?: string
          phone?: string | null
          pis?: string | null
          rg?: string | null
          role?: string | null
          transport_voucher_amount?: number | null
          work_schedule?: string | null
          workplace?: string | null
        }
        Relationships: []
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
      shift_rates: {
        Row: {
          amount: number
          created_at: string
          id: string
          shift_type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          shift_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          shift_type?: string
        }
        Relationships: []
      }
      shift_reasons: {
        Row: {
          created_at: string
          id: string
          reason: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          amount: number
          authorized_by: string | null
          check_in_time: string | null
          company_id: string
          created_at: string
          date: string
          employee_name: string
          guest_name: string | null
          id: string
          latitude: number | null
          longitude: number | null
          reason: string | null
          shift_type: string | null
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount?: number
          authorized_by?: string | null
          check_in_time?: string | null
          company_id: string
          created_at?: string
          date: string
          employee_name: string
          guest_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          reason?: string | null
          shift_type?: string | null
          status?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          authorized_by?: string | null
          check_in_time?: string | null
          company_id?: string
          created_at?: string
          date?: string
          employee_name?: string
          guest_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          reason?: string | null
          shift_type?: string | null
          status?: string
          transaction_id?: string | null
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
          nf_attachment_url: string | null
          nf_number: string | null
          payment_date: string
          pc_attachment_url: string | null
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
          nf_attachment_url?: string | null
          nf_number?: string | null
          payment_date: string
          pc_attachment_url?: string | null
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
          nf_attachment_url?: string | null
          nf_number?: string | null
          payment_date?: string
          pc_attachment_url?: string | null
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: accounts
//   id: text (not null, default: (gen_random_uuid())::text)
//   company_id: text (not null)
//   name: text (not null)
//   initial_balance: numeric (not null, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
// Table: ai_patterns
//   id: uuid (not null, default: gen_random_uuid())
//   keyword: text (not null)
//   category_id: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: audit_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   action: text (not null)
//   entity_type: text (not null)
//   entity_id: text (not null)
//   details: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: categories
//   id: text (not null, default: (gen_random_uuid())::text)
//   name: text (not null)
//   type: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: companies
//   id: text (not null, default: (gen_random_uuid())::text)
//   name: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: credit_card_transactions
//   id: text (not null, default: (gen_random_uuid())::text)
//   card_id: text (not null)
//   date: date (not null)
//   description: text (not null)
//   amount: numeric (not null)
//   category_id: text (not null)
//   installment_current: integer (nullable)
//   installment_total: integer (nullable)
//   invoice_month: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: credit_cards
//   id: text (not null, default: (gen_random_uuid())::text)
//   company_id: text (not null)
//   name: text (not null)
//   closing_day: integer (not null)
//   due_day: integer (not null)
//   limit_amount: numeric (not null, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
// Table: debt_installments
//   id: text (not null, default: (gen_random_uuid())::text)
//   debt_id: text (not null)
//   installment_number: integer (not null)
//   due_date: timestamp with time zone (not null)
//   amount: numeric (not null)
//   status: text (not null, default: 'PENDING'::text)
//   transaction_id: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: debts
//   id: text (not null, default: (gen_random_uuid())::text)
//   company_id: text (not null)
//   description: text (not null)
//   creditor: text (not null)
//   total_amount: numeric (not null)
//   total_installments: integer (not null)
//   start_date: timestamp with time zone (not null)
//   status: text (not null, default: 'ACTIVE'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: employees
//   id: text (not null, default: (gen_random_uuid())::text)
//   name: text (not null)
//   active: boolean (not null, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   role: text (nullable)
//   department: text (nullable)
//   work_schedule: text (nullable)
//   has_transport_voucher: boolean (nullable, default: false)
//   has_meal_voucher: boolean (nullable, default: false)
//   transport_voucher_amount: numeric (nullable, default: 0)
//   bank_name: text (nullable)
//   bank_agency: text (nullable)
//   bank_account_type: text (nullable)
//   bank_account_number: text (nullable)
//   admission_date: date (nullable)
//   workplace: text (nullable)
//   dismissal_date: date (nullable)
//   birth_date: date (nullable)
//   cpf: text (nullable)
//   rg: text (nullable)
//   pis: text (nullable)
//   ctps: text (nullable)
//   cbo: text (nullable)
//   email: text (nullable)
//   address_street: text (nullable)
//   address_neighborhood: text (nullable)
//   address_number: text (nullable)
//   address_complement: text (nullable)
//   address_zip: text (nullable)
//   address_state: text (nullable)
//   address_city: text (nullable)
//   phone: text (nullable)
//   emergency_contact1_name: text (nullable)
//   emergency_contact1_phone: text (nullable)
//   emergency_contact2_name: text (nullable)
//   emergency_contact2_phone: text (nullable)
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   role: text (not null, default: 'MANAGER'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: shift_rates
//   id: uuid (not null, default: gen_random_uuid())
//   shift_type: text (not null)
//   amount: numeric (not null, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
// Table: shift_reasons
//   id: uuid (not null, default: gen_random_uuid())
//   reason: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: shifts
//   id: text (not null, default: (gen_random_uuid())::text)
//   company_id: text (not null)
//   employee_name: text (not null)
//   date: date (not null)
//   amount: numeric (not null, default: 0)
//   status: text (not null, default: 'PENDING'::text)
//   transaction_id: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   shift_type: text (nullable)
//   guest_name: text (nullable)
//   reason: text (nullable)
//   authorized_by: text (nullable)
//   check_in_time: timestamp with time zone (nullable)
//   latitude: numeric (nullable)
//   longitude: numeric (nullable)
// Table: transactions
//   id: text (not null, default: (gen_random_uuid())::text)
//   competence_date: timestamp with time zone (not null)
//   payment_date: timestamp with time zone (not null)
//   company_id: text (not null)
//   account_id: text (not null)
//   category_id: text (not null)
//   description: text (not null)
//   nf_number: text (nullable)
//   value: numeric (not null)
//   type: text (not null)
//   status: text (not null)
//   ai_confidence: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   debt_installment_id: text (nullable)
//   nf_attachment_url: text (nullable)
//   pc_attachment_url: text (nullable)

// --- CONSTRAINTS ---
// Table: accounts
//   FOREIGN KEY accounts_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY accounts_pkey: PRIMARY KEY (id)
// Table: ai_patterns
//   FOREIGN KEY ai_patterns_category_id_fkey: FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
//   UNIQUE ai_patterns_keyword_key: UNIQUE (keyword)
//   PRIMARY KEY ai_patterns_pkey: PRIMARY KEY (id)
// Table: audit_logs
//   PRIMARY KEY audit_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY audit_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: categories
//   PRIMARY KEY categories_pkey: PRIMARY KEY (id)
//   CHECK categories_type_check: CHECK ((type = ANY (ARRAY['IN'::text, 'OUT'::text, 'BOTH'::text])))
// Table: companies
//   PRIMARY KEY companies_pkey: PRIMARY KEY (id)
// Table: credit_card_transactions
//   FOREIGN KEY credit_card_transactions_card_id_fkey: FOREIGN KEY (card_id) REFERENCES credit_cards(id) ON DELETE CASCADE
//   FOREIGN KEY credit_card_transactions_category_id_fkey: FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
//   PRIMARY KEY credit_card_transactions_pkey: PRIMARY KEY (id)
// Table: credit_cards
//   FOREIGN KEY credit_cards_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY credit_cards_pkey: PRIMARY KEY (id)
// Table: debt_installments
//   FOREIGN KEY debt_installments_debt_id_fkey: FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE
//   PRIMARY KEY debt_installments_pkey: PRIMARY KEY (id)
//   CHECK debt_installments_status_check: CHECK ((status = ANY (ARRAY['PENDING'::text, 'PAID'::text])))
//   FOREIGN KEY debt_installments_transaction_id_fkey: FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
// Table: debts
//   FOREIGN KEY debts_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY debts_pkey: PRIMARY KEY (id)
//   CHECK debts_status_check: CHECK ((status = ANY (ARRAY['ACTIVE'::text, 'COMPLETED'::text])))
// Table: employees
//   PRIMARY KEY employees_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   CHECK profiles_role_check: CHECK ((role = ANY (ARRAY['ADMIN'::text, 'MANAGER'::text])))
// Table: shift_rates
//   PRIMARY KEY shift_rates_pkey: PRIMARY KEY (id)
//   UNIQUE shift_rates_shift_type_key: UNIQUE (shift_type)
// Table: shift_reasons
//   PRIMARY KEY shift_reasons_pkey: PRIMARY KEY (id)
//   UNIQUE shift_reasons_reason_key: UNIQUE (reason)
// Table: shifts
//   FOREIGN KEY shifts_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY shifts_pkey: PRIMARY KEY (id)
//   CHECK shifts_status_check: CHECK ((status = ANY (ARRAY['PENDING'::text, 'AUTHORIZED'::text, 'PAID'::text])))
//   FOREIGN KEY shifts_transaction_id_fkey: FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
// Table: transactions
//   FOREIGN KEY transactions_account_id_fkey: FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
//   FOREIGN KEY transactions_category_id_fkey: FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
//   FOREIGN KEY transactions_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY transactions_debt_installment_id_fkey: FOREIGN KEY (debt_installment_id) REFERENCES debt_installments(id) ON DELETE SET NULL
//   PRIMARY KEY transactions_pkey: PRIMARY KEY (id)
//   CHECK transactions_status_check: CHECK ((status = ANY (ARRAY['PENDING'::text, 'AUTHORIZED'::text, 'CONFIRMED'::text])))
//   CHECK transactions_type_check: CHECK ((type = ANY (ARRAY['IN'::text, 'OUT'::text])))

// --- ROW LEVEL SECURITY POLICIES ---
// Table: accounts
//   Policy "admin_all_accounts" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'ADMIN'::text)
// Table: ai_patterns
//   Policy "admin_all_ai_patterns" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'ADMIN'::text)
// Table: audit_logs
//   Policy "admin_all_audit_logs" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'ADMIN'::text)
// Table: categories
//   Policy "admin_all_categories" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'ADMIN'::text)
// Table: companies
//   Policy "admin_all_companies" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'ADMIN'::text)
//   Policy "anon_select_companies" (SELECT, PERMISSIVE) roles={anon,authenticated}
//     USING: true
//   Policy "manager_select_companies" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'MANAGER'::text)
// Table: credit_card_transactions
//   Policy "admin_all_cc_transactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: credit_cards
//   Policy "admin_all_credit_cards" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: debt_installments
//   Policy "admin_all_debt_installments" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'ADMIN'::text)
// Table: debts
//   Policy "admin_all_debts" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'ADMIN'::text)
// Table: employees
//   Policy "auth_all_employees" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: profiles
//   Policy "Users can insert own profile" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (id = auth.uid())
//   Policy "Users can read own profile" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//   Policy "Users can update own profile" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//     WITH CHECK: (id = auth.uid())
//   Policy "admin_all_profiles" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'ADMIN'::text)
// Table: shift_rates
//   Policy "auth_all_shift_rates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: shift_reasons
//   Policy "auth_all_shift_reasons" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: shifts
//   Policy "admin_all_shifts" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'ADMIN'::text)
//   Policy "anon_insert_shifts" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "manager_all_shifts" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'MANAGER'::text)
// Table: transactions
//   Policy "admin_all_transactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'ADMIN'::text)

// --- DATABASE FUNCTIONS ---
// FUNCTION enforce_shift_workflow()
//   CREATE OR REPLACE FUNCTION public.enforce_shift_workflow()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF TG_OP = 'UPDATE' THEN
//       -- Prevent downgrading from PAID to PENDING or AUTHORIZED
//       IF OLD.status = 'PAID' AND NEW.status IN ('PENDING', 'AUTHORIZED') THEN
//         NEW.status = 'PAID';
//       END IF;
//       -- Prevent downgrading from AUTHORIZED to PENDING
//       IF OLD.status = 'AUTHORIZED' AND NEW.status = 'PENDING' THEN
//         NEW.status = 'AUTHORIZED';
//       END IF;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION get_user_role()
//   CREATE OR REPLACE FUNCTION public.get_user_role()
//    RETURNS text
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//     SELECT role FROM public.profiles WHERE id = auth.uid();
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, role)
//     VALUES (NEW.id, NEW.email, CASE WHEN NEW.email = 'thiagomnaves@yahoo.com.br' THEN 'ADMIN' ELSE 'MANAGER' END);
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION log_shift_changes()
//   CREATE OR REPLACE FUNCTION public.log_shift_changes()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_user_id uuid;
//   BEGIN
//     v_user_id := auth.uid();
//
//     IF TG_OP = 'INSERT' THEN
//       INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
//       VALUES (v_user_id, 'INSERT', 'SHIFT', NEW.id, to_jsonb(NEW));
//       RETURN NEW;
//     ELSIF TG_OP = 'UPDATE' THEN
//       -- Check if there are changes to avoid spam
//       IF to_jsonb(OLD) IS DISTINCT FROM to_jsonb(NEW) THEN
//         INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
//         VALUES (v_user_id, 'UPDATE', 'SHIFT', NEW.id, jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
//       END IF;
//       RETURN NEW;
//     ELSIF TG_OP = 'DELETE' THEN
//       INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
//       VALUES (v_user_id, 'DELETE', 'SHIFT', OLD.id, to_jsonb(OLD));
//       RETURN OLD;
//     END IF;
//     RETURN NULL;
//   END;
//   $function$
//
// FUNCTION revert_installment_status()
//   CREATE OR REPLACE FUNCTION public.revert_installment_status()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF OLD.debt_installment_id IS NOT NULL THEN
//       UPDATE public.debt_installments
//       SET status = 'PENDING', transaction_id = NULL
//       WHERE id = OLD.debt_installment_id;
//     END IF;
//     RETURN OLD;
//   END;
//   $function$
//
// FUNCTION update_installment_status()
//   CREATE OR REPLACE FUNCTION public.update_installment_status()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     -- If transaction is updated and the debt_installment_id changed, revert the old one
//     IF TG_OP = 'UPDATE' AND OLD.debt_installment_id IS NOT NULL AND OLD.debt_installment_id IS DISTINCT FROM NEW.debt_installment_id THEN
//       UPDATE public.debt_installments
//       SET status = 'PENDING', transaction_id = NULL
//       WHERE id = OLD.debt_installment_id;
//     END IF;
//
//     -- Update the new one
//     IF NEW.debt_installment_id IS NOT NULL THEN
//       UPDATE public.debt_installments
//       SET status = 'PAID', transaction_id = NEW.id
//       WHERE id = NEW.debt_installment_id;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: shifts
//   enforce_shift_workflow_trigger: CREATE TRIGGER enforce_shift_workflow_trigger BEFORE UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION enforce_shift_workflow()
//   log_shift_changes_trigger: CREATE TRIGGER log_shift_changes_trigger AFTER INSERT OR DELETE OR UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION log_shift_changes()
// Table: transactions
//   on_transaction_deleted_installment: CREATE TRIGGER on_transaction_deleted_installment BEFORE DELETE ON public.transactions FOR EACH ROW EXECUTE FUNCTION revert_installment_status()
//   on_transaction_linked_installment: CREATE TRIGGER on_transaction_linked_installment AFTER INSERT OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_installment_status()

// --- INDEXES ---
// Table: ai_patterns
//   CREATE UNIQUE INDEX ai_patterns_keyword_key ON public.ai_patterns USING btree (keyword)
// Table: shift_rates
//   CREATE UNIQUE INDEX shift_rates_shift_type_key ON public.shift_rates USING btree (shift_type)
// Table: shift_reasons
//   CREATE UNIQUE INDEX shift_reasons_reason_key ON public.shift_reasons USING btree (reason)
