from fastapi import APIRouter

from app.services.anomaly_detector import AnomalyRequest, AnomalyResponse, score_anomaly

router = APIRouter()


@router.post("/anomaly/score", response_model=AnomalyResponse)
def detect_anomaly(request: AnomalyRequest):
    result = score_anomaly(request.features)
    result.device_serial = request.device_serial
    return result
