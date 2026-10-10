import cv2
import numpy as np
from typing import Optional
from vision_studio.domain.ports.camera_port import ICameraAdapter, CameraConfig, CameraProperties
import logging

logger = logging.getLogger(__name__)

class UVCAdapter(ICameraAdapter):
    def __init__(self):
        self._cap = None
        self._config = None

    def open(self, config: CameraConfig) -> None:
        self._config = config
        try:
            device_id = int(config.connection_string)
        except ValueError:
            logger.error(f"UVCAdapter requires an integer connection_string, got: {config.connection_string}")
            raise ValueError(f"Invalid UVC device index: {config.connection_string}")
            
        self._cap = cv2.VideoCapture(device_id)
        if not self._cap.isOpened():
            raise RuntimeError(f"Failed to open UVC camera at index {device_id}")

        self._cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.width)
        self._cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.height)
        self._cap.set(cv2.CAP_PROP_FPS, config.fps)

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
            return CameraProperties("UVC Camera (Closed)", "UVC", 0, 0, 0.0)
            
        width = int(self._cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(self._cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = self._cap.get(cv2.CAP_PROP_FPS)
        return CameraProperties("UVC Camera", "UVC", width, height, fps)

    def set_exposure(self, value: float) -> None:
        if self.is_open():
            self._cap.set(cv2.CAP_PROP_EXPOSURE, value)

    def set_gain(self, value: float) -> None:
        if self.is_open():
            self._cap.set(cv2.CAP_PROP_GAIN, value)
