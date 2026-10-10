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
    
    total_inspected = random.randint(5000, 20000)
    total_defects = random.randint(100, 600)
    overall_yield = round(100.0 - (total_defects / total_inspected * 100), 1)
    
    daily_yields = [random.randint(94, 99) for _ in range(7)]
    
    pareto = [
        {"name": "Scratch on Surface", "count": random.randint(100, 200), "percent": 45, "color": "bg-red-500"},
        {"name": "Out of Tolerance (Width)", "count": random.randint(80, 150), "percent": 26, "color": "bg-orange-500"},
        {"name": "Missing Component", "count": random.randint(50, 100), "percent": 18, "color": "bg-yellow-500"},
        {"name": "Color/Oxidation", "count": random.randint(10, 50), "percent": 11, "color": "bg-blue-400"}
    ]
    
    # reset seed
    random.seed()
    
    return jsonify({
        "kpi": {
            "total_inspected": total_inspected,
            "overall_yield": overall_yield,
            "total_defects": total_defects,
            "false_rejects": 1.4
        },
        "daily_yields": daily_yields,
        "pareto": pareto
    })
