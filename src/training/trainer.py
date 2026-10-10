import yaml
import logging
from pathlib import Path

from vision_studio.application.services.plugin_manager import PluginManager

logger = logging.getLogger(__name__)

class VisionStudioTrainer:
    """
    Generalizes training by reading the DomainConfig and dynamically building
    the data structure (e.g. YOLO's data.yaml) required by the ML backend.
    """
    def __init__(self, domain_name: str, dataset_path: str, plugins_dir: str = "plugins"):
        self.plugin_manager = PluginManager(plugins_dir=plugins_dir)
        self.plugin_manager.discover_and_load()
        self.domain_config = self.plugin_manager.get_config(domain_name)
        self.dataset_path = Path(dataset_path)
        
        if not self.domain_config:
            raise ValueError(f"Domain {domain_name} not found in plugins.")
            
    def prepare_dataset_config(self, output_path: str = "data.yaml") -> None:
        """
        Generates the standard dataset configuration file (e.g. YOLO format)
        by iterating over the DomainConfig.class_definitions.
        """
        # YOLO format expects a dictionary mapping id -> name
        names_dict = {}
        for cls in self.domain_config.class_definitions:
            names_dict[cls.class_id] = cls.name
            
        data = {
            "path": str(self.dataset_path.absolute()),
            "train": "images/train",
            "val": "images/val",
            "test": "images/test",
            "names": names_dict
        }
        
        with open(output_path, 'w') as f:
            yaml.dump(data, f, default_flow_style=False)
            
        logger.info(f"Generated dynamic dataset config at {output_path} with {len(names_dict)} classes.")
        
    def train(self, epochs: int = 100):
        """
        Invokes the underlying ML framework (YOLO, UNet) based on the domain config.
        """
        self.prepare_dataset_config()
        
        if self.domain_config.model_type == "yolo":
            logger.info("Initializing YOLO training pipeline...")
            # e.g., from ultralytics import YOLO
            # model = YOLO("yolov8n.pt")
            # model.train(data="data.yaml", epochs=epochs)
            print(f"--- FAKE YOLO TRAINING STARTED for {epochs} epochs ---")
        elif self.domain_config.model_type == "unet":
            logger.info("Initializing UNet training pipeline...")
            # Setup custom dataloaders for masks
            print(f"--- FAKE UNET TRAINING STARTED for {epochs} epochs ---")
        else:
            raise ValueError(f"Unsupported model_type: {self.domain_config.model_type}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--domain", required=True, help="Domain name (e.g., stator_inspection)")
    parser.add_argument("--dataset", required=True, help="Path to the dataset directory")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    args = parser.parse_args()
    
    trainer = VisionStudioTrainer(domain_name=args.domain, dataset_path=args.dataset)
    trainer.train(epochs=args.epochs)
