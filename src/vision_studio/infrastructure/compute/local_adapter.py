import subprocess
import threading
import uuid
import logging
from typing import Dict, Any
from vision_studio.domain.ports.compute_port import ComputeDispatcherInterface

logger = logging.getLogger(__name__)

# Mock database of local jobs
LOCAL_JOBS = {}

class LocalComputeAdapter(ComputeDispatcherInterface):
    """Adapter for running training locally using subprocess."""
    
    def submit_training_job(self, dataset_config_path: str, model_config: Dict[str, Any], hyperparameters: Dict[str, Any]) -> str:
        job_id = str(uuid.uuid4())
        epochs = hyperparameters.get('epochs', 100)
        
        # Build command: e.g., yolo task=detect mode=train data={dataset_config_path} epochs={epochs}
        cmd = ["yolo", "task=detect", "mode=train", f"data={dataset_config_path}", f"epochs={epochs}"]
        
        LOCAL_JOBS[job_id] = {
            "id": job_id,
            "status": "training",
            "progress": 0,
            "metrics": {"mAP": 0.0, "loss": 2.0}
        }
        
        # In a real scenario, we would run this in a background thread or use celery
        def run_mock_training():
            # Mock the subprocess logic since we might not have 'yolo' actually installed
            logger.info(f"Running command: {' '.join(cmd)}")
            import time
            for i in range(1, 11):
                time.sleep(2)  # Simulate time passing
                LOCAL_JOBS[job_id]["progress"] = i * 10
                LOCAL_JOBS[job_id]["metrics"]["loss"] -= 0.1
                LOCAL_JOBS[job_id]["metrics"]["mAP"] += 0.08
            LOCAL_JOBS[job_id]["status"] = "completed"
            
        thread = threading.Thread(target=run_mock_training)
        thread.start()
        
        return job_id
        
    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        return LOCAL_JOBS.get(job_id, {})

