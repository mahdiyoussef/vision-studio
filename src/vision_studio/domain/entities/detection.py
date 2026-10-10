from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Any
import numpy as np

from vision_studio.domain.value_objects.bounding_box import BoundingBox
from vision_studio.domain.value_objects.class_label import ClassLabel

@dataclass
class Detection:
    id: str
    session_id: str
    class_label: ClassLabel
    confidence: float
    bounding_box: BoundingBox
    mask: Optional[np.ndarray] = None
    contour: Optional[Any] = None  # Could type better later
    fitted_geometry: Optional[Any] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)
