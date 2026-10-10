import pytest
import numpy as np
from datetime import datetime

from vision_studio.application.use_cases.run_inference import RunInferenceUseCase
from vision_studio.domain.ports.model_port import IModelAdapter, ModelInfo
from vision_studio.domain.entities.project import Project
from vision_studio.domain.entities.inspection_session import InspectionSession

class MockProjectRepository:
    def __init__(self, project=None):
        self.project = project
        
    def get_by_id(self, project_id):
        if self.project and self.project.id == project_id:
            return self.project
        return None
        
    def save(self, project): pass
    def list_all(self): return []
    def delete(self, project_id): pass

class MockSessionRepository:
    def __init__(self, session=None):
        self.session = session
        self.created = False
        
    def get_by_id(self, session_id):
        if self.session and self.session.id == session_id:
            return self.session
        return None
        
    def create(self, session):
        self.session = session
        self.created = True
        
    def update(self, session): pass
    def list_by_project(self, p, l): return []

class MockDetectionRepository:
    def __init__(self):
        self.saved_detections = []
    def save(self, d): pass
    def save_batch(self, batch): self.saved_detections.extend(batch)
    def get_by_session(self, s): return []

class MockMeasurementRepository:
    def __init__(self):
        self.saved_measurements = []
    def save(self, m): pass
    def save_batch(self, batch): self.saved_measurements.extend(batch)
    def get_by_session(self, s): return []

class MockModelAdapter(IModelAdapter):
    def load(self, weights_path, device="cpu"): pass
    def predict(self, frame, conf_threshold=0.25): return []
    def get_info(self): return ModelInfo("mock", "mock", (1,1), 1)
    def unload(self): pass

def test_run_inference_success(dummy_project):
    project_repo = MockProjectRepository(dummy_project)
    session_repo = MockSessionRepository()
    detection_repo = MockDetectionRepository()
    measurement_repo = MockMeasurementRepository()
    
    model_registry = {"yolo": MockModelAdapter}
    
    use_case = RunInferenceUseCase(
        project_repo=project_repo,
        session_repo=session_repo,
        detection_repo=detection_repo,
        measurement_repo=measurement_repo,
        model_registry=model_registry
    )
    
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    
    # Execute
    result = use_case.execute(dummy_project.id, "session_123", frame)
    
    # Assert
    assert result.session_id == "session_123"
    assert session_repo.created is True # Session was automatically created
    assert len(detection_repo.saved_detections) == 1 # Mock returns 1 detection
    assert len(measurement_repo.saved_measurements) == 0

def test_run_inference_project_not_found():
    project_repo = MockProjectRepository(None) # No project
    use_case = RunInferenceUseCase(project_repo, MockSessionRepository(), MockDetectionRepository(), MockMeasurementRepository(), {})
    
    with pytest.raises(ValueError, match="Project bad_id not found"):
        use_case.execute("bad_id", "session_123", np.zeros((10,10,3)))
