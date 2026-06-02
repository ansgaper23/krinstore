export type Json = | string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: { Row: any; Insert: any; Update: any };
      user_roles: { Row: any; Insert: any; Update: any };
      store_analytics: { Row: any; Insert: any; Update: any };
      store_products: { Row: any; Insert: any; Update: any };
      mayorista_purchases: { Row: any; Insert: any; Update: any };
      stores: { Row: any; Insert: any; Update: any };
      subscriptions: { Row: any; Insert: any; Update: any };
      krincesa_products_cache: { Row: any; Insert: any; Update: any };
      free_plan_tickets: { Row: any; Insert: any; Update: any };
      custom_products: { Row: any; Insert: any; Update: any };
    };
    Views: { [key: string]: any };
    Functions: { [key: string]: any };
    Enums: { [key: string]: any };
  };
}
