import pytest
import numpy as np
from unittest.mock import patch
from pathlib import Path

from vision_studio.infrastructure.ml.active_learning_service import ActiveLearningService
from vision_studio.domain.entities.detection import Detection, BoundingBox
from vision_studio.domain.value_objects.class_label import ClassLabel


def test_active_learning_service_init_creates_directory(tmp_path):
    queue_path = tmp_path / "custom_queue"
    service = ActiveLearningService(queue_dir=str(queue_path))
    assert queue_path.exists()
    assert service.queue_dir == queue_path


@patch("vision_studio.infrastructure.ml.active_learning_service.cv2.imwrite")
def test_collect_if_uncertain_saves_when_below_threshold(mock_imwrite, tmp_path):
    queue_path = tmp_path / "queue"
    service = ActiveLearningService(queue_dir=str(queue_path))

    detections = [
        Detection(
            id="det1", session_id="ses1", class_label=ClassLabel(class_id=0, name="stator"),
            confidence=0.95, bounding_box=BoundingBox(0, 0, 10, 10), contour=None, timestamp=None
        ),
        Detection(
            id="det2", session_id="ses1", class_label=ClassLabel(class_id=0, name="stator"),
            confidence=0.45,  # Below 0.6 threshold
            bounding_box=BoundingBox(0, 0, 10, 10), contour=None, timestamp=None
        )
    ]

    frame = np.zeros((10, 10, 3), dtype=np.uint8)
    service.collect_if_uncertain(frame, detections, threshold=0.6)

    assert mock_imwrite.call_count == 1
    call_args = mock_imwrite.call_args[0]
    saved_path = call_args[0]
    assert str(queue_path) in saved_path
    assert saved_path.endswith(".jpg")


@patch("vision_studio.infrastructure.ml.active_learning_service.cv2.imwrite")
def test_collect_if_uncertain_does_not_save_when_above_threshold(mock_imwrite, tmp_path):
    queue_path = tmp_path / "queue"
    service = ActiveLearningService(queue_dir=str(queue_path))

    detections = [
        Detection(
            id="det1", session_id="ses1", class_label=ClassLabel(class_id=0, name="stator"),
            confidence=0.95, bounding_box=BoundingBox(0, 0, 10, 10), contour=None, timestamp=None
        )
    ]

    frame = np.zeros((10, 10, 3), dtype=np.uint8)
    service.collect_if_uncertain(frame, detections, threshold=0.6)

    mock_imwrite.assert_not_called()
