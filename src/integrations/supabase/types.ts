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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          name: string
          year: number
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          name: string
          year: number
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          name?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "exams_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          last_study_date: string | null
          streak_days: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_study_date?: string | null
          streak_days?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_study_date?: string | null
          streak_days?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string | null
          difficulty: number | null
          due: string
          elapsed_days: number | null
          id: string
          lapses: number | null
          last_review: string | null
          reps: number | null
          scheduled_days: number | null
          stability: number | null
          state: number | null
          updated_at: string | null
          user_id: string
          word_id: string
        }
        Insert: {
          created_at?: string | null
          difficulty?: number | null
          due?: string
          elapsed_days?: number | null
          id?: string
          lapses?: number | null
          last_review?: string | null
          reps?: number | null
          scheduled_days?: number | null
          stability?: number | null
          state?: number | null
          updated_at?: string | null
          user_id: string
          word_id: string
        }
        Update: {
          created_at?: string | null
          difficulty?: number | null
          due?: string
          elapsed_days?: number | null
          id?: string
          lapses?: number | null
          last_review?: string | null
          reps?: number | null
          scheduled_days?: number | null
          stability?: number | null
          state?: number | null
          updated_at?: string | null
          user_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
          test_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
          test_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string | null
          exam_id: string
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          exam_id: string
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          exam_id?: string
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tests_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      words: {
        Row: {
          audio_url: string | null
          created_at: string | null
          difficulty: number | null
          example: string | null
          id: string
          image_url: string | null
          meaning: string
          part_of_speech: string | null
          pronunciation: string | null
          section_id: string
          sort_order: number | null
          synonyms: string | null
          word: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          difficulty?: number | null
          example?: string | null
          id?: string
          image_url?: string | null
          meaning: string
          part_of_speech?: string | null
          pronunciation?: string | null
          section_id: string
          sort_order?: number | null
          synonyms?: string | null
          word: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          difficulty?: number | null
          example?: string | null
          id?: string
          image_url?: string | null
          meaning?: string
          part_of_speech?: string | null
          pronunciation?: string | null
          section_id?: string
          sort_order?: number | null
          synonyms?: string | null
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "words_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
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
