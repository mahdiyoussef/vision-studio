from flask import Blueprint, jsonify, request
from dependency_injector.wiring import inject, Provide
import uuid

from vision_studio.application.services.di_container import Container
from vision_studio.application.use_cases.manage_project import ManageProjectUseCase
from vision_studio.application.services.plugin_manager import PluginManager
from vision_studio.domain.entities.project import Project, DomainConfig
from vision_studio.domain.value_objects.tolerance import ToleranceBand
from vision_studio.presentation.api.auth import require_auth, require_admin

projects_bp = Blueprint("projects", __name__)

PROJECT_STATUSES = {}

@projects_bp.route("/plugins", methods=["GET"])
@require_admin
@inject
def list_plugins(
    plugin_manager: PluginManager = Provide[Container.plugin_manager]
):
    plugin_manager.discover_and_load()
    configs = plugin_manager.list_configs()
    
    return jsonify([{
        "domain_name": c.domain_name,
        "model_type": c.model_type,
        "classes": [cls.name for cls in c.class_definitions]
    } for c in configs])

@projects_bp.route("/from_plugin", methods=["POST"])
@require_admin
@inject
def create_project_from_plugin(
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case],
    plugin_manager: PluginManager = Provide[Container.plugin_manager]
):
    data = request.json
    domain_name = data.get("domain_name")
    
    plugin_manager.discover_and_load()
    config = plugin_manager.get_config(domain_name)
    
    if not config:
        return jsonify({"error": f"Plugin {domain_name} not found"}), 404
        
    project = Project(
        id=str(uuid.uuid4()),
        name=data.get("name", f"Project - {domain_name}"),
        description=f"Auto-generated from plugin {domain_name}",
        domain_config=config
    )
    
    use_case.create_project(project)
    
    return jsonify({
        "id": project.id,
        "name": project.name,
        "status": "created"
    }), 201

@projects_bp.route("", methods=["POST"])
@require_admin
@inject
def create_project(
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    data = request.json
    if not data or "name" not in data:
        return jsonify({"error": "Name is required"}), 400

    domain_data = data.get("domain_config", {})
    
    tolerances = {}
    for k, v in domain_data.get("tolerances", {}).items():
        tolerances[k] = ToleranceBand(
            nominal=v.get("nominal_value", 0.0),
            upper=v.get("upper_bound", 0.0),
            lower=v.get("lower_bound", 0.0)
        )
        
    domain_config = DomainConfig(
        domain_name=domain_data.get("domain_name", "custom_domain"),
        model_type=domain_data.get("model_type", "yolo"),
        model_weights_path=domain_data.get("model_weights_path", ""),
        camera_protocol=domain_data.get("camera_protocol", "uvc"),
        camera_connection=domain_data.get("camera_connection", "0"),
        tolerance_thresholds=tolerances
    )

    project = Project(
        id=str(uuid.uuid4()),
        name=data["name"],
        description=data.get("description", ""),
        domain_config=domain_config
    )
    
    use_case.create_project(project)
    
    return jsonify({
        "id": project.id,
        "name": project.name,
        "status": "created"
    }), 201

@projects_bp.route("/<project_id>", methods=["GET"])
@require_auth
@inject
def get_project(
    project_id: str,
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    project = use_case.get_project(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404
        
    return jsonify({
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "domain_config": {
            "model_type": project.domain_config.model_type,
            "camera_protocol": project.domain_config.camera_protocol
        }
    })

@projects_bp.route("", methods=["GET"])
@require_auth
@inject
def list_projects(
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    projects = use_case.list_projects()
    return jsonify([{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "status": p.status,
        "domain": p.domain_config.domain_name if hasattr(p, "domain_config") else "Custom"
    } for p in projects])

from vision_studio.domain.entities.domain_config import MeasurementRule, MeasurementGeometry, FilterStep

@projects_bp.route("/<project_id>/qa_config", methods=["GET"])
@require_auth
@inject
def get_qa_config(
    project_id: str,
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    project = use_case.get_project(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    result = []
    for k, v in project.domain_config.tolerance_thresholds.items():
        result.append({
            "id": k,
            "name": k.capitalize(),
            "nominal": str(v.nominal),
            "upper": f"+{v.upper}" if v.upper > 0 else str(v.upper),
            "lower": str(v.lower),
            "unit": "mm",
            "colorCheck": False
        })
    return jsonify(result)

@projects_bp.route("/<project_id>/qa_config", methods=["POST", "PUT"])
@require_auth
@inject
def update_qa_config(
    project_id: str,
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    data = request.json or []
    project = use_case.get_project(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    tolerances = {}
    for item in data:
        tid = item.get("id")
        if not tid:
            continue
        try:
            nominal = float(item.get("nominal", 0))
            upper_str = str(item.get("upper", "0")).replace('+', '')
            upper = float(upper_str)
            lower_str = str(item.get("lower", "0")).replace('+', '')
            lower = float(lower_str)
        except ValueError:
            nominal, upper, lower = 0.0, 0.0, 0.0
            
        tolerances[tid] = ToleranceBand(nominal=nominal, upper=upper, lower=lower)
        
    project.domain_config.tolerance_thresholds = tolerances
    use_case.update_project(project)
    
    return jsonify(data)

@projects_bp.route("/<project_id>/measurements", methods=["GET"])
@require_auth
@inject
def get_measurements(
    project_id: str,
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    project = use_case.get_project(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    result = []
    for i, rule in enumerate(project.domain_config.measurement_rules):
        rule_type = "Distance"
        if rule.geometry == MeasurementGeometry.ANGLE:
            rule_type = "Angle"
            
        result.append({
            "id": i + 1,
            "type": rule_type,
            "source": rule.source_class,
            "target": rule.target_class or "",
            "expected": "N/A"
        })
    return jsonify(result)

@projects_bp.route("/<project_id>/measurements", methods=["POST", "PUT"])
@require_auth
@inject
def update_measurements(
    project_id: str,
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    data = request.json or []
    project = use_case.get_project(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    rules = []
    for item in data:
        rule_type = item.get("type", "Distance")
        geom = MeasurementGeometry.CENTROID_DISTANCE
        if rule_type == "Angle":
            geom = MeasurementGeometry.ANGLE
        
        rules.append(MeasurementRule(
            name=f"Rule {item.get('id', '')}",
            source_class=item.get("source", ""),
            target_class=item.get("target", ""),
            geometry=geom
        ))
    project.domain_config.measurement_rules = rules
    use_case.update_project(project)
    return jsonify(data)

@projects_bp.route("/<project_id>/filter_nodes", methods=["GET"])
@require_auth
@inject
def get_filter_nodes(
    project_id: str,
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    project = use_case.get_project(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    pipeline = project.domain_config.preprocessing_pipeline
    if not pipeline:
        return jsonify([
            { "id": 1, "type": 'Grayscale', "active": True, "params": {} },
            { "id": 2, "type": 'Gaussian Blur', "active": True, "params": { "kernelSize": 5, "sigma": 1.0 } },
            { "id": 3, "type": 'Canny Edge', "active": False, "params": { "threshold1": 100, "threshold2": 200 } },
            { "id": 4, "type": 'CLAHE (Contrast)', "active": True, "params": { "clipLimit": 2.0, "tileGridSize": 8 } }
        ])
        
    result = []
    for i, step in enumerate(pipeline):
        result.append({
            "id": i + 1,
            "type": step.filter_name,
            "active": True,
            "params": step.params
        })
    return jsonify(result)

@projects_bp.route("/<project_id>/filter_nodes", methods=["POST", "PUT"])
@require_auth
@inject
def update_filter_nodes(
    project_id: str,
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    data = request.json or []
    project = use_case.get_project(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    pipeline = []
    for item in data:
        pipeline.append(FilterStep(
            filter_name=item.get("type", "Unknown"),
            params=item.get("params", {})
        ))
    project.domain_config.preprocessing_pipeline = pipeline
    use_case.update_project(project)
    return jsonify(data)

@projects_bp.route("/<project_id>", methods=["DELETE"])
@require_auth
@inject
def delete_project(
    project_id: str,
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    use_case.delete_project(project_id)
    return jsonify({"success": True})

@projects_bp.route("/<project_id>/toggle", methods=["POST"])
@require_auth
@inject
def toggle_project_status(
    project_id: str,
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    project = use_case.get_project(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404
        
    project.status = "Running" if project.status == "Paused" else "Paused"
    use_case.update_project(project)
    
    return jsonify({"id": project_id, "status": project.status})

@projects_bp.route("/<project_id>/cameras", methods=["GET"])
@require_auth
@inject
def get_cameras(
    project_id: str,
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    # Mocking discovered cameras for now
    return jsonify([
        {"id": "cam_0", "name": "Logitech BRIO", "protocol": "uvc", "status": "Connected"},
        {"id": "cam_1", "name": "Basler acA1920", "protocol": "gige", "status": "Disconnected"}
    ])

@projects_bp.route("/<project_id>/cameras/params", methods=["GET"])
@require_auth
@inject
def get_camera_params(
    project_id: str,
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    # Mocking camera parameters
    return jsonify({
        "exposure": 120,
        "gain": 50,
        "brightness": 100,
        "contrast": 100
    })

@projects_bp.route("/<project_id>/cameras/params", methods=["POST", "PUT"])
@require_auth
@inject
def update_camera_params(
    project_id: str,
    use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]
):
    data = request.json
    # Just echo back for mock
    return jsonify(data)
