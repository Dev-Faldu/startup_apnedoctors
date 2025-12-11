-- Create live_sessions table
CREATE TABLE public.live_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  status TEXT NOT NULL DEFAULT 'active',
  triage_level TEXT DEFAULT 'GREEN',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live_transcripts table
CREATE TABLE public.live_transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live_vision_detections table
CREATE TABLE public.live_vision_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  detection_type TEXT NOT NULL,
  severity TEXT,
  location TEXT,
  confidence NUMERIC,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_vision_detections ENABLE ROW LEVEL SECURITY;

-- Public policies for live_sessions
CREATE POLICY "Allow public insert on live_sessions" ON public.live_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on live_sessions" ON public.live_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public update on live_sessions" ON public.live_sessions FOR UPDATE USING (true);

-- Public policies for live_transcripts
CREATE POLICY "Allow public insert on live_transcripts" ON public.live_transcripts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on live_transcripts" ON public.live_transcripts FOR SELECT USING (true);

-- Public policies for live_vision_detections
CREATE POLICY "Allow public insert on live_vision_detections" ON public.live_vision_detections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on live_vision_detections" ON public.live_vision_detections FOR SELECT USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_live_sessions_updated_at
BEFORE UPDATE ON public.live_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for transcripts
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_transcripts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_vision_detections;