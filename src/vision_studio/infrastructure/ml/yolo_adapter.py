from typing import List
import numpy as np
from pathlib import Path
try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

from vision_studio.domain.ports.model_port import IModelAdapter, ModelInfo
from vision_studio.domain.entities.detection import Detection

class YOLOAdapter(IModelAdapter):
    """Infrastructure adapter for Ultralytics YOLO models."""
    
    def __init__(self):
        self._model = None
        self._weights_path = None
        self._device = None

    def load(self, weights_path: Path, device: str = "cuda") -> None:
        if YOLO is None:
            raise RuntimeError("ultralytics is not installed. Please run: pip install ultralytics")
        self._weights_path = weights_path
        self._device = device
        self._model = YOLO(str(weights_path))
        self._model.to(device)

    def predict(self, frame: np.ndarray, conf_threshold: float = 0.25) -> List[Detection]:
        if self._model is None:
            raise RuntimeError("Model is not loaded. Call load() first.")
            
        results = self._model.predict(frame, conf=conf_threshold, verbose=False)
        detections = []
        
        # Parse Ultralytics results and map to domain entities (Detection, BoundingBox)
        # for r in results[0].boxes:
        #    detections.append(Detection(...))
            
        return detections

    def get_info(self) -> ModelInfo:
        return ModelInfo(
            name=self._weights_path.stem if self._weights_path else "YOLO_Unknown",
            architecture="YOLO",
            input_size=(640, 640),
            num_classes=len(self._model.names) if self._model else 0
        )

    def unload(self) -> None:
        self._model = None
