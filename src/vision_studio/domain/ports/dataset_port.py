from abc import ABC, abstractmethod
from typing import Dict, Any, List

class DatasetProviderInterface(ABC):
    """Port for interacting with external dataset providers like Kaggle."""
    
    @abstractmethod
    def download_dataset(self, identifier: str, dest_path: str, credentials: Dict[str, str]) -> bool:
        """Download and extract a dataset to the destination path."""
        pass
        
    @abstractmethod
    def list_files(self, path: str) -> List[str]:
        """List files in the downloaded dataset."""
        pass

class DatasetTransformerInterface(ABC):
    """Port for transforming datasets into standard ML formats (YOLO/COCO)."""
    
    @abstractmethod
    def split_and_format(self, source_dir: str, dest_dir: str, column_mapping: Dict[str, str], split_ratios: Dict[str, float]) -> str:
        """Transform data based on column mapping and splits, returning the path to the config (e.g. data.yaml)."""
        pass

