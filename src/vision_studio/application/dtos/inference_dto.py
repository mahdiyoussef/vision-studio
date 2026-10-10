from dataclasses import dataclass
from typing import List, Optional, Any
from datetime import datetime

@dataclass
class DetectionDTO:
    id: str
    class_name: str
    confidence: float
    bbox_x: float
    bbox_y: float
    bbox_w: float
    bbox_h: float

@dataclass
class MeasurementDTO:
    id: str
    rule_name: str
    value_px: float
    value_physical: float
    unit: str
    status: str

@dataclass
class InferenceResultDTO:
    session_id: str
    detections: List[DetectionDTO]
    measurements: List[MeasurementDTO]
    timestamp: datetime
    # annotated_frame_uri could be a URL or a base64 string
    annotated_frame_uri: Optional[str] = None
