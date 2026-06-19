import os
import psycopg2
from dotenv import load_dotenv

def init_db():
    from pathlib import Path
    env_path = Path(__file__).parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL is not set in the environment. Skipping DB setup.")
        return

    print("Connecting to database...")
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()

        print("Creating tables...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS teams (
                team_id   UUID PRIMARY KEY,
                name      TEXT,
                member_ids UUID[]
            );

            CREATE TABLE IF NOT EXISTS problem_statements (
                ps_id            UUID PRIMARY KEY,
                title            TEXT,
                raw_text         TEXT,
                required_vector  JSONB,
                min_size         INT,
                max_size         INT
            );

            CREATE TABLE IF NOT EXISTS participants (
                id            TEXT PRIMARY KEY,
                name          TEXT,
                college_name  TEXT,
                github_url    TEXT,
                declared_skills TEXT[],
                skill_vector  JSONB,
                team_id       UUID NULL REFERENCES teams(team_id)
            );

            CREATE INDEX IF NOT EXISTS idx_participants_unassigned ON participants (team_id) WHERE team_id IS NULL;
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("Database tables created successfully.")
    except Exception as e:
        print(f"Database connection failed: {e}")

if __name__ == "__main__":
    init_db()
