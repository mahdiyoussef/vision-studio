from flask import Blueprint, jsonify, request
from vision_studio.presentation.api.auth import require_auth
from dependency_injector.wiring import inject, Provide
from vision_studio.application.services.di_container import Container
from vision_studio.application.use_cases.manage_project import ManageProjectUseCase
import uuid
import random

from vision_studio.infrastructure.compute.local_adapter import LocalComputeAdapter

mlops_bp = Blueprint("mlops", __name__)

# Mock database for backward compatibility of deployment endpoint
TRAINING_JOBS = {}

local_compute = LocalComputeAdapter()

@mlops_bp.route("/train", methods=["POST"])
@require_auth
@inject
def start_training(project_use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]):
    data = request.json or {}
    project_id = request.args.get("project_id", "default_project")
    
    dataset_config = data.get("dataset_config_path")
    if not dataset_config:
        project = project_use_case.get_project(project_id)
        if project and hasattr(project.domain_config, 'dataset_config_path'):
            dataset_config = project.domain_config.dataset_config_path
        else:
            dataset_config = "data.yaml"
            
    job_id = local_compute.submit_training_job(
        dataset_config, 
        {"model_type": data.get("model_type", "yolo")}, 
        {"epochs": data.get("epochs", 100)}
    )
    
    # Store for deployment mock
    TRAINING_JOBS[job_id] = {
        "project_id": project_id,
        "compute_target": "local"
    }
    
    return jsonify({"job_id": job_id, "status": "started", "compute": "local"}), 201

@mlops_bp.route("/jobs/<job_id>", methods=["GET"])
@require_auth
def get_job_status(job_id):
    job = local_compute.get_job_status(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
            
    return jsonify(job)

@mlops_bp.route("/deploy/<job_id>", methods=["POST"])
@require_auth
def deploy_model(job_id):
    job = TRAINING_JOBS.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
        
    job["status"] = "deployed"
    return jsonify({"message": f"Model {job_id} deployed to edge."})

# Mock data for model registry scoped by project
MOCK_MODELS = {
    "default_project": [
        { "id": "stator-yolo-v3", "name": "stator_yolov8_best.pt", "type": "Object Detection", "architecture": "YOLOv8", "size": "24.5 MB", "status": "Active" },
        { "id": "chignon-seg-v1", "name": "chignon_unet_v1.onnx", "type": "Segmentation", "architecture": "UNet", "size": "89.2 MB", "status": "Archived" },
        { "id": "defect-class-v2", "name": "resnet50_defects.pt", "type": "Classification", "architecture": "ResNet50", "size": "110.1 MB", "status": "Standby" },
    ]
}

MLOPS_SETTINGS = {}

@mlops_bp.route("/models", methods=["GET"])
@require_auth
def get_models():
    project_id = request.args.get("project_id", "default_project")
    models = MOCK_MODELS.get(project_id, [])
    return jsonify(models)

@mlops_bp.route("/settings", methods=["GET"])
@require_auth
def get_settings():
    project_id = request.args.get("project_id", "default_project")
    if project_id not in MLOPS_SETTINGS:
        MLOPS_SETTINGS[project_id] = {
            "activeLearningEnabled": True,
            "confidenceThreshold": 0.75,
            "nmsIouThreshold": 0.45,
            "uncertaintyThreshold": 0.60
        }
    return jsonify(MLOPS_SETTINGS[project_id])

@mlops_bp.route("/settings", methods=["PUT"])
@require_auth
def update_settings():
    project_id = request.args.get("project_id", "default_project")
    data = request.json or {}
    if project_id not in MLOPS_SETTINGS:
        MLOPS_SETTINGS[project_id] = {
            "activeLearningEnabled": True,
            "confidenceThreshold": 0.75,
            "nmsIouThreshold": 0.45,
            "uncertaintyThreshold": 0.60
        }
    MLOPS_SETTINGS[project_id].update(data)
    return jsonify(MLOPS_SETTINGS[project_id])
