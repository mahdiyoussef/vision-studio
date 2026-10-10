import os
import yaml
import logging
from pathlib import Path
from typing import Dict, List, Optional

from vision_studio.domain.entities.domain_config import (
    DomainConfig, ClassDefinition, MeasurementRule, 
    MeasurementGeometry, AlignmentConstraint, CalibrationType
)
from vision_studio.domain.value_objects.tolerance import ToleranceBand

logger = logging.getLogger(__name__)

class PluginManager:
    """
    Discovers and loads VisionStudio plugins (DomainConfigs) from a directory.
    """
    def __init__(self, plugins_dir: str = "plugins"):
        self.plugins_dir = Path(plugins_dir)
        self.loaded_configs: Dict[str, DomainConfig] = {}
        
    def discover_and_load(self) -> None:
        if not self.plugins_dir.exists():
            logger.warning(f"Plugins directory {self.plugins_dir} does not exist.")
            return
            
        for plugin_folder in self.plugins_dir.iterdir():
            if plugin_folder.is_dir():
                yaml_path = plugin_folder / "plugin.yaml"
                if yaml_path.exists():
                    self._load_plugin(yaml_path)
                    
    def _load_plugin(self, yaml_path: Path) -> None:
        try:
            with open(yaml_path, 'r') as f:
                data = yaml.safe_load(f)
                
            config = self._parse_yaml_to_domain_config(data)
            self.loaded_configs[config.domain_name] = config
            logger.info(f"Successfully loaded plugin: {config.domain_name}")
        except Exception as e:
            logger.error(f"Failed to load plugin from {yaml_path}: {e}")
            
    def _parse_yaml_to_domain_config(self, data: dict) -> DomainConfig:
        # Parse Classes
        classes = []
        for c in data.get("classes", []):
            classes.append(ClassDefinition(
                class_id=c.get("id", 0),
                name=c.get("name", "unknown"),
                color=tuple(c.get("color", [255, 255, 255])),
                family=c.get("family")
            ))
            
        # Parse Tolerances
        tolerances = {}
        for k, v in data.get("tolerances", {}).items():
            tolerances[k] = ToleranceBand(
                nominal=v.get("nominal", 0.0),
                lower=v.get("lower", 0.0),
                upper=v.get("upper", 0.0),
                unit=v.get("unit", "mm")
            )
            
        # Create Config
        return DomainConfig(
            domain_name=data.get("domain_name", "unnamed"),
            model_type=data.get("model_type", "yolo"),
            model_weights_path=data.get("model_weights_path", ""),
            camera_protocol=data.get("camera_protocol", "uvc"),
            class_definitions=classes,
            tolerance_thresholds=tolerances
            # Note: MeasurementRules and other fields can be parsed here similarly
        )
        
    def get_config(self, domain_name: str) -> Optional[DomainConfig]:
        return self.loaded_configs.get(domain_name)
        
    def list_configs(self) -> List[DomainConfig]:
        return list(self.loaded_configs.values())
