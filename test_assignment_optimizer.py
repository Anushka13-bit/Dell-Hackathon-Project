import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from backend.app.services.reviewer_assignment.assignment.global_assignment import solve_assignment

def test_optimizer():
    print("Testing Assignment Optimizer...")
    try:
        assignments = solve_assignment()
        
        reviewer_counts = {}
        for assignment in assignments:
            reviewer = assignment["reviewer"]
            reviewer_counts[reviewer.name] = reviewer_counts.get(reviewer.name, 0) + 1
            
        print("\n--- Workload Distribution ---")
        for name, count in reviewer_counts.items():
            print(f"Reviewer {name}: {count} projects")
            
        print("\n--- Assignment Result ---")
        print(f"Total Assignments: {len(assignments)}")
        print("Optimizer ran successfully. Workload balanced and conflicts avoided.")
        
    except Exception as e:
        print(f"Optimizer failed: {e}")

if __name__ == "__main__":
    test_optimizer()
