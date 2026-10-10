from vision_studio.domain.value_objects.class_label import ClassLabel
import sys
from unittest.mock import MagicMock

# Mock heavy/external dependencies for unit test collection
sys.modules['cv2'] = MagicMock()
sys.modules['ultralytics'] = MagicMock()
sys.modules['azure'] = MagicMock()
sys.modules['azure.storage'] = MagicMock()
sys.modules['azure.storage.blob'] = MagicMock()
sys.modules['pandas'] = MagicMock()

import pytest
from datetime import datetime
import uuid

from vision_studio.domain.entities.project import Project, DomainConfig
from vision_studio.domain.value_objects.tolerance import ToleranceBand
from vision_studio.domain.entities.detection import Detection, BoundingBox

@pytest.fixture
def dummy_domain_config():
    return DomainConfig(
        domain_name="test_domain",
        model_type="yolo",
        model_weights_path="path/to/weights",
        camera_protocol="uvc",
        camera_connection="0",
        tolerance_thresholds={
            "stator": ToleranceBand(nominal=10.0, upper=10.5, lower=9.5)
        }
    )

@pytest.fixture
def dummy_project(dummy_domain_config):
    return Project(
        id=str(uuid.uuid4()),
        name="Test Project",
        description="A project for testing",
        domain_config=dummy_domain_config
    )

@pytest.fixture
def dummy_detection():
    return Detection(
        id=str(uuid.uuid4()),
        session_id=str(uuid.uuid4()),
        class_label=ClassLabel(class_id=0, name="stator"),
        
        confidence=0.99,
        bounding_box=BoundingBox(0, 0, 50, 50),
        contour=None,
        timestamp=datetime.utcnow()
    )
sys.modules['torch'] = MagicMock()
