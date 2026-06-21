import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import execute, fetch_all

def run_migration():
    print("Adding hackathon_id to assignments...")
    try:
        execute("ALTER TABLE assignments ADD COLUMN IF NOT EXISTS hackathon_id UUID;")
        print("Success.")
    except Exception as e:
        print(f"Failed: {e}")

    print("Adding hackathon_id to evaluations...")
    try:
        execute("ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS hackathon_id UUID;")
        print("Success.")
    except Exception as e:
        print(f"Failed: {e}")

    # For existing data, we should set hackathon_id to the existing hackathon
    hackathons = fetch_all("SELECT id FROM hackathons LIMIT 1")
    if hackathons:
        hid = hackathons[0]['id']
        print(f"Backfilling with hackathon_id: {hid}")
        execute(f"UPDATE assignments SET hackathon_id = '{hid}' WHERE hackathon_id IS NULL;")
        execute(f"UPDATE evaluations SET hackathon_id = '{hid}' WHERE hackathon_id IS NULL;")
        print("Backfill complete.")
    else:
        print("No hackathons found to backfill.")

if __name__ == "__main__":
    run_migration()
