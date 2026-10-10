import os
import zipfile
import logging
from typing import Dict, List
from vision_studio.domain.ports.dataset_port import DatasetProviderInterface

logger = logging.getLogger(__name__)

class KaggleAdapter(DatasetProviderInterface):
    """Adapter for downloading datasets from Kaggle."""
    
    def download_dataset(self, identifier: str, dest_path: str, credentials: Dict[str, str]) -> bool:
        # Set credentials as env vars for Kaggle API
        if "username" in credentials and "key" in credentials:
            os.environ["KAGGLE_USERNAME"] = credentials["username"]
            os.environ["KAGGLE_KEY"] = credentials["key"]
        
        try:
            # We import kaggle here to ensure it uses the newly set env vars
            import kaggle
            kaggle.api.authenticate()
            
            logger.info(f"Downloading Kaggle dataset {identifier} to {dest_path}")
            os.makedirs(dest_path, exist_ok=True)
            
            kaggle.api.dataset_download_files(identifier, path=dest_path, force=True, quiet=False, unzip=False)
            
            # Find the downloaded zip and extract manually to avoid Kaggle API size mismatch bug
            for item in os.listdir(dest_path):
                if item.endswith(".zip"):
                    zip_path = os.path.join(dest_path, item)
                    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                        zip_ref.extractall(dest_path)
                    os.remove(zip_path) # Clean up zip after extraction
            
            return True
        except Exception as e:
            logger.error(f"Failed to download Kaggle dataset {identifier}: {e}")
            return False

    def list_files(self, path: str) -> List[str]:
        files = []
        for root, _, filenames in os.walk(path):
            for filename in filenames:
                # Store relative path
                rel_dir = os.path.relpath(root, path)
                if rel_dir == '.':
                    files.append(filename)
                else:
                    files.append(os.path.join(rel_dir, filename))
        return files

