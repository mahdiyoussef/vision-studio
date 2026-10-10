import pytest
from vision_studio.domain.entities.domain_config import (
    DomainConfig,
    ClassDefinition,
    MeasurementRule,
    MeasurementGeometry,
    AlignmentConstraint,
    FilterStep,
    CalibrationType,
    ColorValidationConfig
)
from vision_studio.domain.value_objects.tolerance import ToleranceBand

def test_domain_config_default_initialization():
    config = DomainConfig(domain_name="test_domain")
    
    assert config.domain_name == "test_domain"
    assert config.model_type == "yolo"
    assert config.camera_protocol == "uvc"
    assert config.class_definitions == []
    assert config.measurement_rules == []
    assert config.tolerance_thresholds == {}
    assert config.calibration_method == CalibrationType.MANUAL
    assert config.color_validation is None

def test_domain_config_full_initialization():
    classes = [
        ClassDefinition(class_id=0, name="stator", color=(255, 0, 0), family="main"),
        ClassDefinition(class_id=1, name="magnet", color=(0, 255, 0), family="part")
    ]
    
    rules = [
        MeasurementRule(
            name="stator_diameter",
            source_class="stator",
            geometry=MeasurementGeometry.DIAMETER
        ),
        MeasurementRule(
            name="stator_to_magnet",
            source_class="stator",
            target_class="magnet",
            geometry=MeasurementGeometry.EDGE_DISTANCE,
            alignment_constraint=AlignmentConstraint.ANY
        )
    ]
    
    tolerances = {
        "stator_diameter": ToleranceBand(nominal=120.0, upper=120.5, lower=119.5),
        "stator_to_magnet": ToleranceBand(nominal=5.0, upper=5.2, lower=4.8)
    }
    
    pipeline = [
        FilterStep(filter_name="clahe", params={"clip_limit": 2.0}),
        FilterStep(filter_name="blur", params={"ksize": 3})
    ]
    
    color_val = ColorValidationConfig(enabled=True, classes_to_check=["stator"])
    
    config = DomainConfig(
        domain_name="complex_domain",
        model_type="unet",
        model_weights_path="/path/to/weights.pt",
        camera_protocol="rtsp",
        camera_connection="rtsp://192.168.1.100/stream",
        class_definitions=classes,
        measurement_rules=rules,
        expected_counts={"stator": 1, "magnet": 12},
        preprocessing_pipeline=pipeline,
        postprocessing_hooks=["hook_1", "hook_2"],
        tolerance_thresholds=tolerances,
        calibration_method=CalibrationType.IVW,
        color_validation=color_val
    )
    
    assert config.domain_name == "complex_domain"
    assert config.model_type == "unet"
    assert config.camera_protocol == "rtsp"
    assert config.calibration_method == CalibrationType.IVW
    
    assert len(config.class_definitions) == 2
    assert config.class_definitions[0].name == "stator"
    
    assert len(config.measurement_rules) == 2
    assert config.measurement_rules[1].target_class == "magnet"
    
    assert config.expected_counts == {"stator": 1, "magnet": 12}
    
    assert len(config.preprocessing_pipeline) == 2
    assert config.preprocessing_pipeline[0].filter_name == "clahe"
    
    assert len(config.tolerance_thresholds) == 2
    assert config.tolerance_thresholds["stator_diameter"].nominal == 120.0
    
    assert config.color_validation.enabled is True
    assert config.color_validation.classes_to_check == ["stator"]

