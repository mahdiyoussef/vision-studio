from dataclasses import dataclass
from datetime import datetime

@dataclass
class CalibrationProfile:
    id: str
    name: str
    scale_factor_px_to_mm: float
    variance: float
    is_locked: bool
    created_at: datetime
    updated_at: datetime
