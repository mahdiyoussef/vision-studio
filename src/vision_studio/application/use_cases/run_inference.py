from vision_studio.domain.value_objects.class_label import ClassLabel
from typing import Any, Dict, Optional
import numpy as np
from datetime import datetime
import uuid

from vision_studio.domain.ports.repositories import (
    IProjectRepository, 
    IDetectionRepository, 
    IMeasurementRepository,
    ISessionRepository
)
from vision_studio.domain.ports.model_port import IModelAdapter
from vision_studio.application.dtos.inference_dto import InferenceResultDTO
from vision_studio.domain.entities.inspection_session import InspectionSession
from vision_studio.domain.entities.detection import Detection, BoundingBox

# Import the actual service (or an interface if following strict port pattern)
from vision_studio.infrastructure.ml.active_learning_service import ActiveLearningService

class RunInferenceUseCase:
    """
    Orchestrates the process of applying an ML model to an image,
    extracting measurements, and returning the DTO.
    """
    
    def __init__(
        self,
        project_repo: IProjectRepository,
        session_repo: ISessionRepository,
        detection_repo: IDetectionRepository,
        measurement_repo: IMeasurementRepository,
        model_registry: Dict[str, Any],
        active_learning: Optional[ActiveLearningService] = None
    ):
        self.project_repo = project_repo
        self.session_repo = session_repo
        self.detection_repo = detection_repo
        self.measurement_repo = measurement_repo
        self.model_registry = model_registry
        self.active_learning = active_learning
        
    def execute(self, project_id: str, session_id: str, frame: np.ndarray) -> InferenceResultDTO:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found.")
            
        session = self.session_repo.get_by_id(session_id)
        if not session:
            session = InspectionSession(
                id=session_id,
                project_id=project_id,
                state=1
            )
            self.session_repo.create(session)
            
        model_type = project.domain_config.model_type
        if model_type not in self.model_registry:
            raise ValueError(f"Model type '{model_type}' not found in registry.")
            
        model_adapter = self.model_registry[model_type]()
        
        # 3. Predict
        # For demonstration, we use mocked detections, but in real life it calls:
        # detections = model_adapter.predict(frame, conf_threshold=0.25)
        
        detections = [
            Detection(
                id=str(uuid.uuid4()),
                session_id=session_id,
                class_label=ClassLabel(class_id=0, name="stator"),
                confidence=0.55,  # Intentionally low to trigger active learning
                bounding_box=BoundingBox(0, 0, 100, 100),
                contour=None,
                timestamp=datetime.utcnow()
            )
        ]
        
        # 4. Measure
        measurements = []
        
        # 5. Save Detections and Measurements
        self.detection_repo.save_batch(detections)
        self.measurement_repo.save_batch(measurements)
        
        # 6. Active Learning (MLOps)
        # If any detection confidence < 0.6, upload frame to Azure for review
        if self.active_learning:
            self.active_learning.collect_if_uncertain(frame, detections, threshold=0.6)
        
        # 7. Map to DTO
        return InferenceResultDTO(
            session_id=session_id,
            detections=detections,
            measurements=measurements,
            timestamp=datetime.utcnow()
        )
