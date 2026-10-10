#!/usr/bin/env python3
import os
import sys
from pathlib import Path
from azure.storage.blob import BlobServiceClient

def main():
    conn_str = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
    if not conn_str:
        print("Error: AZURE_STORAGE_CONNECTION_STRING environment variable is not set.")
        sys.exit(1)
        
    container_name = "models"
    
    blob_service_client = BlobServiceClient.from_connection_string(conn_str)
    container_client = blob_service_client.get_container_client(container_name)
    
    # Create container if it doesn't exist
    try:
        container_client.create_container()
        print(f"Created container '{container_name}'")
    except Exception:
        pass # Already exists
        
    models_dir = Path("weights")
    if not models_dir.exists():
        print(f"Error: {models_dir} directory not found.")
        sys.exit(1)
        
    for model_file in models_dir.glob("*.pt"): # For YOLO/PyTorch
        blob_client = container_client.get_blob_client(model_file.name)
        print(f"Uploading {model_file.name}...")
        with open(model_file, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
            
    print("Upload complete.")

if __name__ == "__main__":
    main()
