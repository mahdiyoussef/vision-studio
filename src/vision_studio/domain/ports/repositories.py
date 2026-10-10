from abc import ABC, abstractmethod
from typing import List, Optional

from vision_studio.domain.entities.project import Project
from vision_studio.domain.entities.detection import Detection
from vision_studio.domain.entities.measurement import Measurement
from vision_studio.domain.entities.inspection_session import InspectionSession

class IProjectRepository(ABC):
    @abstractmethod
    def save(self, project: Project) -> None: pass
    
    @abstractmethod
    def get_by_id(self, project_id: str) -> Optional[Project]: pass
    
    @abstractmethod
    def list_all(self) -> List[Project]: pass
    
    @abstractmethod
    def delete(self, project_id: str) -> None: pass

class IDetectionRepository(ABC):
    @abstractmethod
    def save(self, detection: Detection) -> None: pass
    
    @abstractmethod
    def save_batch(self, detections: List[Detection]) -> None: pass
    
    @abstractmethod
    def get_by_session(self, session_id: str) -> List[Detection]: pass

class IMeasurementRepository(ABC):
    @abstractmethod
    def save(self, measurement: Measurement) -> None: pass
    
    @abstractmethod
    def save_batch(self, measurements: List[Measurement]) -> None: pass
    
    @abstractmethod
    def get_by_session(self, session_id: str) -> List[Measurement]: pass

class ISessionRepository(ABC):
    @abstractmethod
    def create(self, session: InspectionSession) -> None: pass
    
    @abstractmethod
    def get_by_id(self, session_id: str) -> Optional[InspectionSession]: pass
    
    @abstractmethod
    def update(self, session: InspectionSession) -> None: pass
    
    @abstractmethod
    def list_by_project(self, project_id: str, limit: int = 50) -> List[InspectionSession]: pass
