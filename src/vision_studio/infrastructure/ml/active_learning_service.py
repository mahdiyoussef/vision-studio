import os
import uuid
import logging
from typing import Optional
from pathlib import Path
import numpy as np
import cv2

logger = logging.getLogger(__name__)

class ActiveLearningService:
    """
    Handles MLOps Active Learning by saving low-confidence images locally
    so they can be labeled and used in the next training loop.
    """
    def __init__(self, queue_dir: Optional[str] = None):
        self.queue_dir = Path(queue_dir or os.environ.get("ACTIVE_LEARNING_QUEUE_DIR", "data/active_learning_queue"))
        try:
            self.queue_dir.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logger.error(f"Failed to create active learning directory: {e}")

    def collect_if_uncertain(self, frame: np.ndarray, detections: list, threshold: float = 0.6) -> None:
        """
        If any detection has a confidence lower than the threshold, 
        save the image to the cloud for manual review and retraining.
        """
        is_uncertain = any(d.confidence < threshold for d in detections)
        if not is_uncertain:
            return
            
        filename = f"review_{uuid.uuid4().hex}.jpg"
        target_path = self.queue_dir / filename
        
        try:
            cv2.imwrite(str(target_path), frame)
            logger.info(f"Active Learning: Saved {filename} to local queue due to low confidence.")
        except Exception as e:
            logger.error(f"Active Learning local save failed: {e}")
