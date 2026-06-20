-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the registrations table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id), -- If using Supabase Auth
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    college TEXT NOT NULL,
    github TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Decisions and Scores
    decision TEXT NOT NULL CHECK (decision IN ('AUTO_APPROVED', 'MANUAL_REVIEW', 'POTENTIAL_DUPLICATE', 'HARD_DUPLICATE')),
    score DOUBLE PRECISION NOT NULL,
    
    -- Explanations
    matched_profile TEXT,
    matched_profile_note TEXT,
    
    -- Extracted Data
    skills TEXT[] DEFAULT '{}',
    
    -- Exact Signals
    exact_email BOOLEAN DEFAULT false,
    exact_phone BOOLEAN DEFAULT false,
    exact_github BOOLEAN DEFAULT false,
    
    -- Similarity
    sim_name DOUBLE PRECISION DEFAULT 0.0,
    sim_college DOUBLE PRECISION DEFAULT 0.0,
    
    -- Device/IP Correlation
    device_match BOOLEAN DEFAULT false,
    ip_subnet_match BOOLEAN DEFAULT false,
    
    -- FaceScan
    face_scan_status TEXT CHECK (face_scan_status IN ('verified', 'manual_review', 'review_required', 'not_consented')),
    face_scan_score DOUBLE PRECISION,
    face_scan_consented BOOLEAN DEFAULT false,
    face_scan_deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Admin Recommendation
    recommendation TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registration"
    ON registrations
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Organizers can view all registrations"
    ON registrations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'organizer'
        )
    );

CREATE POLICY "Users can insert their own registration"
    ON registrations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can update registrations"
    ON registrations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'organizer'
        )
    );
