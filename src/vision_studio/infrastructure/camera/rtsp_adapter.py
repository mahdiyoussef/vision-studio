import cv2
import numpy as np
from typing import Optional
from vision_studio.domain.ports.camera_port import ICameraAdapter, CameraConfig, CameraProperties
import logging

logger = logging.getLogger(__name__)

class RTSPAdapter(ICameraAdapter):
    def __init__(self):
        self._cap = None
        self._config = None

    def open(self, config: CameraConfig) -> None:
        self._config = config
        self._cap = cv2.VideoCapture(config.connection_string, cv2.CAP_FFMPEG)
        if not self._cap.isOpened():
            raise RuntimeError(f"Failed to open RTSP stream at {config.connection_string}")
        
        # We don't typically set width/height for RTSP, we just read what it provides

    def read_frame(self) -> Optional[np.ndarray]:
        if not self.is_open():
            return None
        ret, frame = self._cap.read()
        return frame if ret else None

    def is_open(self) -> bool:
        return self._cap is not None and self._cap.isOpened()

    def close(self) -> None:
        if self._cap:
            self._cap.release()
            self._cap = None

    def get_properties(self) -> CameraProperties:
        if not self.is_open():
            return CameraProperties("RTSP Stream (Closed)", "RTSP", 0, 0, 0.0)
            
        width = int(self._cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(self._cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = self._cap.get(cv2.CAP_PROP_FPS)
        return CameraProperties("RTSP Stream", "RTSP", width, height, fps)

    def set_exposure(self, value: float) -> None:
        pass # Not typically supported via OpenCV RTSP

    def set_gain(self, value: float) -> None:
        pass # Not typically supported via OpenCV RTSP
