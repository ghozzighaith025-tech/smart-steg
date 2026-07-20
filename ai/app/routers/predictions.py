from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class PredictionRequest(BaseModel):
    asset_id: str
    health_score: float = Field(..., ge=0, le=100)
    avg_vibration: float = Field(default=0.5)
    avg_temperature: float = Field(default=35.0)
    operating_hours: float = Field(default=5000)


class PredictionResponse(BaseModel):
    asset_id: str
    rul_days: float
    failure_probability: float
    health_trend: str
    recommendation: str
    model_version: str = "0.1.0"


@router.post("/predictions/rul", response_model=PredictionResponse)
def predict_rul(request: PredictionRequest):
    """Heuristic RUL model — replaced by XGBoost in Week 4."""
    degradation = (100 - request.health_score) / 100
    vibration_factor = min(request.avg_vibration / 2.0, 1.0)
    temp_factor = min(max(request.avg_temperature - 40, 0) / 30, 1.0)

    failure_prob = round(min(0.95, degradation * 0.5 + vibration_factor * 0.3 + temp_factor * 0.2), 4)
    rul_days = round(max(7, (1 - failure_prob) * 365), 1)

    if failure_prob > 0.7:
        trend = "declining_fast"
        rec = "Schedule immediate inspection. High failure risk detected."
    elif failure_prob > 0.4:
        trend = "declining"
        rec = "Plan preventive maintenance within 30 days."
    else:
        trend = "stable"
        rec = "Continue routine monitoring."

    return PredictionResponse(
        asset_id=request.asset_id,
        rul_days=rul_days,
        failure_probability=failure_prob,
        health_trend=trend,
        recommendation=rec,
    )
