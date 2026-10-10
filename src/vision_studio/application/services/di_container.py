from dependency_injector import containers, providers

# Import Use Cases
from vision_studio.application.use_cases.manage_project import ManageProjectUseCase
from vision_studio.application.use_cases.run_inference import RunInferenceUseCase

# Import Repositories
from vision_studio.infrastructure.persistence.mongo_repositories import (
    MongoProjectRepository,
    MongoDetectionRepository,
    MongoMeasurementRepository,
    MongoSessionRepository
)

# Import Adapters
from vision_studio.infrastructure.ml.yolo_adapter import YOLOAdapter
from vision_studio.infrastructure.camera.uvc_adapter import UVCAdapter
from vision_studio.infrastructure.camera.rtsp_adapter import RTSPAdapter
from vision_studio.infrastructure.ml.active_learning_service import ActiveLearningService

# Import Plugin Manager
from vision_studio.application.services.plugin_manager import PluginManager

class Container(containers.DeclarativeContainer):
    """Dependency Injection Container for VisionStudio."""
    
    config = providers.Configuration()
    
    # -------------------------------------------------------------
    # Infrastructure: Repositories
    # -------------------------------------------------------------
    db = providers.Dependency()
    
    project_repo = providers.Singleton(MongoProjectRepository, db=db)
    detection_repo = providers.Singleton(MongoDetectionRepository, db=db)
    measurement_repo = providers.Singleton(MongoMeasurementRepository, db=db)
    session_repo = providers.Singleton(MongoSessionRepository, db=db)
    
    # -------------------------------------------------------------
    # Infrastructure: Adapters
    # -------------------------------------------------------------
    yolo_adapter = providers.Factory(YOLOAdapter)
    
    uvc_adapter = providers.Factory(UVCAdapter)
    rtsp_adapter = providers.Factory(RTSPAdapter)
    
    model_registry = providers.Dict({
        "yolo": yolo_adapter
    })
    
    camera_registry = providers.Dict({
        "uvc": uvc_adapter,
        "rtsp": rtsp_adapter
    })
    
    # -------------------------------------------------------------
    # Application: Services
    # -------------------------------------------------------------
    plugin_manager = providers.Singleton(PluginManager, plugins_dir="plugins")
    active_learning = providers.Singleton(ActiveLearningService)
    
    # -------------------------------------------------------------
    # Application: Use Cases
    # -------------------------------------------------------------
    manage_project_use_case = providers.Factory(
        ManageProjectUseCase,
        project_repo=project_repo
    )
    
    run_inference_use_case = providers.Factory(
        RunInferenceUseCase,
        project_repo=project_repo,
        session_repo=session_repo,
        detection_repo=detection_repo,
        measurement_repo=measurement_repo,
        active_learning=active_learning,
        model_registry=model_registry
    )
