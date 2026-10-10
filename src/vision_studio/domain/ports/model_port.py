from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Any
import numpy as np
from pathlib import Path

from vision_studio.domain.entities.detection import Detection

@dataclass
class ModelInfo:
    name: str
    architecture: str
    input_size: tuple[int, int]
    num_classes: int

class IModelAdapter(ABC):
    @abstractmethod
    def load(self, weights_path: Path, device: str = "cuda") -> None:
        pass
        
    @abstractmethod
    def predict(self, frame: np.ndarray, conf_threshold: float = 0.25) -> List[Detection]:
        pass
        
    @abstractmethod
    def get_info(self) -> ModelInfo:
        pass
        
    @abstractmethod
    def unload(self) -> None:
        pass
