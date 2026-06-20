def calculate_compatibility(
    reviewer_vector: dict,
    idea_vector: dict
) -> float:

    score = 0.0

    for category, idea_weight in idea_vector.items():

        reviewer_score = reviewer_vector.get(
            category,
            0.0
        )

        score += (
            reviewer_score *
            idea_weight
        )

    return round(score, 4)

