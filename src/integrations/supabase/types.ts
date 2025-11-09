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
      daily_predictions: {
        Row: {
          change: number | null
          change_percent: number | null
          confidence: number
          created_at: string
          current_price: number | null
          expected_move: number
          id: string
          mode: string
          reason: string
          symbol: string
          trading_date: string
          updated_at: string
        }
        Insert: {
          change?: number | null
          change_percent?: number | null
          confidence: number
          created_at?: string
          current_price?: number | null
          expected_move: number
          id?: string
          mode: string
          reason: string
          symbol: string
          trading_date: string
          updated_at?: string
        }
        Update: {
          change?: number | null
          change_percent?: number | null
          confidence?: number
          created_at?: string
          current_price?: number | null
          expected_move?: number
          id?: string
          mode?: string
          reason?: string
          symbol?: string
          trading_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      market_holidays: {
        Row: {
          created_at: string
          holiday_date: string
          holiday_name: string
          id: string
        }
        Insert: {
          created_at?: string
          holiday_date: string
          holiday_name: string
          id?: string
        }
        Update: {
          created_at?: string
          holiday_date?: string
          holiday_name?: string
          id?: string
        }
        Relationships: []
      }
      portfolio_stocks: {
        Row: {
          buy_price: number
          created_at: string | null
          current_price: number | null
          id: string
          portfolio_id: string
          profit_loss: number | null
          profit_loss_percentage: number | null
          quantity: number
          stock_name: string | null
          stock_symbol: string
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          buy_price: number
          created_at?: string | null
          current_price?: number | null
          id?: string
          portfolio_id: string
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          quantity: number
          stock_name?: string | null
          stock_symbol: string
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          buy_price?: number
          created_at?: string | null
          current_price?: number | null
          id?: string
          portfolio_id?: string
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          quantity?: number
          stock_name?: string | null
          stock_symbol?: string
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_stocks_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string | null
          id: string
          name: string
          total_value: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string
          total_value?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          total_value?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sell_recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          holding_period: string | null
          id: string
          portfolio_stock_id: string
          predicted_price: number | null
          reason: string | null
          recommendation: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          holding_period?: string | null
          id?: string
          portfolio_stock_id: string
          predicted_price?: number | null
          reason?: string | null
          recommendation: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          holding_period?: string | null
          id?: string
          portfolio_stock_id?: string
          predicted_price?: number | null
          reason?: string | null
          recommendation?: string
        }
        Relationships: [
          {
            foreignKeyName: "sell_recommendations_portfolio_stock_id_fkey"
            columns: ["portfolio_stock_id"]
            isOneToOne: false
            referencedRelation: "portfolio_stocks"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_data: {
        Row: {
          close_price: number | null
          data: string
          high_price: number | null
          id: number
          low_price: number | null
          open_price: number | null
          prediction: string
          sentiment_score: number
          stock_symbol: string | null
          volume: number | null
        }
        Insert: {
          close_price?: number | null
          data: string
          high_price?: number | null
          id?: number
          low_price?: number | null
          open_price?: number | null
          prediction: string
          sentiment_score: number
          stock_symbol?: string | null
          volume?: number | null
        }
        Update: {
          close_price?: number | null
          data?: string
          high_price?: number | null
          id?: number
          low_price?: number | null
          open_price?: number | null
          prediction?: string
          sentiment_score?: number
          stock_symbol?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      Stocks_table: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
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
    Enums: {},
  },
} as const
