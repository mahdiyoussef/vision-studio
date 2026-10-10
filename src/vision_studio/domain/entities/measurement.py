from dataclasses import dataclass
from typing import Optional
from vision_studio.domain.value_objects.tolerance import ToleranceBand

@dataclass
class Measurement:
    id: str
    session_id: str
    detection_id: str
    name: str
    value: float
    unit: str
    tolerance: Optional[ToleranceBand] = None
    passed: bool = False
