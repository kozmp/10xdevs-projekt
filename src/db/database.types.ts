export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      shops: {
        Row: {
          shop_id: string;
          shopify_domain: string;
          api_key_encrypted: string;
          api_key_iv: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          shop_id?: string;
          shopify_domain: string;
          api_key_encrypted: string;
          api_key_iv: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          shop_id?: string;
          shopify_domain?: string;
          api_key_encrypted?: string;
          api_key_iv?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          shop_id: string;
          shopify_product_id: number;
          name: string;
          sku: string;
          short_description: string | null;
          long_description: string | null;
          status: "published" | "draft";
          metadata: Json;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          shopify_product_id: number;
          name: string;
          sku: string;
          short_description?: string | null;
          long_description?: string | null;
          status: "published" | "draft";
          metadata?: Json;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          shopify_product_id?: number;
          name?: string;
          sku?: string;
          short_description?: string | null;
          long_description?: string | null;
          status?: "published" | "draft";
          metadata?: Json;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["shop_id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["shop_id"];
          },
        ];
      };
      collections: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collections_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["shop_id"];
          },
        ];
      };
      prompt_templates: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          template: string;
          variables: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          name: string;
          template: string;
          variables?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          name?: string;
          template?: string;
          variables?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_templates_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["shop_id"];
          },
        ];
      };
      jobs: {
        Row: {
          id: string;
          shop_id: string;
          status: "pending" | "processing" | "completed" | "failed" | "cancelled";
          style: "professional" | "casual" | "sales-focused";
          language: "pl" | "en";
          total_cost_estimate: number | null;
          publication_mode: "draft" | "published";
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          shop_id: string;
          status?: "pending" | "processing" | "completed" | "failed" | "cancelled";
          style: "professional" | "casual" | "sales-focused";
          language: "pl" | "en";
          total_cost_estimate?: number | null;
          publication_mode?: "draft" | "published";
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          shop_id?: string;
          status?: "pending" | "processing" | "completed" | "failed" | "cancelled";
          style?: "professional" | "casual" | "sales-focused";
          language?: "pl" | "en";
          total_cost_estimate?: number | null;
          publication_mode?: "draft" | "published";
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["shop_id"];
          },
        ];
      };
      api_rate_limits: {
        Row: {
          shop_id: string;
          service_name: string;
          last_request_at: string;
          request_count: number;
        };
        Insert: {
          shop_id: string;
          service_name: string;
          last_request_at: string;
          request_count: number;
        };
        Update: {
          shop_id?: string;
          service_name?: string;
          last_request_at?: string;
          request_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "api_rate_limits_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["shop_id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: number;
          shop_id: string;
          table_name: string;
          record_id: string;
          operation: "insert" | "update" | "delete";
          changed_by: string;
          changed_at: string;
          old_data: Json | null;
          new_data: Json | null;
        };
        Insert: {
          id?: number;
          shop_id: string;
          table_name: string;
          record_id: string;
          operation: "insert" | "update" | "delete";
          changed_by: string;
          changed_at?: string;
          old_data?: Json | null;
          new_data?: Json | null;
        };
        Update: {
          id?: number;
          shop_id?: string;
          table_name?: string;
          record_id?: string;
          operation?: "insert" | "update" | "delete";
          changed_by?: string;
          changed_at?: string;
          old_data?: Json | null;
          new_data?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["shop_id"];
          },
        ];
      };
      product_categories: {
        Row: {
          product_id: string;
          category_id: string;
        };
        Insert: {
          product_id: string;
          category_id: string;
        };
        Update: {
          product_id?: string;
          category_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_categories_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_collections: {
        Row: {
          product_id: string;
          collection_id: string;
        };
        Insert: {
          product_id: string;
          collection_id: string;
        };
        Update: {
          product_id?: string;
          collection_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_collections_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_collections_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
        ];
      };
      job_products: {
        Row: {
          job_id: string;
          product_id: string;
          status: "pending" | "processing" | "completed" | "failed";
          token_usage_details: Json;
          cost: number | null;
          created_at: string;
        };
        Insert: {
          job_id: string;
          product_id: string;
          status?: "pending" | "processing" | "completed" | "failed";
          token_usage_details?: Json;
          cost?: number | null;
          created_at?: string;
        };
        Update: {
          job_id?: string;
          product_id?: string;
          status?: "pending" | "processing" | "completed" | "failed";
          token_usage_details?: Json;
          cost?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_products_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_products_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type PublicSchema = Database[keyof Database];

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
