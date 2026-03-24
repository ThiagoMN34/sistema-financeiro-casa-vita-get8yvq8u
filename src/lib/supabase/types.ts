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
      [_ in never]: never
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
// Table: categories
//   id: text (not null, default: (gen_random_uuid())::text)
//   name: text (not null)
//   type: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: companies
//   id: text (not null, default: (gen_random_uuid())::text)
//   name: text (not null)
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

// --- CONSTRAINTS ---
// Table: accounts
//   FOREIGN KEY accounts_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY accounts_pkey: PRIMARY KEY (id)
// Table: ai_patterns
//   FOREIGN KEY ai_patterns_category_id_fkey: FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
//   UNIQUE ai_patterns_keyword_key: UNIQUE (keyword)
//   PRIMARY KEY ai_patterns_pkey: PRIMARY KEY (id)
// Table: categories
//   PRIMARY KEY categories_pkey: PRIMARY KEY (id)
//   CHECK categories_type_check: CHECK ((type = ANY (ARRAY['IN'::text, 'OUT'::text, 'BOTH'::text])))
// Table: companies
//   PRIMARY KEY companies_pkey: PRIMARY KEY (id)
// Table: debt_installments
//   FOREIGN KEY debt_installments_debt_id_fkey: FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE
//   PRIMARY KEY debt_installments_pkey: PRIMARY KEY (id)
//   CHECK debt_installments_status_check: CHECK ((status = ANY (ARRAY['PENDING'::text, 'PAID'::text])))
//   FOREIGN KEY debt_installments_transaction_id_fkey: FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
// Table: debts
//   FOREIGN KEY debts_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY debts_pkey: PRIMARY KEY (id)
//   CHECK debts_status_check: CHECK ((status = ANY (ARRAY['ACTIVE'::text, 'COMPLETED'::text])))
// Table: transactions
//   FOREIGN KEY transactions_account_id_fkey: FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
//   FOREIGN KEY transactions_category_id_fkey: FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
//   FOREIGN KEY transactions_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY transactions_debt_installment_id_fkey: FOREIGN KEY (debt_installment_id) REFERENCES debt_installments(id) ON DELETE SET NULL
//   PRIMARY KEY transactions_pkey: PRIMARY KEY (id)
//   CHECK transactions_status_check: CHECK ((status = ANY (ARRAY['PENDING'::text, 'CONFIRMED'::text])))
//   CHECK transactions_type_check: CHECK ((type = ANY (ARRAY['IN'::text, 'OUT'::text])))

// --- ROW LEVEL SECURITY POLICIES ---
// Table: accounts
//   Policy "auth_all_accounts" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: ai_patterns
//   Policy "auth_all_ai_patterns" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: categories
//   Policy "auth_all_categories" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: companies
//   Policy "auth_all_companies" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: debt_installments
//   Policy "auth_all_debt_installments" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: debts
//   Policy "auth_all_debts" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: transactions
//   Policy "auth_all_transactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
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
// Table: transactions
//   on_transaction_deleted_installment: CREATE TRIGGER on_transaction_deleted_installment BEFORE DELETE ON public.transactions FOR EACH ROW EXECUTE FUNCTION revert_installment_status()
//   on_transaction_linked_installment: CREATE TRIGGER on_transaction_linked_installment AFTER INSERT OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_installment_status()

// --- INDEXES ---
// Table: ai_patterns
//   CREATE UNIQUE INDEX ai_patterns_keyword_key ON public.ai_patterns USING btree (keyword)
