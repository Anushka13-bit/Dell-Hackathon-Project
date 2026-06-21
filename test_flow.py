import requests
import uuid

API = "http://localhost:8000"

print("1. Get participants...")
r = requests.get(f"{API}/participants/")
participants = r.json()
print(f"Found {len(participants)} participants.")

if len(participants) < 2:
    print("Need at least 2 participants.")
    exit(1)

creator = participants[0]
recruit = participants[1]

# Set a mock user_id for creator if none
creator_user_id = creator.get("user_id")
if not creator_user_id:
    creator_user_id = str(uuid.uuid4())
    # we simulate session.user.id being creator_user_id

print(f"Creator: {creator['name']} ({creator['id']})")
print(f"Recruit: {recruit['name']} ({recruit['id']})")

print("2. Create Team (simulating handleInvite when no team_id exists)...")
payload = {
    "name": "Test Team 123",
    "member_ids": [creator_user_id, recruit['id']]
}
r = requests.post(f"{API}/teams/create", json=payload)
if r.status_code != 200:
    print(f"Failed to create team: {r.text}")
    exit(1)
team = r.json()
print(f"Created Team: {team['team_id']}")

print("3. Check if team_id was assigned to both participants...")
r1 = requests.get(f"{API}/participants/{creator['id']}")
r2 = requests.get(f"{API}/participants/{recruit['id']}")
print(f"Creator team_id: {r1.json().get('team_id')}")
print(f"Recruit team_id: {r2.json().get('team_id')}")

print("4. Fetch team members (simulating workspace/page.tsx)...")
members = []
for mid in team['member_ids']:
    res = requests.get(f"{API}/participants/{mid}")
    if res.status_code == 200:
        members.append(res.json()['name'])
print(f"Fetched team members: {members}")

