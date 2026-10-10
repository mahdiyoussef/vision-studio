from flask import Blueprint, jsonify, request
from vision_studio.presentation.api.auth import require_auth
from datetime import datetime, timedelta
import random

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/", methods=["GET"])
@require_auth
def get_analytics():
    project_id = request.args.get("project_id", "default_project")
    # Use project_id as seed for deterministic mock data
    random.seed(project_id)
    
    total_inferences = random.randint(50000, 200000)
    low_confidence_count = random.randint(500, 2000)
    avg_confidence = round(random.uniform(88.0, 96.0), 1)
    
    daily_inferences = [random.randint(5000, 25000) for _ in range(7)]
    
    class_distribution = [
        {"name": "Person", "count": random.randint(10000, 20000), "percent": 45, "color": "bg-emerald-500"},
        {"name": "Car", "count": random.randint(5000, 12000), "percent": 26, "color": "bg-blue-500"},
        {"name": "Bicycle", "count": random.randint(2000, 8000), "percent": 18, "color": "bg-indigo-500"},
        {"name": "Motorcycle", "count": random.randint(500, 3000), "percent": 11, "color": "bg-purple-500"}
    ]
    
    # reset seed
    random.seed()
    
    return jsonify({
        "kpi": {
            "total_inferences": total_inferences,
            "avg_confidence": avg_confidence,
            "low_confidence_count": low_confidence_count,
            "active_learning_synced": round(low_confidence_count * 0.8) # 80% of low conf pushed to edge
        },
        "daily_inferences": daily_inferences,
        "class_distribution": class_distribution
    })
