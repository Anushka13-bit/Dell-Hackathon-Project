import uuid
import sys
import os

# Add path so we can import backend
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app.database import execute, fetch_all
from backend.app.worker import detect_bias_task

def setup_dummy_data():
    hid = str(uuid.uuid4())
    print(f"Using hackathon {hid}")
    
    # 1. Hackathon
    execute("INSERT INTO hackathons (id, title, start_date, end_date) VALUES (%s, 'Bias Test', NOW(), NOW())", (hid,))
    
    # 2. Teams
    t1 = str(uuid.uuid4())
    t2 = str(uuid.uuid4())
    execute("INSERT INTO teams (team_id, name) VALUES (%s, 'Team College A'), (%s, 'Team College B')", (t1, t2))
    
    # 3. Participants
    for i in range(3):
        pid = str(uuid.uuid4())
        execute("INSERT INTO participants (id, hackathon_id, team_id, college_name) VALUES (%s, %s, %s, 'College A')", (pid, hid, t1))
        
    for i in range(3):
        pid = str(uuid.uuid4())
        execute("INSERT INTO participants (id, hackathon_id, team_id, college_name) VALUES (%s, %s, %s, 'College B')", (pid, hid, t2))
        
    # 4. Ideas
    ps_id = str(uuid.uuid4())
    execute("INSERT INTO problem_statements (ps_id, title) VALUES (%s, 'PS 1')", (ps_id,))
    
    i1 = str(uuid.uuid4())
    i2 = str(uuid.uuid4())
    execute("INSERT INTO idea_submissions (idea_id, team_id, ps_id, title, description, idea_vector, submitted_at, status) VALUES (%s, %s, %s, 'Idea A', 'Desc', '{}', NOW(), 'submitted'), (%s, %s, %s, 'Idea B', 'Desc', '{}', NOW(), 'submitted')", (i1, t1, ps_id, i2, t2, ps_id))
    
    # 5. Evaluations (Reviewer 1 is biased against College A)
    r1 = str(uuid.uuid4())
    a1 = str(uuid.uuid4()) # dummy assignment
    
    # 4 scores for Idea A (College A) -> low scores
    for score in [2, 3, 2, 3]:
        eid = str(uuid.uuid4())
        execute("INSERT INTO evaluations (evaluation_id, assignment_id, reviewer_id, idea_id, score) VALUES (%s, %s, %s, %s, %s)", (eid, a1, r1, i1, score))
        
    # 4 scores for Idea B (College B) -> high scores
    for score in [9, 10, 9, 10]:
        eid = str(uuid.uuid4())
        execute("INSERT INTO evaluations (evaluation_id, assignment_id, reviewer_id, idea_id, score) VALUES (%s, %s, %s, %s, %s)", (eid, a1, r1, i2, score))

    print("Dummy data inserted.")
    return hid

if __name__ == "__main__":
    try:
        hid = setup_dummy_data()
        print("Triggering celery task...")
        result = detect_bias_task(hid)
        print("Task Result:", result)
        
        # Check audit_logs
        logs = fetch_all("SELECT payload FROM audit_logs WHERE event_type = 'BIAS_ALERT' ORDER BY created_at DESC LIMIT 5")
        for log in logs:
            print("BIAS ALERT:", log['payload'])
    except Exception as e:
        print("ERROR:", e)
