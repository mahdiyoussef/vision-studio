from typing import List, Optional
import pymongo
from pymongo import MongoClient

from vision_studio.domain.entities.project import Project
from vision_studio.domain.entities.domain_config import DomainConfig
from vision_studio.domain.entities.detection import Detection
from vision_studio.domain.entities.measurement import Measurement
from vision_studio.domain.entities.inspection_session import InspectionSession
from vision_studio.domain.ports.repositories import (
    IProjectRepository,
    IDetectionRepository,
    IMeasurementRepository,
    ISessionRepository
)

class MongoProjectRepository(IProjectRepository):

    _mock_db = {}
    _is_mock = False

    def __init__(self, db=None, connection_string: Optional[str] = None, db_name: str = "vision_studio"):
        if db is not None:
            self.db = db
            self.client = getattr(db, "client", None)
        else:
            conn = connection_string or "mongodb://localhost:27017"
            self.client = MongoClient(conn, serverSelectionTimeoutMS=100)
            self.db = self.client[db_name]
        self.collection = self.db["projects"]
        
        # Fast fail check
        try:
            if self.client:
                self.client.server_info()
        except Exception:
            MongoProjectRepository._is_mock = True
            if not MongoProjectRepository._mock_db:
                # Seed starters
                from vision_studio.domain.entities.project import Project
                from vision_studio.domain.entities.domain_config import DomainConfig
                demo_1 = Project(id="proj_stator_01", name="Stator Motor Pin Inspection", description="Automated pin height and concentricity metrology", domain_config=DomainConfig(domain_name="stator", model_type="yolo"))
                demo_2 = Project(id="proj_chignon_02", name="Chignon Defect Metrology", description="Winding scratch and defect identification pipeline", domain_config=DomainConfig(domain_name="chignon", model_type="yolo"))
                demo_3 = Project(id="proj_cable_03", name="Cable Harness Color Validation", description="Pin sequence and insulation color validation", domain_config=DomainConfig(domain_name="cable", model_type="yolo"))
                MongoProjectRepository._mock_db = {p.id: p for p in [demo_1, demo_2, demo_3]}

    def save(self, project: Project) -> None:
        if MongoProjectRepository._is_mock:
            MongoProjectRepository._mock_db[project.id] = project
            return
        try:
            doc = {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "status": getattr(project, "status", "Paused"),
                "domain_config": {
                    "domain_name": getattr(project.domain_config, "domain_name", "custom"),
                    "model_type": getattr(project.domain_config, "model_type", "yolo"),
                    "camera_protocol": getattr(project.domain_config, "camera_protocol", "uvc")
                },
                "created_at": project.created_at.isoformat() if hasattr(project, "created_at") else None
            }
            self.collection.update_one({"id": project.id}, {"$set": doc}, upsert=True)
        except Exception:
            pass

    def get_by_id(self, project_id: str) -> Optional[Project]:
        if MongoProjectRepository._is_mock:
            return MongoProjectRepository._mock_db.get(project_id)
        try:
            doc = self.collection.find_one({"id": project_id})
            if doc:
                cfg = DomainConfig(
                    domain_name=doc.get("domain_config", {}).get("domain_name", "custom"),
                    model_type=doc.get("domain_config", {}).get("model_type", "yolo"),
                    camera_protocol=doc.get("domain_config", {}).get("camera_protocol", "uvc")
                )
                return Project(id=doc["id"], name=doc["name"], description=doc.get("description", ""), domain_config=cfg, status=doc.get("status", "Paused"))
        except Exception:
            pass
        return None

    def list_all(self) -> List[Project]:
        if MongoProjectRepository._is_mock:
            return list(MongoProjectRepository._mock_db.values())
        projects = []
        try:
            for doc in self.collection.find():
                cfg = DomainConfig(
                    domain_name=doc.get("domain_config", {}).get("domain_name", "custom"),
                    model_type=doc.get("domain_config", {}).get("model_type", "yolo"),
                    camera_protocol=doc.get("domain_config", {}).get("camera_protocol", "uvc")
                )
                projects.append(Project(id=doc["id"], name=doc["name"], description=doc.get("description", ""), domain_config=cfg, status=doc.get("status", "Paused")))
        except Exception:
            pass
            
        if not projects:
            demo_1 = Project(id="proj_stator_01", name="Stator Motor Pin Inspection", description="Automated pin height and concentricity metrology", domain_config=DomainConfig(domain_name="stator", model_type="yolo"))
            demo_2 = Project(id="proj_chignon_02", name="Chignon Defect Metrology", description="Winding scratch and defect identification pipeline", domain_config=DomainConfig(domain_name="chignon", model_type="yolo"))
            demo_3 = Project(id="proj_cable_03", name="Cable Harness Color Validation", description="Pin sequence and insulation color validation", domain_config=DomainConfig(domain_name="cable", model_type="yolo"))
            projects = [demo_1, demo_2, demo_3]
            for p in projects:
                self.save(p)
                
        return projects

    def delete(self, project_id: str) -> None:
        if MongoProjectRepository._is_mock:
            MongoProjectRepository._mock_db.pop(project_id, None)
            return
        try:
            self.collection.delete_one({"id": project_id})
        except Exception:
            pass


class MongoDetectionRepository(IDetectionRepository):
    def __init__(self, db=None, connection_string: Optional[str] = None, db_name: str = "vision_studio"):
        if db is not None:
            self.db = db
            self.client = getattr(db, "client", None)
        else:
            conn = connection_string or "mongodb://localhost:27017"
            self.client = MongoClient(conn, serverSelectionTimeoutMS=1500)
            self.db = self.client[db_name]
        self.collection = self.db["detections"]

    def save(self, detection: Detection) -> None:
        pass

    def save_batch(self, detections: List[Detection]) -> None:
        if not detections:
            return
        # doc_list = [serialize(d) for d in detections]
        # self.collection.insert_many(doc_list)
        pass

    def get_by_session(self, session_id: str) -> List[Detection]:
        return []


class MongoSessionRepository(ISessionRepository):
    def __init__(self, db=None, connection_string: Optional[str] = None, db_name: str = "vision_studio"):
        if db is not None:
            self.db = db
            self.client = getattr(db, "client", None)
        else:
            conn = connection_string or "mongodb://localhost:27017"
            self.client = MongoClient(conn, serverSelectionTimeoutMS=1500)
            self.db = self.client[db_name]
        self.collection = self.db["sessions"]

    def create(self, session: InspectionSession) -> None:
        pass

    def get_by_id(self, session_id: str) -> Optional[InspectionSession]:
        pass

    def update(self, session: InspectionSession) -> None:
        pass

    def list_by_project(self, project_id: str, limit: int = 50) -> List[InspectionSession]:
        return []

class MongoMeasurementRepository(IMeasurementRepository):
    def __init__(self, db=None, connection_string: Optional[str] = None, db_name: str = "vision_studio"):
        if db is not None:
            self.db = db
            self.client = getattr(db, "client", None)
        else:
            conn = connection_string or "mongodb://localhost:27017"
            self.client = MongoClient(conn, serverSelectionTimeoutMS=1500)
            self.db = self.client[db_name]
        self.collection = self.db["measurements"]

    def save(self, measurement: Measurement) -> None:
        pass

    def save_batch(self, measurements: List[Measurement]) -> None:
        pass

    def get_by_session(self, session_id: str) -> List[Measurement]:
        return []
