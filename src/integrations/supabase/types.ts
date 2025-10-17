export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      arbitration_cases: {
        Row: {
          arbitrator_id: string | null
          company_id: string
          created_at: string | null
          description: string
          evidence_ipfs_hash: string | null
          filed_at: string | null
          filed_by: string
          id: string
          respondent_id: string | null
          ruling: string | null
          ruling_issued_at: string | null
          status: Database["public"]["Enums"]["arbitration_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          arbitrator_id?: string | null
          company_id: string
          created_at?: string | null
          description: string
          evidence_ipfs_hash?: string | null
          filed_at?: string | null
          filed_by: string
          id?: string
          respondent_id?: string | null
          ruling?: string | null
          ruling_issued_at?: string | null
          status?: Database["public"]["Enums"]["arbitration_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          arbitrator_id?: string | null
          company_id?: string
          created_at?: string | null
          description?: string
          evidence_ipfs_hash?: string | null
          filed_at?: string | null
          filed_by?: string
          id?: string
          respondent_id?: string | null
          ruling?: string | null
          ruling_issued_at?: string | null
          status?: Database["public"]["Enums"]["arbitration_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arbitration_cases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          company_type: string
          created_at: string | null
          description: string | null
          formation_date: string | null
          id: string
          jurisdiction: string | null
          logo_url: string | null
          name: string
          status: Database["public"]["Enums"]["company_status"] | null
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          company_type: string
          created_at?: string | null
          description?: string | null
          formation_date?: string | null
          id?: string
          jurisdiction?: string | null
          logo_url?: string | null
          name: string
          status?: Database["public"]["Enums"]["company_status"] | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          company_type?: string
          created_at?: string | null
          description?: string | null
          formation_date?: string | null
          id?: string
          jurisdiction?: string | null
          logo_url?: string | null
          name?: string
          status?: Database["public"]["Enums"]["company_status"] | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      company_applications: {
        Row: {
          applicant_id: string
          application_status: string | null
          application_type: string
          approved_at: string | null
          business_description: string | null
          company_id: string | null
          company_name: string
          company_type: string
          completed_at: string | null
          created_at: string | null
          documents_uploaded: Json | null
          id: string
          jurisdiction: string
          kyc_status: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          rejection_reason: string | null
          service_provider_id: string | null
          shareholders_info: Json
          submitted_at: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          applicant_id: string
          application_status?: string | null
          application_type: string
          approved_at?: string | null
          business_description?: string | null
          company_id?: string | null
          company_name: string
          company_type: string
          completed_at?: string | null
          created_at?: string | null
          documents_uploaded?: Json | null
          id?: string
          jurisdiction: string
          kyc_status?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          rejection_reason?: string | null
          service_provider_id?: string | null
          shareholders_info?: Json
          submitted_at?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string
          application_status?: string | null
          application_type?: string
          approved_at?: string | null
          business_description?: string | null
          company_id?: string | null
          company_name?: string
          company_type?: string
          completed_at?: string | null
          created_at?: string | null
          documents_uploaded?: Json | null
          id?: string
          jurisdiction?: string
          kyc_status?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          rejection_reason?: string | null
          service_provider_id?: string | null
          shareholders_info?: Json
          submitted_at?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_applications_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_documents: {
        Row: {
          case_id: string
          description: string | null
          file_name: string
          file_url: string
          id: string
          ipfs_hash: string | null
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          case_id: string
          description?: string | null
          file_name: string
          file_url: string
          id?: string
          ipfs_hash?: string | null
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          case_id?: string
          description?: string | null
          file_name?: string
          file_url?: string
          id?: string
          ipfs_hash?: string | null
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "arbitration_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          approval_threshold: number | null
          company_id: string
          contract_address: string | null
          created_at: string | null
          created_by: string
          description: string
          id: string
          ipfs_hash: string | null
          proposal_type: string
          quorum_required: number | null
          status: Database["public"]["Enums"]["proposal_status"] | null
          title: string
          updated_at: string | null
          voting_ends_at: string | null
          voting_starts_at: string | null
        }
        Insert: {
          approval_threshold?: number | null
          company_id: string
          contract_address?: string | null
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          ipfs_hash?: string | null
          proposal_type: string
          quorum_required?: number | null
          status?: Database["public"]["Enums"]["proposal_status"] | null
          title: string
          updated_at?: string | null
          voting_ends_at?: string | null
          voting_starts_at?: string | null
        }
        Update: {
          approval_threshold?: number | null
          company_id?: string
          contract_address?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          ipfs_hash?: string | null
          proposal_type?: string
          quorum_required?: number | null
          status?: Database["public"]["Enums"]["proposal_status"] | null
          title?: string
          updated_at?: string | null
          voting_ends_at?: string | null
          voting_starts_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          api_endpoint: string | null
          api_key_hash: string | null
          contact_email: string
          contact_phone: string | null
          country: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          name: string
          pricing: Json | null
          rating: number | null
          services_offered: string[]
          total_companies_formed: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_hash?: string | null
          contact_email: string
          contact_phone?: string | null
          country: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          pricing?: Json | null
          rating?: number | null
          services_offered?: string[]
          total_companies_formed?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_hash?: string | null
          contact_email?: string
          contact_phone?: string | null
          country?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          pricing?: Json | null
          rating?: number | null
          services_offered?: string[]
          total_companies_formed?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      shareholders: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["shareholder_role"] | null
          share_count: number
          user_id: string
          voting_power: number
          wallet_address: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["shareholder_role"] | null
          share_count?: number
          user_id: string
          voting_power?: number
          wallet_address: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["shareholder_role"] | null
          share_count?: number
          user_id?: string
          voting_power?: number
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "shareholders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          choice: Database["public"]["Enums"]["vote_choice"]
          id: string
          proposal_id: string
          signature: string | null
          voted_at: string | null
          voter_id: string
          voting_power: number
        }
        Insert: {
          choice: Database["public"]["Enums"]["vote_choice"]
          id?: string
          proposal_id: string
          signature?: string | null
          voted_at?: string | null
          voter_id: string
          voting_power: number
        }
        Update: {
          choice?: Database["public"]["Enums"]["vote_choice"]
          id?: string
          proposal_id?: string
          signature?: string | null
          voted_at?: string | null
          voter_id?: string
          voting_power?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_companies: {
        Args: { _user_id: string }
        Returns: string[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member" | "viewer"
      arbitration_status:
        | "filed"
        | "under_review"
        | "hearing"
        | "ruling_issued"
        | "closed"
      company_status: "pending" | "active" | "suspended" | "dissolved"
      proposal_status: "draft" | "active" | "passed" | "rejected" | "executed"
      shareholder_role: "founder" | "investor" | "employee" | "advisor"
      vote_choice: "for" | "against" | "abstain"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member", "viewer"],
      arbitration_status: [
        "filed",
        "under_review",
        "hearing",
        "ruling_issued",
        "closed",
      ],
      company_status: ["pending", "active", "suspended", "dissolved"],
      proposal_status: ["draft", "active", "passed", "rejected", "executed"],
      shareholder_role: ["founder", "investor", "employee", "advisor"],
      vote_choice: ["for", "against", "abstain"],
    },
  },
} as const
