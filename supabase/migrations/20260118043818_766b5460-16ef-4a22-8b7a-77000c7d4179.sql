-- =====================================================
-- CLINICAL-GRADE ASSESSMENT SCHEMA FOR APNEDOCTORS
-- Hospital-ready, auditable, regulation-compliant
-- =====================================================

-- Add new columns to assessments for enhanced tracking
ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS visual_consent_given BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS visual_consent_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS emergency_keywords_detected TEXT[],
ADD COLUMN IF NOT EXISTS normalized_symptoms JSONB,
ADD COLUMN IF NOT EXISTS context_factors JSONB,
ADD COLUMN IF NOT EXISTS intake_completed_at TIMESTAMPTZ;

-- Create AI Reasoning Trace table for explainability
CREATE TABLE IF NOT EXISTS public.ai_reasoning_traces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  trace_type TEXT NOT NULL CHECK (trace_type IN ('symptom_normalization', 'risk_detection', 'triage_logic', 'vision_analysis', 'report_generation')),
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  model_used TEXT,
  confidence_score NUMERIC(5,2),
  uncertainty_factors TEXT[],
  contributing_rules TEXT[],
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Risk Flags table for clinical safety
CREATE TABLE IF NOT EXISTS public.risk_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('emergency', 'urgent', 'warning', 'caution', 'info')),
  flag_code TEXT NOT NULL,
  flag_description TEXT NOT NULL,
  detected_from TEXT NOT NULL,
  confidence NUMERIC(5,2),
  requires_escalation BOOLEAN DEFAULT false,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create User Consent Log for audit trail
CREATE TABLE IF NOT EXISTS public.user_consent_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('terms', 'data_processing', 'visual_scan', 'ai_assessment', 'data_sharing')),
  consent_given BOOLEAN NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Symptom Entries table for structured intake
CREATE TABLE IF NOT EXISTS public.symptom_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  symptom_raw TEXT NOT NULL,
  symptom_normalized TEXT,
  symptom_category TEXT,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
  onset_type TEXT CHECK (onset_type IN ('sudden', 'gradual', 'unknown')),
  frequency TEXT,
  triggers TEXT[],
  relieving_factors TEXT[],
  ai_extracted BOOLEAN DEFAULT false,
  confidence_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Visual Scan Metadata table
CREATE TABLE IF NOT EXISTS public.visual_scan_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  scan_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  image_hash TEXT,
  image_dimensions JSONB,
  body_region_detected TEXT,
  detected_features JSONB,
  inflammation_indicators JSONB,
  asymmetry_score NUMERIC(5,2),
  color_analysis JSONB,
  texture_analysis JSONB,
  ai_annotations JSONB,
  quality_score NUMERIC(5,2),
  processing_notes TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Assessment Context table
CREATE TABLE IF NOT EXISTS public.assessment_context (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE UNIQUE,
  has_recent_trauma BOOLEAN,
  has_fever BOOLEAN,
  has_swelling BOOLEAN,
  has_numbness BOOLEAN,
  has_limited_mobility BOOLEAN,
  has_previous_injury BOOLEAN,
  previous_injury_details TEXT,
  current_medications TEXT[],
  allergies TEXT[],
  pre_existing_conditions TEXT[],
  recent_activities TEXT,
  pain_pattern TEXT CHECK (pain_pattern IN ('constant', 'intermittent', 'activity_related', 'rest_related', 'variable')),
  pain_quality TEXT CHECK (pain_quality IN ('sharp', 'dull', 'burning', 'throbbing', 'aching', 'stabbing', 'radiating', 'cramping')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.ai_reasoning_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_scan_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_reasoning_traces (using assessments.patient_id = auth.uid())
CREATE POLICY "Users can view their own AI reasoning traces"
  ON public.ai_reasoning_traces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = ai_reasoning_traces.assessment_id
      AND a.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view all AI reasoning traces"
  ON public.ai_reasoning_traces FOR SELECT
  USING (public.has_role(auth.uid(), 'doctor'));

-- RLS Policies for risk_flags
CREATE POLICY "Users can view their own risk flags"
  ON public.risk_flags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = risk_flags.assessment_id
      AND a.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view all risk flags"
  ON public.risk_flags FOR SELECT
  USING (public.has_role(auth.uid(), 'doctor'));

-- RLS Policies for user_consent_logs
CREATE POLICY "Users can view their own consent logs"
  ON public.user_consent_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent logs"
  ON public.user_consent_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for symptom_entries
CREATE POLICY "Users can view their own symptom entries"
  ON public.symptom_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = symptom_entries.assessment_id
      AND a.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view all symptom entries"
  ON public.symptom_entries FOR SELECT
  USING (public.has_role(auth.uid(), 'doctor'));

-- RLS Policies for visual_scan_metadata
CREATE POLICY "Users can view their own visual scan metadata"
  ON public.visual_scan_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = visual_scan_metadata.assessment_id
      AND a.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view all visual scan metadata"
  ON public.visual_scan_metadata FOR SELECT
  USING (public.has_role(auth.uid(), 'doctor'));

-- RLS Policies for assessment_context
CREATE POLICY "Users can view their own assessment context"
  ON public.assessment_context FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_context.assessment_id
      AND a.patient_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own assessment context"
  ON public.assessment_context FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_context.assessment_id
      AND a.patient_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own assessment context"
  ON public.assessment_context FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_context.assessment_id
      AND a.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view all assessment context"
  ON public.assessment_context FOR SELECT
  USING (public.has_role(auth.uid(), 'doctor'));

-- Trigger for assessment_context updated_at
CREATE OR REPLACE TRIGGER update_assessment_context_updated_at
  BEFORE UPDATE ON public.assessment_context
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_reasoning_traces_assessment ON public.ai_reasoning_traces(assessment_id);
CREATE INDEX IF NOT EXISTS idx_ai_reasoning_traces_type ON public.ai_reasoning_traces(trace_type);
CREATE INDEX IF NOT EXISTS idx_risk_flags_assessment ON public.risk_flags(assessment_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_type ON public.risk_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_symptom_entries_assessment ON public.symptom_entries(assessment_id);
CREATE INDEX IF NOT EXISTS idx_visual_scan_metadata_assessment ON public.visual_scan_metadata(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_context_assessment ON public.assessment_context(assessment_id);
CREATE INDEX IF NOT EXISTS idx_user_consent_logs_user ON public.user_consent_logs(user_id);

-- Enable realtime for risk_flags (for emergency monitoring)
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_flags;