import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    raise Exception("DATABASE_URL not set")

engine = create_engine(DB_URL)

queries = [
    # Add new fields to idea_submissions
    "ALTER TABLE idea_submissions ADD COLUMN IF NOT EXISTS github_url TEXT;",
    "ALTER TABLE idea_submissions ADD COLUMN IF NOT EXISTS ppt_url TEXT;",
    "ALTER TABLE idea_submissions ADD COLUMN IF NOT EXISTS video_url TEXT;",
    "ALTER TABLE idea_submissions ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;",
    "ALTER TABLE idea_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;",
    
    # Create audit_logs table
    """
    CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        payload JSONB NOT NULL,
        user_id UUID,
        prev_hash VARCHAR(64) NOT NULL,
        curr_hash VARCHAR(64) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """,
    
    # Indexes
    "CREATE INDEX IF NOT EXISTS idx_participants_team_id ON participants (team_id) WHERE team_id IS NULL;",
    "CREATE INDEX IF NOT EXISTS idx_assignments_reviewer_id ON assignments (reviewer_id);"
]

with engine.begin() as conn:
    for q in queries:
        conn.execute(text(q))
        
print("Migration completed successfully.")
