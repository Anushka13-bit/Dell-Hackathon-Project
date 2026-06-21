from app.services.reviewer_assignment.assignment.assignment_service import generate_assignments
try:
    res = generate_assignments()
    print(f"Generated {len(res)} assignments")
except Exception as e:
    import traceback
    traceback.print_exc()
