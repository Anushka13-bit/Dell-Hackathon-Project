from typing import List
from sqlalchemy.orm import Session

# Mock Participant
class Participant:
    def __init__(self, id, user_id):
        self.id = id
        self.user_id = user_id

def get_valid_team_member_ids(raw_ids: List[str], participants: List[Participant]) -> List[str]:
    # We want to return unique Participant.id values, preserving the original order of raw_ids
    # For each raw_id, find the matching participant.
    valid_ids = []
    seen = set()
    for raw_id in raw_ids:
        for p in participants:
            if str(p.id) == raw_id or str(p.user_id) == raw_id:
                pid = str(p.id)
                if pid not in seen:
                    seen.add(pid)
                    valid_ids.append(pid)
                break
    return valid_ids

participants = [Participant("p1", "u1"), Participant("p2", "u2")]
print(get_valid_team_member_ids(["u1", "p1", "p2"], participants))
print(get_valid_team_member_ids(["p2", "u1", "p1"], participants))
