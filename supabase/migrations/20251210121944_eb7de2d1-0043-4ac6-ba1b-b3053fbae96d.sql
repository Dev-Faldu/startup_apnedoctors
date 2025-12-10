-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessments table
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  body_part TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  pain_level INTEGER NOT NULL CHECK (pain_level >= 1 AND pain_level <= 10),
  duration TEXT NOT NULL,
  additional_info TEXT,
  image_url TEXT,
  ai_triage_output JSONB,
  ai_vision_output JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'reviewed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create triage_reports table
CREATE TABLE public.triage_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('GREEN', 'AMBER', 'RED')),
  triage_level INTEGER NOT NULL CHECK (triage_level >= 1 AND triage_level <= 5),
  medical_summary TEXT NOT NULL,
  chief_complaint TEXT,
  possible_conditions JSONB,
  recommendations JSONB,
  red_flags JSONB,
  confidence_score NUMERIC(5,2),
  doctor_reviewed BOOLEAN NOT NULL DEFAULT false,
  doctor_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_reports ENABLE ROW LEVEL SECURITY;

-- Create public read policies for now (will be updated with auth later)
CREATE POLICY "Allow public read on patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Allow public insert on patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on assessments" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on assessments" ON public.assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on assessments" ON public.assessments FOR UPDATE USING (true);
CREATE POLICY "Allow public read on triage_reports" ON public.triage_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert on triage_reports" ON public.triage_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on triage_reports" ON public.triage_reports FOR UPDATE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_assessments_patient_id ON public.assessments(patient_id);
CREATE INDEX idx_assessments_status ON public.assessments(status);
CREATE INDEX idx_assessments_created_at ON public.assessments(created_at DESC);
CREATE INDEX idx_triage_reports_assessment_id ON public.triage_reports(assessment_id);
CREATE INDEX idx_triage_reports_risk_level ON public.triage_reports(risk_level);
CREATE INDEX idx_triage_reports_doctor_reviewed ON public.triage_reports(doctor_reviewed);