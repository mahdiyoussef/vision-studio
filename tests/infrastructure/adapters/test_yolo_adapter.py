import pytest
import numpy as np
from pathlib import Path
from unittest.mock import patch, MagicMock

from vision_studio.infrastructure.ml.yolo_adapter import YOLOAdapter

@patch("vision_studio.infrastructure.ml.yolo_adapter.YOLO")
def test_yolo_adapter_load(mock_yolo_cls):
    mock_model_instance = MagicMock()
    mock_yolo_cls.return_value = mock_model_instance
    
    adapter = YOLOAdapter()
    adapter.load(Path("fake_weights.pt"), device="cpu")
    
    mock_yolo_cls.assert_called_once_with("fake_weights.pt")
    mock_model_instance.to.assert_called_once_with("cpu")

@patch("vision_studio.infrastructure.ml.yolo_adapter.YOLO")
def test_yolo_adapter_predict(mock_yolo_cls):
    mock_model_instance = MagicMock()
    # Setup mock results
    mock_results = MagicMock()
    mock_results.boxes = []
    mock_model_instance.predict.return_value = [mock_results]
    
    mock_yolo_cls.return_value = mock_model_instance
    
    adapter = YOLOAdapter()
    adapter.load(Path("fake_weights.pt"), device="cpu")
    
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    detections = adapter.predict(frame, conf_threshold=0.5)
    
    mock_model_instance.predict.assert_called_once_with(frame, conf=0.5, verbose=False)
    assert isinstance(detections, list)

def test_yolo_adapter_predict_without_load_raises():
    adapter = YOLOAdapter()
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    
    with pytest.raises(RuntimeError, match="Model is not loaded"):
        adapter.predict(frame)

