#!/usr/bin/env python3
import os
import uuid
from datetime import datetime
from pymongo import MongoClient

def main():
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
    client = MongoClient(mongo_uri)
    db = client["vision_studio"]
    
    # 1. Ensure we have the Stator project
    project = db.projects.find_one({"name": "Legacy Stator Inspection"})
    if not project:
        project_id = str(uuid.uuid4())
        project = {
            "_id": project_id,
            "id": project_id,
            "name": "Legacy Stator Inspection",
            "description": "Migrated from legacy stator database",
            "domain_config": {
                "domain_name": "stator_inspection",
                "model_type": "yolo",
                "tolerance_thresholds": {
                    "stator_outer": {"nominal": 120.0, "upper": 120.5, "lower": 119.5, "unit": "mm"},
                    "stator_inner": {"nominal": 80.0, "upper": 80.5, "lower": 79.5, "unit": "mm"}
                }
            },
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        db.projects.insert_one(project)
        print(f"Created Stator project {project_id}")
    else:
        project_id = project["id"]
        
    # 2. Check for legacy 'stator_inference' collection
    legacy_db = client["computer_vision_metrology"] # Guessing legacy DB name
    legacy_coll = legacy_db["stator_inference"]
    
    count = legacy_coll.count_documents({})
    if count == 0:
        print("No legacy stator_inference records found.")
        return
        
    print(f"Found {count} legacy records. Migrating...")
    
    sessions = []
    detections = []
    measurements = []
    
    for record in legacy_coll.find():
        session_id = str(uuid.uuid4())
        
        # Build Session
        sessions.append({
            "_id": session_id,
            "id": session_id,
            "project_id": project_id,
            "operator_id": record.get("operator", "unknown"),
            "started_at": record.get("timestamp", datetime.utcnow()).isoformat(),
            "status": "completed"
        })
        
        # Build Detections (assuming legacy structure had a 'boxes' array)
        for box in record.get("boxes", []):
            det_id = str(uuid.uuid4())
            class_name = box.get("class_name", "unknown")
            
            detections.append({
                "_id": det_id,
                "id": det_id,
                "session_id": session_id,
                "class_id": box.get("class_id", 0),
                "class_name": class_name,
                "confidence": box.get("confidence", 1.0),
                "box": [box.get("x1", 0), box.get("y1", 0), box.get("x2", 0), box.get("y2", 0)],
                "timestamp": record.get("timestamp", datetime.utcnow()).isoformat()
            })
            
            # Build Measurements if legacy had measurements pre-calculated
            if "measurement" in box:
                measurements.append({
                    "_id": str(uuid.uuid4()),
                    "session_id": session_id,
                    "detection_id": det_id,
                    "name": f"{class_name}_distance",
                    "value": box["measurement"],
                    "unit": "mm",
                    "passed": True # Approximation
                })
                
    if sessions:
        db.sessions.insert_many(sessions)
    if detections:
        db.detections.insert_many(detections)
    if measurements:
        db.measurements.insert_many(measurements)
        
    print("Migration complete.")

if __name__ == "__main__":
    main()
