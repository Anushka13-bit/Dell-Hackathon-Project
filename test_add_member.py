import requests

api_base = "http://localhost:8000"

# Fetch two participants
res = requests.get(f"{api_base}/participants/")
participants = res.json()
p1 = participants[0]
p2 = participants[1]

# Create team with just p1
res = requests.post(f"{api_base}/teams/create", json={
    "name": "Test Team",
    "member_ids": [p1["id"]]
})
team_data = res.json()
print("Create:", team_data)

team_id = team_data.get("team_id")
if team_id:
    # Add member
    res2 = requests.post(f"{api_base}/teams/{team_id}/add_member", json={
        "participant_id": p2["id"]
    })
    print("Add Member Status Code:", res2.status_code)
    print("Add Member Response:", res2.text)

    # Delete the team afterwards
    requests.delete(f"{api_base}/teams/{team_id}")

