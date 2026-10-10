import pytest
import numpy as np
from unittest.mock import patch, MagicMock

from vision_studio.infrastructure.camera.uvc_adapter import UVCAdapter
from vision_studio.domain.ports.camera_port import CameraConfig

@patch("vision_studio.infrastructure.camera.uvc_adapter.cv2")
def test_uvc_adapter_open_success(mock_cv2):
    mock_cap = MagicMock()
    mock_cap.isOpened.return_value = True
    mock_cv2.VideoCapture.return_value = mock_cap
    
    adapter = UVCAdapter()
    config = CameraConfig(connection_string="0", width=1920, height=1080, fps=30)
    
    adapter.open(config)
    
    mock_cv2.VideoCapture.assert_called_once_with(0)
    assert adapter.is_open() is True
    
    # 3 calls for width, height, fps
    assert mock_cap.set.call_count == 3

@patch("vision_studio.infrastructure.camera.uvc_adapter.cv2")
def test_uvc_adapter_read_frame(mock_cv2):
    mock_cap = MagicMock()
    mock_cap.isOpened.return_value = True
    
    # Mock read returning (True, dummy_frame)
    dummy_frame = np.zeros((1080, 1920, 3), dtype=np.uint8)
    mock_cap.read.return_value = (True, dummy_frame)
    
    mock_cv2.VideoCapture.return_value = mock_cap
    
    adapter = UVCAdapter()
    adapter.open(CameraConfig(connection_string="0"))
    
    frame = adapter.read_frame()
    
    assert frame is not None
    assert frame.shape == (1080, 1920, 3)

def test_uvc_adapter_invalid_connection_string():
    adapter = UVCAdapter()
    with pytest.raises(ValueError):
        adapter.open(CameraConfig(connection_string="not_an_int"))
