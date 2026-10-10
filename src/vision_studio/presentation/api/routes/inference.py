from flask import Blueprint, jsonify, request
from dependency_injector.wiring import inject, Provide
import cv2
import numpy as np

from vision_studio.application.services.di_container import Container
from vision_studio.application.use_cases.run_inference import RunInferenceUseCase
from vision_studio.presentation.api.auth import require_auth

inference_bp = Blueprint("inference", __name__)

@inference_bp.route("/predict", methods=["POST"])
@require_auth
@inject
def predict(
    use_case: RunInferenceUseCase = Provide[Container.run_inference_use_case]
):
    project_id = request.form.get("project_id") or request.args.get("project_id")
    if not project_id:
        return jsonify({"error": "project_id is required"}), 400
        
    if "image" not in request.files:
        return jsonify({"error": "image file is required"}), 400
        
    file = request.files["image"]
    file_bytes = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    
    if frame is None:
        return jsonify({"error": "Failed to decode image"}), 400
        
    try:
        dto = use_case.execute(project_id, "temp_session", frame)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
    # Serialize results
    results = {
        "project_id": dto.project_id,
        "session_id": dto.session_id,
        "timestamp": dto.timestamp.isoformat(),
        "detections": [
            {
                "class_name": d.class_name,
                "confidence": d.confidence,
                "box": [d.box.x_min, d.box.y_min, d.box.x_max, d.box.y_max] if d.box else []
            } for d in dto.detections
        ],
        "measurements": [
            {
                "name": m.name,
                "value": m.value,
                "passed": m.passed,
                "unit": m.unit
            } for m in dto.measurements
        ]
    }
    
    return jsonify(results)
