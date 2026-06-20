import os
import sys

import requests

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

def test_compute_results():
    print("Triggering compute results endpoint...")
    hackathon_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479" # Mock hackathon id or just rely on backend parsing it out if not rigorous.
    
    # In the actual backend, /evaluations/compute-results/{hackathon_id} does the NLG generation.
    try:
        response = requests.post(f"http://localhost:8000/evaluations/compute-results/{hackathon_id}")
        if response.status_code == 200:
            print("Successfully computed results and generated NLG feedback!")
            print(response.json())
        else:
            print(f"Failed to compute results. Status Code: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error calling compute results: {e}")

if __name__ == "__main__":
    test_compute_results()
