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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      custom_products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          image_url_2: string | null
          is_visible: boolean
          name: string
          original_price: number | null
          price: number
          store_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          image_url_2?: string | null
          is_visible?: boolean
          name: string
          original_price?: number | null
          price?: number
          store_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          image_url_2?: string | null
          is_visible?: boolean
          name?: string
          original_price?: number | null
          price?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      free_plan_tickets: {
        Row: {
          code: string
          created_at: string
          created_by: string
          duration_days: number
          id: string
          notes: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          duration_days?: number
          id?: string
          notes?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          duration_days?: number
          id?: string
          notes?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "free_plan_tickets_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      krincesa_products_cache: {
        Row: {
          category: string | null
          description: string | null
          id: string
          image_url: string | null
          last_synced_at: string
          name: string
          price: number
          raw: Json | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          id: string
          image_url?: string | null
          last_synced_at?: string
          name: string
          price?: number
          raw?: Json | null
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          last_synced_at?: string
          name?: string
          price?: number
          raw?: Json | null
        }
        Relationships: []
      }
      mayorista_purchases: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          purchase_date: string
          user_id: string
          verified: boolean
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          items: Json
          notes: string | null
          payment_method: string
          payment_status: string
          status: string
          store_id: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: string
          payment_status?: string
          status?: string
          store_id: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: string
          payment_status?: string
          status?: string
          store_id?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_mayorista: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_mayorista?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_mayorista?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          product_id: string | null
          store_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          product_id?: string | null
          store_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          product_id?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_analytics_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_products: {
        Row: {
          created_at: string
          custom_description: string | null
          custom_name: string | null
          custom_price: number | null
          display_order: number
          id: string
          image_url_2: string | null
          is_visible: boolean
          original_price: number | null
          product_api_id: string
          store_id: string
        }
        Insert: {
          created_at?: string
          custom_description?: string | null
          custom_name?: string | null
          custom_price?: number | null
          display_order?: number
          id?: string
          image_url_2?: string | null
          is_visible?: boolean
          original_price?: number | null
          product_api_id: string
          store_id: string
        }
        Update: {
          created_at?: string
          custom_description?: string | null
          custom_name?: string | null
          custom_price?: number | null
          display_order?: number
          id?: string
          image_url_2?: string | null
          is_visible?: boolean
          original_price?: number | null
          product_api_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          banner_url: string | null
          button_style: Database["public"]["Enums"]["button_style"]
          checkout_instructions: string | null
          checkout_method: string
          checkout_payment_url: string | null
          checkout_whatsapp: string | null
          created_at: string
          custom_links: Json
          description: string | null
          font_family: string
          id: string
          is_active: boolean
          logo_url: string | null
          primary_color: string
          secondary_color: string | null
          sections: Json
          status: Database["public"]["Enums"]["store_status"]
          store_name: string
          subdomain: string
          template: string
          theme: string
          updated_at: string
          user_id: string
          whatsapp_message_template: string | null
        }
        Insert: {
          banner_url?: string | null
          button_style?: Database["public"]["Enums"]["button_style"]
          checkout_instructions?: string | null
          checkout_method?: string
          checkout_payment_url?: string | null
          checkout_whatsapp?: string | null
          created_at?: string
          custom_links?: Json
          description?: string | null
          font_family?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string | null
          sections?: Json
          status?: Database["public"]["Enums"]["store_status"]
          store_name: string
          subdomain: string
          template?: string
          theme?: string
          updated_at?: string
          user_id: string
          whatsapp_message_template?: string | null
        }
        Update: {
          banner_url?: string | null
          button_style?: Database["public"]["Enums"]["button_style"]
          checkout_instructions?: string | null
          checkout_method?: string
          checkout_payment_url?: string | null
          checkout_whatsapp?: string | null
          created_at?: string
          custom_links?: Json
          description?: string | null
          font_family?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string | null
          sections?: Json
          status?: Database["public"]["Enums"]["store_status"]
          store_name?: string
          subdomain?: string
          template?: string
          theme?: string
          updated_at?: string
          user_id?: string
          whatsapp_message_template?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          grace_until: string | null
          id: string
          last_notified_at: string | null
          next_billing_date: string | null
          payment_method: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          grace_until?: string | null
          id?: string
          last_notified_at?: string | null
          next_billing_date?: string | null
          payment_method?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          grace_until?: string | null
          id?: string
          last_notified_at?: string | null
          next_billing_date?: string | null
          payment_method?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_expired_subscriptions: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_superadmin: { Args: never; Returns: boolean }
      renew_subscription: {
        Args: { months_count: number; sub_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "seller" | "superadmin"
      button_style: "rounded" | "sharp" | "pill"
      store_status: "active" | "suspended" | "grace"
      subscription_plan: "free_mayorista" | "basic" | "pro"
      subscription_status: "active" | "grace" | "suspended" | "cancelled"
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
      app_role: ["seller", "superadmin"],
      button_style: ["rounded", "sharp", "pill"],
      store_status: ["active", "suspended", "grace"],
      subscription_plan: ["free_mayorista", "basic", "pro"],
      subscription_status: ["active", "grace", "suspended", "cancelled"],
    },
  },
} as const
