export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          plan: 'free' | 'individual' | 'familiar' | 'premium'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          plan?: 'free' | 'individual' | 'familiar' | 'premium'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          plan?: 'free' | 'individual' | 'familiar' | 'premium'
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          family_id: string | null
          role: 'admin' | 'member' | 'dependent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          family_id?: string | null
          role?: 'admin' | 'member' | 'dependent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          family_id?: string | null
          role?: 'admin' | 'member' | 'dependent'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string | null
          color: string | null
          type: 'expense' | 'income'
          is_default: boolean
          family_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          color?: string | null
          type: 'expense' | 'income'
          is_default?: boolean
          family_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
          color?: string | null
          type?: 'expense' | 'income'
          is_default?: boolean
          family_id?: string | null
          created_at?: string
        }
      }
      subcategories: {
        Row: {
          id: string
          name: string
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          family_id: string
          user_id: string | null
          type: 'expense' | 'income'
          amount: number
          description: string | null
          category_id: string | null
          subcategory_id: string | null
          date: string
          is_recurring: boolean
          recurring_config: Json | null
          parent_transaction_id: string | null
          source: 'chat' | 'ocr' | 'manual' | 'import' | 'email' | 'recurring'
          confidence_score: number | null
          ai_suggested_category: string | null
          user_confirmed: boolean
          receipt_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id?: string | null
          type: 'expense' | 'income'
          amount: number
          description?: string | null
          category_id?: string | null
          subcategory_id?: string | null
          date?: string
          is_recurring?: boolean
          recurring_config?: Json | null
          parent_transaction_id?: string | null
          source?: 'chat' | 'ocr' | 'manual' | 'import' | 'email' | 'recurring'
          confidence_score?: number | null
          ai_suggested_category?: string | null
          user_confirmed?: boolean
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string | null
          type?: 'expense' | 'income'
          amount?: number
          description?: string | null
          category_id?: string | null
          subcategory_id?: string | null
          date?: string
          is_recurring?: boolean
          recurring_config?: Json | null
          parent_transaction_id?: string | null
          source?: 'chat' | 'ocr' | 'manual' | 'import' | 'email' | 'recurring'
          confidence_score?: number | null
          ai_suggested_category?: string | null
          user_confirmed?: boolean
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          family_id: string
          category_id: string
          amount: number
          period: 'weekly' | 'monthly' | 'yearly'
          start_date: string
          end_date: string | null
          alert_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          category_id: string
          amount: number
          period?: 'weekly' | 'monthly' | 'yearly'
          start_date: string
          end_date?: string | null
          alert_threshold?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          category_id?: string
          amount?: number
          period?: 'weekly' | 'monthly' | 'yearly'
          start_date?: string
          end_date?: string | null
          alert_threshold?: number
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          family_id: string
          name: string
          description: string | null
          target_amount: number
          current_amount: number
          deadline: string | null
          category: string | null
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          description?: string | null
          target_amount: number
          current_amount?: number
          deadline?: string | null
          category?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          description?: string | null
          target_amount?: number
          current_amount?: number
          deadline?: string | null
          category?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          family_id: string
          user_id: string | null
          role: 'user' | 'assistant' | 'system'
          content: string
          action_type: string | null
          action_metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id?: string | null
          role: 'user' | 'assistant' | 'system'
          content: string
          action_type?: string | null
          action_metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string | null
          role?: 'user' | 'assistant' | 'system'
          content?: string
          action_type?: string | null
          action_metadata?: Json | null
          created_at?: string
        }
      }
      insights: {
        Row: {
          id: string
          family_id: string
          type: 'alert' | 'suggestion' | 'pattern' | 'achievement'
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high'
          action_label: string | null
          action_data: Json | null
          is_read: boolean
          is_dismissed: boolean
          valid_until: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          type: 'alert' | 'suggestion' | 'pattern' | 'achievement'
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          action_label?: string | null
          action_data?: Json | null
          is_read?: boolean
          is_dismissed?: boolean
          valid_until?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          type?: 'alert' | 'suggestion' | 'pattern' | 'achievement'
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          action_label?: string | null
          action_data?: Json | null
          is_read?: boolean
          is_dismissed?: boolean
          valid_until?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          is_read: boolean
          email_sent: boolean
          email_sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          is_read?: boolean
          email_sent?: boolean
          email_sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          is_read?: boolean
          email_sent?: boolean
          email_sent_at?: string | null
          created_at?: string
        }
      }
      family_settings: {
        Row: {
          id: string
          family_id: string
          weekly_report_enabled: boolean
          weekly_report_day: string
          monthly_report_enabled: boolean
          monthly_report_day: number
          budget_alerts_enabled: boolean
          goal_alerts_enabled: boolean
          insights_enabled: boolean
          timezone: string
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          weekly_report_enabled?: boolean
          weekly_report_day?: string
          monthly_report_enabled?: boolean
          monthly_report_day?: number
          budget_alerts_enabled?: boolean
          goal_alerts_enabled?: boolean
          insights_enabled?: boolean
          timezone?: string
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          weekly_report_enabled?: boolean
          weekly_report_day?: string
          monthly_report_enabled?: boolean
          monthly_report_day?: number
          budget_alerts_enabled?: boolean
          goal_alerts_enabled?: boolean
          insights_enabled?: boolean
          timezone?: string
          currency?: string
          created_at?: string
          updated_at?: string
        }
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
  }
}
