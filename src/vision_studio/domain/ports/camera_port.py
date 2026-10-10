from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, Any
import numpy as np

@dataclass
class CameraConfig:
    connection_string: str
    width: int = 1920
    height: int = 1080
    fps: int = 30

@dataclass
class CameraProperties:
    name: str
    protocol: str
    width: int
    height: int
    fps: float

class ICameraAdapter(ABC):
    @abstractmethod
    def open(self, config: CameraConfig) -> None:
        pass
        
    @abstractmethod
    def read_frame(self) -> Optional[np.ndarray]:
        pass
        
    @abstractmethod
    def is_open(self) -> bool:
        pass
        
    @abstractmethod
    def close(self) -> None:
        pass
        
    @abstractmethod
    def get_properties(self) -> CameraProperties:
        pass
        
    @abstractmethod
    def set_exposure(self, value: float) -> None:
        pass
        
    @abstractmethod
    def set_gain(self, value: float) -> None:
        pass
