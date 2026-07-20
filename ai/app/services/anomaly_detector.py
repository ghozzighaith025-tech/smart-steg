import numpy as np
from sklearn.ensemble import IsolationForest
from pydantic import BaseModel, Field

from app.services.explainability import explain_anomaly


class TelemetryFeatures(BaseModel):
    voltage: float = Field(..., ge=0, le=500)
    current: float = Field(..., ge=0)
    power: float = Field(..., ge=0)
    frequency: float = Field(default=50.0, ge=45, le=55)
    power_factor: float = Field(default=0.95, ge=0, le=1)
    temperature: float = Field(default=25.0)
    humidity: float = Field(default=50.0, ge=0, le=100)
    vibration_rms: float = Field(default=0.1, ge=0)


class AnomalyRequest(BaseModel):
    device_serial: str
    features: TelemetryFeatures


class AnomalyResponse(BaseModel):
    device_serial: str
    is_anomaly: bool
    anomaly_score: float
    severity: str
    explanation: dict


# Pre-trained isolation forest on synthetic baseline (Week 3 will retrain on real data)
_rng = np.random.default_rng(42)
_baseline = _rng.normal(
    loc=[230, 10, 2300, 50, 0.95, 35, 45, 0.5],
    scale=[5, 2, 200, 0.1, 0.03, 5, 10, 0.2],
    size=(500, 8),
)
_model = IsolationForest(contamination=0.05, random_state=42)
_model.fit(_baseline)

_FEATURE_NAMES = [
    "voltage", "current", "power", "frequency",
    "power_factor", "temperature", "humidity", "vibration_rms",
]


def score_anomaly(features: TelemetryFeatures) -> AnomalyResponse:
    X = np.array([[
        features.voltage, features.current, features.power,
        features.frequency, features.power_factor,
        features.temperature, features.humidity, features.vibration_rms,
    ]])

    raw_score = float(_model.decision_function(X)[0])
    # Normalize to 0-1 where 1 = most anomalous
    anomaly_score = round(max(0.0, min(1.0, 0.5 - raw_score)), 4)
    is_anomaly = anomaly_score > 0.6

    if anomaly_score > 0.8:
        severity = "critical"
    elif anomaly_score > 0.6:
        severity = "warning"
    else:
        severity = "info"

    explanation = explain_anomaly(
        features.model_dump(),
        _FEATURE_NAMES,
        _baseline,
    )

    return AnomalyResponse(
        device_serial="",
        is_anomaly=is_anomaly,
        anomaly_score=anomaly_score,
        severity=severity,
        explanation=explanation,
    )
