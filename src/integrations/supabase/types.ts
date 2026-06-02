export type Json = | string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          user_id: string
          store_name: string | null
          subdomain: string | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          font_family: string | null
          button_style: "rounded" | "sharp" | "pill" | null
          banner_url: string | null
          description: string | null
          template: string | null
          custom_links: Json | null
          is_active: boolean | null
          status: string | null
          created_at: string
          updated_at: string
          sections: Json | null
          theme: string | null
          checkout_method: string | null
          checkout_whatsapp: string | null
          checkout_payment_url: string | null
          checkout_instructions: string | null
          whatsapp_message_template: string | null
        }
        Insert: {
          id?: string
          user_id: string
          store_name?: string | null
          subdomain?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          font_family?: string | null
          button_style?: "rounded" | "sharp" | "pill" | null
          banner_url?: string | null
          description?: string | null
          template?: string | null
          custom_links?: Json | null
          is_active?: boolean | null
          status?: string | null
          created_at?: string
          updated_at?: string
          sections?: Json | null
          theme?: string | null
          checkout_method?: string | null
          checkout_whatsapp?: string | null
          checkout_payment_url?: string | null
          checkout_instructions?: string | null
          whatsapp_message_template?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          store_name?: string | null
          subdomain?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          font_family?: string | null
          button_style?: "rounded" | "sharp" | "pill" | null
          banner_url?: string | null
          description?: string | null
          template?: string | null
          custom_links?: Json | null
          is_active?: boolean | null
          status?: string | null
          created_at?: string
          updated_at?: string
          sections?: Json | null
          theme?: string | null
          checkout_method?: string | null
          checkout_whatsapp?: string | null
          checkout_payment_url?: string | null
          checkout_instructions?: string | null
          whatsapp_message_template?: string | null
        }
      }
      store_products: {
        Row: {
          id: string
          store_id: string
          product_api_id: string
          custom_name: string | null
          custom_price: number | null
          image_url_2: string | null
          is_visible: boolean
          display_order: number
          created_at: string
        }
      }
      custom_products: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          image_url_2: string | null
          category: string | null
          is_visible: boolean
          display_order: number
          created_at: string
        }
      }
      store_analytics: {
        Row: {
          id: string
          store_id: string
          event_type: string
          product_id: string | null
          created_at: string
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
n