from flask import Blueprint, request, jsonify
import os
from dependency_injector.wiring import inject, Provide
from vision_studio.application.services.di_container import Container
from vision_studio.application.use_cases.manage_project import ManageProjectUseCase
from vision_studio.application.use_cases.dataset_use_cases import DatasetUseCases
from vision_studio.infrastructure.external.kaggle_adapter import KaggleAdapter
from vision_studio.infrastructure.external.yolo_dataset_transformer import YoloDatasetTransformer

dataset_bp = Blueprint('dataset', __name__, url_prefix='/api/v1/datasets')

# Simple dependency injection setup (normally done via a DI container)
kaggle_adapter = KaggleAdapter()
yolo_transformer = YoloDatasetTransformer()
dataset_use_cases = DatasetUseCases(kaggle_adapter, yolo_transformer)

@dataset_bp.route('/kaggle', methods=['POST'])
def pull_kaggle_dataset():
    data = request.json
    slug = data.get('slug')
    credentials = data.get('credentials', {})
    
    if not slug:
        return jsonify({"error": "Missing dataset slug"}), 400
        
    dest_path = os.path.join("data", "raw", slug.replace('/', '_'))
    
    try:
        schema = dataset_use_cases.ingest_dataset(slug, dest_path, credentials)
        return jsonify({
            "message": "Dataset downloaded successfully",
            "path": dest_path,
            "schema": schema
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@dataset_bp.route('/wrangle', methods=['POST'])
@inject
def wrangle_dataset(project_use_case: ManageProjectUseCase = Provide[Container.manage_project_use_case]):
    project_id = request.args.get("project_id")
    data = request.json
    source_dir = data.get('source_dir')
    column_mapping = data.get('column_mapping')
    splits = data.get('splits', {'train': 70, 'val': 20, 'test': 10})
    
    if not source_dir or not column_mapping:
        return jsonify({"error": "Missing source_dir or column_mapping"}), 400
        
    dest_dir = source_dir.replace("raw", "processed") + "_yolo"
    
    try:
        config_path = dataset_use_cases.wrangle_dataset(source_dir, dest_dir, column_mapping, splits)
        
        # Save to project config if a project ID is provided
        if project_id:
            project = project_use_case.get_project(project_id)
            if project:
                # Add dataset_config_path to domain config (we can use an attribute, or store it in a generic dict if not defined)
                # Since we don't have it defined in DomainConfig, we can store it in some existing field or add it.
                # Let's see if we can just set an attribute. We'll set a generic attribute or re-use model_weights_path temporary
                # Wait, earlier in mlops.py start_training we did: data.get("dataset_config_path", "data.yaml")
                # So we can just save it to project.domain_config.dataset_config_path dynamically.
                setattr(project.domain_config, 'dataset_config_path', config_path)
                project_use_case.update_project(project)
        
        return jsonify({
            "message": "Dataset wrangled successfully",
            "config_path": config_path,
            "format": "YOLO"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

