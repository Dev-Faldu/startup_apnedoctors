-- ========================================
-- ApneDoctors Security Migration
-- Implements authentication and proper RLS
-- ========================================

-- 1. Create role enum for user types
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');

-- 2. Create user_roles table (roles must be in separate table)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors/Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- 7. Trigger to auto-create profile and assign patient role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Assign default patient role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- UPDATE EXISTING TABLES RLS POLICIES
-- ========================================

-- 8. Drop all existing public policies on patients
DROP POLICY IF EXISTS "Allow public read on patients" ON public.patients;
DROP POLICY IF EXISTS "Allow public insert on patients" ON public.patients;

-- New patients policies (linked to auth.uid)
CREATE POLICY "Users can view own patient record"
  ON public.patients FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own patient record"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own patient record"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors can view all patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- 9. Drop all existing public policies on assessments
DROP POLICY IF EXISTS "Allow public read on assessments" ON public.assessments;
DROP POLICY IF EXISTS "Allow public insert on assessments" ON public.assessments;
DROP POLICY IF EXISTS "Allow public update on assessments" ON public.assessments;

-- New assessments policies
CREATE POLICY "Users can view own assessments"
  ON public.assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert own assessments"
  ON public.assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update own assessments"
  ON public.assessments FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view all assessments"
  ON public.assessments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can update all assessments"
  ON public.assessments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- 10. Drop all existing public policies on triage_reports
DROP POLICY IF EXISTS "Allow public read on triage_reports" ON public.triage_reports;
DROP POLICY IF EXISTS "Allow public insert on triage_reports" ON public.triage_reports;
DROP POLICY IF EXISTS "Allow public update on triage_reports" ON public.triage_reports;

-- New triage_reports policies
CREATE POLICY "Users can view own triage reports"
  ON public.triage_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE assessments.id = triage_reports.assessment_id
      AND assessments.patient_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated can insert triage reports"
  ON public.triage_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE assessments.id = triage_reports.assessment_id
      AND assessments.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view all triage reports"
  ON public.triage_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can update all triage reports"
  ON public.triage_reports FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- 11. Drop all existing public policies on live_sessions
DROP POLICY IF EXISTS "Allow public read on live_sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Allow public insert on live_sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Allow public update on live_sessions" ON public.live_sessions;

-- New live_sessions policies
CREATE POLICY "Users can view own live sessions"
  ON public.live_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert own live sessions"
  ON public.live_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update own live sessions"
  ON public.live_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view all live sessions"
  ON public.live_sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- 12. Drop all existing public policies on live_transcripts
DROP POLICY IF EXISTS "Allow public read on live_transcripts" ON public.live_transcripts;
DROP POLICY IF EXISTS "Allow public insert on live_transcripts" ON public.live_transcripts;

-- New live_transcripts policies
CREATE POLICY "Users can view own transcripts"
  ON public.live_transcripts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.live_sessions
      WHERE live_sessions.id = live_transcripts.session_id
      AND live_sessions.patient_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transcripts"
  ON public.live_transcripts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.live_sessions
      WHERE live_sessions.id = live_transcripts.session_id
      AND live_sessions.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view all transcripts"
  ON public.live_transcripts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- 13. Drop all existing public policies on live_vision_detections
DROP POLICY IF EXISTS "Allow public read on live_vision_detections" ON public.live_vision_detections;
DROP POLICY IF EXISTS "Allow public insert on live_vision_detections" ON public.live_vision_detections;

-- New live_vision_detections policies
CREATE POLICY "Users can view own vision detections"
  ON public.live_vision_detections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.live_sessions
      WHERE live_sessions.id = live_vision_detections.session_id
      AND live_sessions.patient_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own vision detections"
  ON public.live_vision_detections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.live_sessions
      WHERE live_sessions.id = live_vision_detections.session_id
      AND live_sessions.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view all vision detections"
  ON public.live_vision_detections FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- 14. Create updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();