def calculate_variance(
    reviewer_counts: dict
):

    if not reviewer_counts:
        return 0

    loads = list(
        reviewer_counts.values()
    )

    avg_load = (
        sum(loads) / len(loads)
    )

    if avg_load == 0:
        return 0

    max_load = max(loads)
    min_load = min(loads)

    variance = (
        max_load -
        min_load
    ) / avg_load

    return round(
        variance,
        4
    )

if __name__ == "__main__":

    test = {
        "Atharva": 2,
        "Priya": 1,
        "Rahul": 1,
        "Alisha": 0,
        "Anushka": 0
    }

    print(
        calculate_variance(
            test
        )
    )