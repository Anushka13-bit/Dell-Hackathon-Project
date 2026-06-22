import requests

api_base = "http://localhost:8000"

# Fetch two participants
res = requests.get(f"{api_base}/participants/")
participants = res.json()
p1 = participants[0]
p2 = participants[1]

# Create team
res = requests.post(f"{api_base}/teams/create", json={
    "name": "Test Team Coverage",
    "member_ids": [p1["id"], p2["id"]]
})
print("Create response:", res.json())

team_id = res.json().get("team_id")
if team_id:
    # Delete the team afterwards
    requests.delete(f"{api_base}/teams/{team_id}")

