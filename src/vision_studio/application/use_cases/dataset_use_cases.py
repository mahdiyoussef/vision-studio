import os
import shutil
import random
import csv
from typing import Dict, Any, Tuple
from vision_studio.domain.ports.dataset_port import DatasetTransformerInterface, DatasetProviderInterface

class DatasetUseCases:
    def __init__(self, provider: DatasetProviderInterface, transformer: DatasetTransformerInterface):
        self.provider = provider
        self.transformer = transformer
        
    def ingest_dataset(self, identifier: str, dest_path: str, credentials: Dict[str, str]) -> Dict[str, Any]:
        success = self.provider.download_dataset(identifier, dest_path, credentials)
        if not success:
            raise ValueError(f"Could not download dataset {identifier}")
            
        files = self.provider.list_files(dest_path)
        
        # Determine schema (find a CSV for bounding boxes, etc.)
        schema = {"files": files, "columns": []}
        for f in files:
            if f.endswith('.csv'):
                try:
                    with open(os.path.join(dest_path, f), 'r') as csvfile:
                        reader = csv.reader(csvfile)
                        headers = next(reader)
                        schema["columns"] = headers
                        schema["csv_file"] = f
                        break
                except Exception:
                    pass
        return schema

    def wrangle_dataset(self, source_dir: str, dest_dir: str, column_mapping: Dict[str, str], splits: Dict[str, float]) -> str:
        return self.transformer.split_and_format(source_dir, dest_dir, column_mapping, splits)

