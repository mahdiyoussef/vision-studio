from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Dict, List, Optional
from vision_studio.domain.value_objects.tolerance import ToleranceBand

class MeasurementGeometry(Enum):
    CENTROID_DISTANCE = auto()
    EDGE_DISTANCE = auto()
    DIAMETER = auto()
    AREA = auto()
    ANGLE = auto()

class AlignmentConstraint(Enum):
    HORIZONTAL = auto()
    VERTICAL = auto()
    ANY = auto()

class CalibrationType(Enum):
    IVW = auto()
    INTRINSICS = auto()
    REFERENCE = auto()
    MANUAL = auto()

@dataclass
class ClassDefinition:
    class_id: int
    name: str
    color: tuple[int, int, int]
    family: Optional[str] = None

@dataclass
class MeasurementRule:
    name: str
    source_class: str
    target_class: Optional[str] = None
    geometry: MeasurementGeometry = MeasurementGeometry.CENTROID_DISTANCE
    alignment_constraint: Optional[AlignmentConstraint] = None
    blocker_family: Optional[str] = None

@dataclass
class FilterStep:
    filter_name: str
    params: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ColorValidationConfig:
    enabled: bool = False
    classes_to_check: List[str] = field(default_factory=list)

@dataclass
class DomainConfig:
    """
    Defines what a domain looks like.
    Replaces hardcoded stator/chignon/file domains.
    """
    domain_name: str
    model_type: str = "yolo"
    model_weights_path: str = ""
    camera_protocol: str = "uvc"
    camera_connection: str = "0"
    
    class_definitions: List[ClassDefinition] = field(default_factory=list)
    measurement_rules: List[MeasurementRule] = field(default_factory=list)
    expected_counts: Optional[Dict[str, int]] = None
    preprocessing_pipeline: List[FilterStep] = field(default_factory=list)
    postprocessing_hooks: List[str] = field(default_factory=list)
    tolerance_thresholds: Dict[str, ToleranceBand] = field(default_factory=dict)
    calibration_method: CalibrationType = CalibrationType.MANUAL
    color_validation: Optional[ColorValidationConfig] = None
