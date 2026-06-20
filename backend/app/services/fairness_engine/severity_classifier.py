def classify_severity(
    p_value: float | None,
    effect_size: float | None
) -> str:

    effect_size = abs(effect_size or 0)

    if (
        p_value is not None
        and p_value < 0.0001
        and effect_size >= 0.7
    ):
        return "CRITICAL"

    if (
        p_value is not None
        and p_value < 0.001
        and effect_size >= 0.5
    ):
        return "HIGH"

    if (
        p_value is not None
        and p_value < 0.01
        and effect_size >= 0.3
    ):
        return "MEDIUM"

    return "LOW"