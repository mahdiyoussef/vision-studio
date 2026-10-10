import pytest
import numpy as np
from unittest.mock import patch, MagicMock

from vision_studio.infrastructure.camera.rtsp_adapter import RTSPAdapter
from vision_studio.domain.ports.camera_port import CameraConfig

@patch("vision_studio.infrastructure.camera.rtsp_adapter.cv2")
def test_rtsp_adapter_open_success(mock_cv2):
    mock_cap = MagicMock()
    mock_cap.isOpened.return_value = True
    mock_cv2.VideoCapture.return_value = mock_cap
    
    adapter = RTSPAdapter()
    config = CameraConfig(connection_string="rtsp://test/stream")
    
    adapter.open(config)
    
    mock_cv2.VideoCapture.assert_called_once_with("rtsp://test/stream", mock_cv2.CAP_FFMPEG)
    assert adapter.is_open()

@patch("vision_studio.infrastructure.camera.rtsp_adapter.cv2")
def test_rtsp_adapter_open_failure(mock_cv2):
    mock_cap = MagicMock()
    mock_cap.isOpened.return_value = False
    mock_cv2.VideoCapture.return_value = mock_cap
    
    adapter = RTSPAdapter()
    config = CameraConfig(connection_string="rtsp://bad/stream")
    
    with pytest.raises(RuntimeError, match="Failed to open RTSP stream"):
        adapter.open(config)

@patch("vision_studio.infrastructure.camera.rtsp_adapter.cv2")
def test_rtsp_adapter_read_frame(mock_cv2):
    mock_cap = MagicMock()
    mock_cap.isOpened.return_value = True
    # read() returns (ret, frame)
    fake_frame = np.zeros((10, 10, 3))
    mock_cap.read.return_value = (True, fake_frame)
    mock_cv2.VideoCapture.return_value = mock_cap
    
    adapter = RTSPAdapter()
    adapter.open(CameraConfig("rtsp://test"))
    
    frame = adapter.read_frame()
    assert frame is not None
    assert frame.shape == (10, 10, 3)

@patch("vision_studio.infrastructure.camera.rtsp_adapter.cv2")
def test_rtsp_adapter_close(mock_cv2):
    mock_cap = MagicMock()
    mock_cap.isOpened.return_value = True
    mock_cv2.VideoCapture.return_value = mock_cap
    
    adapter = RTSPAdapter()
    adapter.open(CameraConfig("rtsp://test"))
    
    adapter.close()
    mock_cap.release.assert_called_once()
    
    # After closing, cap is None, so is_open() should return False
    # To test that properly without side effects:
    assert adapter.is_open() is False

