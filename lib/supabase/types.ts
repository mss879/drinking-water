/**
 * The database as the app sees it, written to match supabase/migrations. If the schema changes, regenerate with
 *   npx supabase gen types typescript --project-id <project-ref> --schema public > lib/supabase/types.ts
 * and keep the convenience aliases at the bottom.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamp = string;

export type InquiryStatus = "new" | "in_progress" | "resolved" | "spam";
export type InquiryFormType = "buy" | "rental" | "corporate" | "service";
export type StageOutcome = "open" | "won" | "lost";
export type LeadSourceKind = "website" | "manual" | "phone" | "whatsapp" | "referral" | "walk_in" | "event" | "other";
export type LeadPriority = "low" | "medium" | "high";
export type ActivityKind = "created" | "note" | "stage_change" | "call" | "email" | "whatsapp" | "meeting";
export type AnalyticsChannel = "direct" | "organic" | "social" | "referral" | "email" | "paid" | "ai";
export type PostStatus = "draft" | "published";
export type PartCategoryId = "filters" | "spare-parts" | "accessories";
export type SettingsKey = "contact" | "social" | "photos" | "amc";

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: { user_id: string; email: string; created_at: Timestamp };
        Insert: { user_id: string; email: string; created_at?: Timestamp };
        Update: { user_id?: string; email?: string; created_at?: Timestamp };
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          reference: string;
          form_type: InquiryFormType;
          status: InquiryStatus;
          read_at: Timestamp | null;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          location: string | null;
          message: string | null;
          details: Json;
          page_path: string | null;
          referrer: string | null;
          utm: Json | null;
          visitor_id: string | null;
          session_id: string | null;
          admin_notes: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          reference: string;
          form_type: InquiryFormType;
          status?: InquiryStatus;
          read_at?: Timestamp | null;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          location?: string | null;
          message?: string | null;
          details?: Json;
          page_path?: string | null;
          referrer?: string | null;
          utm?: Json | null;
          visitor_id?: string | null;
          session_id?: string | null;
          admin_notes?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
        Relationships: [];
      };
      crm_stages: {
        Row: {
          id: string;
          name: string;
          position: number;
          outcome: StageOutcome;
          is_locked: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          position: number;
          outcome?: StageOutcome;
          is_locked?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["crm_stages"]["Insert"]>;
        Relationships: [];
      };
      crm_leads: {
        Row: {
          id: string;
          stage_id: string;
          position: number;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          location: string | null;
          interest: string | null;
          source: LeadSourceKind;
          value: number | null;
          priority: LeadPriority;
          follow_up_on: string | null;
          notes: string | null;
          inquiry_id: string | null;
          stage_changed_at: Timestamp;
          closed_at: Timestamp | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          stage_id: string;
          position?: number;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          location?: string | null;
          interest?: string | null;
          source?: LeadSourceKind;
          value?: number | null;
          priority?: LeadPriority;
          follow_up_on?: string | null;
          notes?: string | null;
          inquiry_id?: string | null;
          stage_changed_at?: Timestamp;
          closed_at?: Timestamp | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["crm_leads"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "crm_leads_stage_id_fkey";
            columns: ["stage_id"];
            isOneToOne: false;
            referencedRelation: "crm_stages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_leads_inquiry_id_fkey";
            columns: ["inquiry_id"];
            isOneToOne: true;
            referencedRelation: "inquiries";
            referencedColumns: ["id"];
          },
        ];
      };
      crm_activities: {
        Row: {
          id: string;
          lead_id: string;
          kind: ActivityKind;
          body: string | null;
          meta: Json;
          created_by: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          lead_id: string;
          kind: ActivityKind;
          body?: string | null;
          meta?: Json;
          created_by?: string | null;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["crm_activities"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "crm_activities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "crm_leads";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics_sessions: {
        Row: {
          id: string;
          visitor_id: string;
          started_at: Timestamp;
          last_seen_at: Timestamp;
          entry_path: string;
          exit_path: string;
          pageviews: number;
          engaged_ms: number;
          has_conversion: boolean;
          is_new_visitor: boolean;
          referrer: string | null;
          referrer_host: string | null;
          channel: AnalyticsChannel;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_term: string | null;
          utm_content: string | null;
          country: string | null;
          region: string | null;
          city: string | null;
          geo_source: "header" | "timezone" | null;
          device: "mobile" | "tablet" | "desktop" | null;
          browser: string | null;
          os: string | null;
          language: string | null;
          screen: string | null;
          timezone: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          previous_slugs: string[];
          excerpt: string | null;
          content: Json;
          cover_url: string | null;
          cover_alt: string | null;
          cover_width: number | null;
          cover_height: number | null;
          category: string | null;
          author_name: string;
          status: PostStatus;
          published_at: Timestamp | null;
          featured: boolean;
          seo_title: string | null;
          seo_description: string | null;
          reading_minutes: number;
          created_by: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          title?: string;
          slug: string;
          previous_slugs?: string[];
          excerpt?: string | null;
          content?: Json;
          cover_url?: string | null;
          cover_alt?: string | null;
          cover_width?: number | null;
          cover_height?: number | null;
          category?: string | null;
          author_name?: string;
          status?: PostStatus;
          published_at?: Timestamp | null;
          featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          reading_minutes?: number;
          created_by?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
        Relationships: [];
      };
      cms_products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          family: string;
          tagline: string;
          types: string[];
          variants: Json;
          purification: string;
          temperatures: string[];
          installation: string;
          warranty: string;
          image_url: string | null;
          summary: string;
          highlights: string[];
          features: Json;
          who_for: Json;
          filtration_note: string;
          installation_note: string;
          maintenance_note: string | null;
          published: boolean;
          position: number;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          family?: string;
          tagline?: string;
          types?: string[];
          variants?: Json;
          purification?: string;
          temperatures?: string[];
          installation?: string;
          warranty?: string;
          image_url?: string | null;
          summary?: string;
          highlights?: string[];
          features?: Json;
          who_for?: Json;
          filtration_note?: string;
          installation_note?: string;
          maintenance_note?: string | null;
          published?: boolean;
          position?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["cms_products"]["Insert"]>;
        Relationships: [];
      };
      cms_parts: {
        Row: {
          id: string;
          category: PartCategoryId;
          name: string;
          description: string;
          image_url: string | null;
          price: number | null;
          life_months: number | null;
          published: boolean;
          position: number;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          category: PartCategoryId;
          name: string;
          description?: string;
          image_url?: string | null;
          price?: number | null;
          life_months?: number | null;
          published?: boolean;
          position?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["cms_parts"]["Insert"]>;
        Relationships: [];
      };
      cms_client_logos: {
        Row: {
          id: string;
          name: string;
          image_url: string;
          website_url: string | null;
          published: boolean;
          position: number;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          image_url: string;
          website_url?: string | null;
          published?: boolean;
          position?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["cms_client_logos"]["Insert"]>;
        Relationships: [];
      };
      cms_settings: {
        Row: { key: SettingsKey; value: Json; updated_at: Timestamp };
        Insert: { key: SettingsKey; value: Json; updated_at?: Timestamp };
        Update: { key?: SettingsKey; value?: Json; updated_at?: Timestamp };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      crm_move_lead: {
        Args: { p_lead_id: string; p_stage_id: string; p_before_id?: string | null };
        Returns: undefined;
      };
      crm_set_stage_order: { Args: { p_stage_ids: string[] }; Returns: undefined };
      crm_delete_stage: { Args: { p_stage_id: string; p_move_to?: string | null }; Returns: undefined };
      crm_convert_inquiries: {
        Args: { p_inquiry_ids: string[]; p_interests?: (string | null)[] | null };
        Returns: { inquiry_id: string; lead_id: string }[];
      };
      analytics_ingest: { Args: { p: Json }; Returns: undefined };
      analytics_overview: { Args: { p_from: Timestamp; p_to: Timestamp }; Returns: Json };
      analytics_timeseries: {
        Args: { p_from: Timestamp; p_to: Timestamp; p_bucket?: string; p_tz?: string };
        Returns: { bucket: Timestamp; visitors: number; pageviews: number; sessions: number }[];
      };
      analytics_breakdown: {
        Args: { p_from: Timestamp; p_to: Timestamp; p_dimension: string; p_limit?: number };
        Returns: { label: string; visitors: number; total: number; avg_engaged_ms: number | null }[];
      };
      analytics_events_summary: {
        Args: { p_from: Timestamp; p_to: Timestamp };
        Returns: { name: string; events: number; visitors: number }[];
      };
      analytics_event_breakdown: {
        Args: { p_from: Timestamp; p_to: Timestamp; p_name: string; p_prop: string; p_limit?: number };
        Returns: { label: string; events: number; visitors: number }[];
      };
      analytics_heatmap: {
        Args: { p_from: Timestamp; p_to: Timestamp; p_tz?: string };
        Returns: { weekday: number; hour: number; visitors: number }[];
      };
      analytics_vitals_summary: {
        Args: { p_from: Timestamp; p_to: Timestamp };
        Returns: { name: string; p75: number; good: number; needs_improvement: number; poor: number; samples: number }[];
      };
      analytics_live: { Args: Record<PropertyKey, never>; Returns: Json };
      analytics_purge: { Args: { p_before: Timestamp }; Returns: number };
      dashboard_summary: { Args: { p_from: Timestamp; p_to: Timestamp; p_tz?: string }; Returns: Json };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type Tables = Database["public"]["Tables"];
export type Inquiry = Tables["inquiries"]["Row"];
export type Stage = Tables["crm_stages"]["Row"];
export type Lead = Tables["crm_leads"]["Row"];
export type Activity = Tables["crm_activities"]["Row"];
export type BlogPost = Tables["blog_posts"]["Row"];
export type AnalyticsSession = Tables["analytics_sessions"]["Row"];
export type ProductRow = Tables["cms_products"]["Row"];
export type PartRow = Tables["cms_parts"]["Row"];
export type ClientLogoRow = Tables["cms_client_logos"]["Row"];
