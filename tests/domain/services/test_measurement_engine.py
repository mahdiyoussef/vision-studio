from vision_studio.domain.value_objects.class_label import ClassLabel
import pytest
import uuid
from vision_studio.domain.services.measurement_engine import MeasurementEngine
from vision_studio.domain.value_objects.tolerance import ToleranceBand
from vision_studio.domain.entities.detection import Detection, BoundingBox

def test_measurement_engine_computes_distance():
    # Setup
    tolerances = {
        "stator": ToleranceBand(nominal=100.0, upper=105.0, lower=95.0)
    }
    
    # 50 pixel width box, 2.0 pixels per metric = 100mm width
    det = Detection(
        id="det1",
        session_id="session1",
        class_label=ClassLabel(class_id=0, name="stator"),
        
        confidence=0.99,
        bounding_box=BoundingBox(x=0, y=0, w=50, h=50),
        contour=None,
        timestamp=None
    )
    
    # Execute
    measurements = MeasurementEngine.compute([det], tolerances, pixels_per_metric=2.0)
    
    # Assert
    assert len(measurements) == 1
    m = measurements[0]
    assert m.value == 100.0
    assert m.passed is True
    assert m.name == "stator_distance"

def test_measurement_engine_computes_distance_fails_tolerance():
    tolerances = {
        "stator": ToleranceBand(nominal=100.0, upper=105.0, lower=95.0)
    }
    
    # 60 pixel width box, 2.0 pixels per metric = 120mm width (Fails tolerance)
    det = Detection(
        id="det1",
        session_id="session1",
        class_label=ClassLabel(class_id=0, name="stator"),
        
        confidence=0.99,
        bounding_box=BoundingBox(x=0, y=0, w=60, h=50),
        contour=None,
        timestamp=None
    )
    
    measurements = MeasurementEngine.compute([det], tolerances, pixels_per_metric=2.0)
    
    assert len(measurements) == 1
    m = measurements[0]
    assert m.value == 120.0
    assert m.passed is False

def test_measurement_engine_ignores_unknown_classes():
    tolerances = {
        "stator": ToleranceBand(nominal=100.0, upper=105.0, lower=95.0)
    }
    
    det = Detection(
        id="det1",
        session_id="session1",
        class_label=ClassLabel(class_id=1, name="unknown"),
        
        confidence=0.99,
        bounding_box=BoundingBox(x=0, y=0, w=50, h=50),
        contour=None,
        timestamp=None
    )
    
    measurements = MeasurementEngine.compute([det], tolerances, pixels_per_metric=2.0)
    assert len(measurements) == 0
