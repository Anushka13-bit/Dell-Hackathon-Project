import requests
import json

api_base = "http://localhost:8000"

# Fetch two participants
res = requests.get(f"{api_base}/participants/")
participants = res.json()
p1 = participants[0]
p2 = participants[1]

# Check teams
res = requests.get(f"{api_base}/teams/")
teams = res.json()
print("Teams:", json.dumps(teams, indent=2))

