from abc import ABC, abstractmethod
from typing import Dict, Any

class ComputeDispatcherInterface(ABC):
    """Port for dispatching training jobs to different compute environments."""
    
    @abstractmethod
    def submit_training_job(self, dataset_config_path: str, model_config: Dict[str, Any], hyperparameters: Dict[str, Any]) -> str:
        """Submit a training job and return a job ID."""
        pass
        
    @abstractmethod
    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get the current status and metrics of a job."""
        pass

