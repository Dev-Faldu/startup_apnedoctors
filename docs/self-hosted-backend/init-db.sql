-- ApneDoctors Voice AI Database Schema

-- Call Sessions
CREATE TABLE IF NOT EXISTS call_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name VARCHAR(255),
    patient_dob DATE,
    patient_contact VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    state VARCHAR(50) DEFAULT 'greeting',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    triage_level VARCHAR(20),
    medical_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transcript Entries
CREATE TABLE IF NOT EXISTS transcript_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    confidence FLOAT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Extractions
CREATE TABLE IF NOT EXISTS medical_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
    chief_complaint TEXT,
    body_part VARCHAR(100),
    severity INTEGER CHECK (severity >= 0 AND severity <= 10),
    onset_days INTEGER,
    duration VARCHAR(100),
    pain_character VARCHAR(255),
    radiation VARCHAR(255),
    red_flags JSONB DEFAULT '{}',
    symptoms JSONB DEFAULT '[]',
    aggravating_factors JSONB DEFAULT '[]',
    relieving_factors JSONB DEFAULT '[]',
    medications JSONB DEFAULT '[]',
    allergies JSONB DEFAULT '[]',
    past_conditions JSONB DEFAULT '[]',
    triage_level VARCHAR(20),
    confidence_score FLOAT,
    doctor_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triage Results
CREATE TABLE IF NOT EXISTS triage_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
    extraction_id UUID REFERENCES medical_extractions(id),
    triage_level VARCHAR(20) NOT NULL CHECK (triage_level IN ('GREEN', 'AMBER', 'RED')),
    urgency_description TEXT,
    recommended_timeframe VARCHAR(100),
    recommended_actions JSONB DEFAULT '[]',
    confidence_score FLOAT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_status ON call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_triage ON call_sessions(triage_level);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON call_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcripts_session ON transcript_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_timestamp ON transcript_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_extractions_session ON medical_extractions(session_id);
CREATE INDEX IF NOT EXISTS idx_triage_session ON triage_results(session_id);
CREATE INDEX IF NOT EXISTS idx_triage_level ON triage_results(triage_level);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sessions_updated
    BEFORE UPDATE ON call_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- View for doctor dashboard
CREATE OR REPLACE VIEW v_session_summary AS
SELECT 
    cs.id,
    cs.patient_name,
    cs.status,
    cs.triage_level,
    cs.started_at,
    cs.ended_at,
    cs.duration_seconds,
    me.chief_complaint,
    me.severity,
    me.symptoms,
    me.red_flags,
    tr.urgency_description,
    tr.recommended_timeframe
FROM call_sessions cs
LEFT JOIN medical_extractions me ON me.session_id = cs.id
LEFT JOIN triage_results tr ON tr.session_id = cs.id
ORDER BY 
    CASE cs.triage_level 
        WHEN 'RED' THEN 1 
        WHEN 'AMBER' THEN 2 
        ELSE 3 
    END,
    cs.created_at DESC;
