import os
import logging
from pathlib import Path
try:
    from azure.storage.blob import BlobServiceClient
except ImportError:
    BlobServiceClient = None

logger = logging.getLogger(__name__)

class AzureModelDownloader:
    """
    Downloads Model Weights from Azure Blob Storage to the local cache directory.
    """
    
    def __init__(self, connection_string: str = "", container_name: str = "models", cache_dir: str = "/tmp/models"):
        self.connection_string = connection_string
        self.container_name = container_name
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.container_client = None
        
        if BlobServiceClient and self.connection_string:
            try:
                self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
                self.container_client = self.blob_service_client.get_container_client(self.container_name)
            except Exception as e:
                logger.error(f"Failed to initialize Azure Blob Service Client: {e}")

    def get_model(self, model_name: str) -> Path:
        """
        Returns the local Path to the model. 
        If it's not cached locally, downloads it from Azure.
        """
        local_path = self.cache_dir / model_name
        
        if local_path.exists():
            logger.info(f"Model {model_name} found in local cache.")
            return local_path
            
        if not self.container_client:
            raise RuntimeError("Azure Blob Service Client is not initialized.")
            
        logger.info(f"Downloading model {model_name} from Azure Blob Storage...")
        
        try:
            blob_client = self.container_client.get_blob_client(model_name)
            
            with open(local_path, "wb") as f:
                download_stream = blob_client.download_blob()
                f.write(download_stream.readall())
                
            logger.info(f"Successfully downloaded {model_name}.")
            return local_path
            
        except Exception as e:
            logger.error(f"Failed to download model {model_name}: {e}")
            if local_path.exists():
                local_path.unlink()
            raise
