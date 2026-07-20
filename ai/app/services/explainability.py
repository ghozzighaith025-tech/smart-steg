import numpy as np


def explain_anomaly(
    features: dict,
    feature_names: list[str],
    baseline: np.ndarray,
) -> dict:
    """Feature-importance explanation (SHAP-lite for Week 1, full SHAP in Week 3)."""
    contributions = {}
    values = [features[name] for name in feature_names]
    baseline_mean = baseline.mean(axis=0)

    for i, name in enumerate(feature_names):
        baseline_std = baseline[:, i].std() or 1.0
        z_score = abs(values[i] - baseline_mean[i]) / baseline_std
        contributions[name] = round(float(z_score), 4)

    sorted_features = sorted(contributions.items(), key=lambda x: x[1], reverse=True)
    top_driver = sorted_features[0][0] if sorted_features else "unknown"

    return {
        "top_driver": top_driver,
        "feature_importance": dict(sorted_features),
        "summary": f"Primary anomaly driver: {top_driver} deviates significantly from baseline.",
        "method": "z-score-deviation-v0.1",
    }
