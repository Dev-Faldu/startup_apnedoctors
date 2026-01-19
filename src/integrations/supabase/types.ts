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
      ai_reasoning_traces: {
        Row: {
          assessment_id: string | null
          confidence_score: number | null
          contributing_rules: string[] | null
          created_at: string
          id: string
          input_data: Json
          model_used: string | null
          output_data: Json
          processing_time_ms: number | null
          trace_type: string
          uncertainty_factors: string[] | null
        }
        Insert: {
          assessment_id?: string | null
          confidence_score?: number | null
          contributing_rules?: string[] | null
          created_at?: string
          id?: string
          input_data: Json
          model_used?: string | null
          output_data: Json
          processing_time_ms?: number | null
          trace_type: string
          uncertainty_factors?: string[] | null
        }
        Update: {
          assessment_id?: string | null
          confidence_score?: number | null
          contributing_rules?: string[] | null
          created_at?: string
          id?: string
          input_data?: Json
          model_used?: string | null
          output_data?: Json
          processing_time_ms?: number | null
          trace_type?: string
          uncertainty_factors?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_reasoning_traces_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_context: {
        Row: {
          allergies: string[] | null
          assessment_id: string | null
          created_at: string
          current_medications: string[] | null
          has_fever: boolean | null
          has_limited_mobility: boolean | null
          has_numbness: boolean | null
          has_previous_injury: boolean | null
          has_recent_trauma: boolean | null
          has_swelling: boolean | null
          id: string
          pain_pattern: string | null
          pain_quality: string | null
          pre_existing_conditions: string[] | null
          previous_injury_details: string | null
          recent_activities: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          assessment_id?: string | null
          created_at?: string
          current_medications?: string[] | null
          has_fever?: boolean | null
          has_limited_mobility?: boolean | null
          has_numbness?: boolean | null
          has_previous_injury?: boolean | null
          has_recent_trauma?: boolean | null
          has_swelling?: boolean | null
          id?: string
          pain_pattern?: string | null
          pain_quality?: string | null
          pre_existing_conditions?: string[] | null
          previous_injury_details?: string | null
          recent_activities?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          assessment_id?: string | null
          created_at?: string
          current_medications?: string[] | null
          has_fever?: boolean | null
          has_limited_mobility?: boolean | null
          has_numbness?: boolean | null
          has_previous_injury?: boolean | null
          has_recent_trauma?: boolean | null
          has_swelling?: boolean | null
          id?: string
          pain_pattern?: string | null
          pain_quality?: string | null
          pre_existing_conditions?: string[] | null
          previous_injury_details?: string | null
          recent_activities?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_context_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: true
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          additional_info: string | null
          ai_triage_output: Json | null
          ai_vision_output: Json | null
          body_part: string
          consent_given: boolean | null
          consent_timestamp: string | null
          context_factors: Json | null
          created_at: string
          duration: string
          emergency_keywords_detected: string[] | null
          id: string
          image_url: string | null
          intake_completed_at: string | null
          normalized_symptoms: Json | null
          pain_level: number
          patient_id: string | null
          session_id: string
          status: string
          symptoms: string
          updated_at: string
          visual_consent_given: boolean | null
          visual_consent_timestamp: string | null
        }
        Insert: {
          additional_info?: string | null
          ai_triage_output?: Json | null
          ai_vision_output?: Json | null
          body_part: string
          consent_given?: boolean | null
          consent_timestamp?: string | null
          context_factors?: Json | null
          created_at?: string
          duration: string
          emergency_keywords_detected?: string[] | null
          id?: string
          image_url?: string | null
          intake_completed_at?: string | null
          normalized_symptoms?: Json | null
          pain_level: number
          patient_id?: string | null
          session_id?: string
          status?: string
          symptoms: string
          updated_at?: string
          visual_consent_given?: boolean | null
          visual_consent_timestamp?: string | null
        }
        Update: {
          additional_info?: string | null
          ai_triage_output?: Json | null
          ai_vision_output?: Json | null
          body_part?: string
          consent_given?: boolean | null
          consent_timestamp?: string | null
          context_factors?: Json | null
          created_at?: string
          duration?: string
          emergency_keywords_detected?: string[] | null
          id?: string
          image_url?: string | null
          intake_completed_at?: string | null
          normalized_symptoms?: Json | null
          pain_level?: number
          patient_id?: string | null
          session_id?: string
          status?: string
          symptoms?: string
          updated_at?: string
          visual_consent_given?: boolean | null
          visual_consent_timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          patient_id: string | null
          started_at: string
          status: string
          summary: string | null
          triage_level: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          patient_id?: string | null
          started_at?: string
          status?: string
          summary?: string | null
          triage_level?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          patient_id?: string | null
          started_at?: string
          status?: string
          summary?: string | null
          triage_level?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      live_transcripts: {
        Row: {
          content: string
          id: string
          role: string
          session_id: string
          timestamp: string
        }
        Insert: {
          content: string
          id?: string
          role: string
          session_id: string
          timestamp?: string
        }
        Update: {
          content?: string
          id?: string
          role?: string
          session_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_transcripts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_vision_detections: {
        Row: {
          confidence: number | null
          detected_at: string
          detection_type: string
          id: string
          location: string | null
          session_id: string
          severity: string | null
        }
        Insert: {
          confidence?: number | null
          detected_at?: string
          detection_type: string
          id?: string
          location?: string | null
          session_id: string
          severity?: string | null
        }
        Update: {
          confidence?: number | null
          detected_at?: string
          detection_type?: string
          id?: string
          location?: string | null
          session_id?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_vision_detections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      risk_flags: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          assessment_id: string | null
          confidence: number | null
          created_at: string
          detected_from: string
          flag_code: string
          flag_description: string
          flag_type: string
          id: string
          requires_escalation: boolean | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          assessment_id?: string | null
          confidence?: number | null
          created_at?: string
          detected_from: string
          flag_code: string
          flag_description: string
          flag_type: string
          id?: string
          requires_escalation?: boolean | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          assessment_id?: string | null
          confidence?: number | null
          created_at?: string
          detected_from?: string
          flag_code?: string
          flag_description?: string
          flag_type?: string
          id?: string
          requires_escalation?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_flags_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_entries: {
        Row: {
          ai_extracted: boolean | null
          assessment_id: string | null
          confidence_score: number | null
          created_at: string
          frequency: string | null
          id: string
          onset_type: string | null
          relieving_factors: string[] | null
          severity: string | null
          symptom_category: string | null
          symptom_normalized: string | null
          symptom_raw: string
          triggers: string[] | null
        }
        Insert: {
          ai_extracted?: boolean | null
          assessment_id?: string | null
          confidence_score?: number | null
          created_at?: string
          frequency?: string | null
          id?: string
          onset_type?: string | null
          relieving_factors?: string[] | null
          severity?: string | null
          symptom_category?: string | null
          symptom_normalized?: string | null
          symptom_raw: string
          triggers?: string[] | null
        }
        Update: {
          ai_extracted?: boolean | null
          assessment_id?: string | null
          confidence_score?: number | null
          created_at?: string
          frequency?: string | null
          id?: string
          onset_type?: string | null
          relieving_factors?: string[] | null
          severity?: string | null
          symptom_category?: string | null
          symptom_normalized?: string | null
          symptom_raw?: string
          triggers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "symptom_entries_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      triage_reports: {
        Row: {
          assessment_id: string
          chief_complaint: string | null
          confidence_score: number | null
          created_at: string
          doctor_notes: string | null
          doctor_reviewed: boolean
          id: string
          medical_summary: string
          possible_conditions: Json | null
          recommendations: Json | null
          red_flags: Json | null
          reviewed_at: string | null
          risk_level: string
          triage_level: number
        }
        Insert: {
          assessment_id: string
          chief_complaint?: string | null
          confidence_score?: number | null
          created_at?: string
          doctor_notes?: string | null
          doctor_reviewed?: boolean
          id?: string
          medical_summary: string
          possible_conditions?: Json | null
          recommendations?: Json | null
          red_flags?: Json | null
          reviewed_at?: string | null
          risk_level: string
          triage_level: number
        }
        Update: {
          assessment_id?: string
          chief_complaint?: string | null
          confidence_score?: number | null
          created_at?: string
          doctor_notes?: string | null
          doctor_reviewed?: boolean
          id?: string
          medical_summary?: string
          possible_conditions?: Json | null
          recommendations?: Json | null
          red_flags?: Json | null
          reviewed_at?: string | null
          risk_level?: string
          triage_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "triage_reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consent_logs: {
        Row: {
          assessment_id: string | null
          consent_given: boolean
          consent_type: string
          created_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          consent_given: boolean
          consent_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          consent_given?: boolean
          consent_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_consent_logs_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      visual_scan_metadata: {
        Row: {
          ai_annotations: Json | null
          assessment_id: string | null
          asymmetry_score: number | null
          body_region_detected: string | null
          color_analysis: Json | null
          created_at: string
          detected_features: Json | null
          id: string
          image_dimensions: Json | null
          image_hash: string | null
          inflammation_indicators: Json | null
          processing_notes: string[] | null
          quality_score: number | null
          scan_timestamp: string
          texture_analysis: Json | null
        }
        Insert: {
          ai_annotations?: Json | null
          assessment_id?: string | null
          asymmetry_score?: number | null
          body_region_detected?: string | null
          color_analysis?: Json | null
          created_at?: string
          detected_features?: Json | null
          id?: string
          image_dimensions?: Json | null
          image_hash?: string | null
          inflammation_indicators?: Json | null
          processing_notes?: string[] | null
          quality_score?: number | null
          scan_timestamp?: string
          texture_analysis?: Json | null
        }
        Update: {
          ai_annotations?: Json | null
          assessment_id?: string | null
          asymmetry_score?: number | null
          body_region_detected?: string | null
          color_analysis?: Json | null
          created_at?: string
          detected_features?: Json | null
          id?: string
          image_dimensions?: Json | null
          image_hash?: string | null
          inflammation_indicators?: Json | null
          processing_notes?: string[] | null
          quality_score?: number | null
          scan_timestamp?: string
          texture_analysis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "visual_scan_metadata_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "doctor" | "patient"
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
      app_role: ["admin", "doctor", "patient"],
    },
  },
} as const
