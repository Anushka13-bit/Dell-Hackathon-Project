from app.services.reviewer_assignment.assignment.assignment_service import generate_assignments

res = generate_assignments()
print(f"Generated {len(res)} assignments")
