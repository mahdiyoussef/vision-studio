from typing import List, Dict, Any
import numpy as np
import uuid

from vision_studio.domain.entities.detection import Detection
from vision_studio.domain.entities.measurement import Measurement
from vision_studio.domain.value_objects.tolerance import ToleranceBand, ToleranceStatus

class MeasurementEngine:
    """
    Applies measurement rules (Tolerances) to Detections to produce Measurements.
    """
    
    @staticmethod
    def compute(detections: List[Detection], tolerances: Dict[str, ToleranceBand], pixels_per_metric: float = 1.0) -> List[Measurement]:
        measurements = []
        
        for det in detections:
            # Simple example: if there's a tolerance matching the detection class name
            if det.class_label.name in tolerances:
                tol = tolerances[det.class_label.name]
                
                # compute width of bounding box
                if det.bounding_box:
                    width_pixels = det.bounding_box.w
                    value = width_pixels * pixels_per_metric
                    
                    status = tol.check(value)
                    passed = (status == ToleranceStatus.PASS)
                    
                    measurements.append(
                        Measurement(
                            id=str(uuid.uuid4()),
                            session_id=det.session_id,
                            detection_id=det.id,
                            name=f"{det.class_label.name}_distance",
                            value=value,
                            unit="mm", 
                            tolerance=tol,
                            passed=passed
                        )
                    )
                
        return measurements
