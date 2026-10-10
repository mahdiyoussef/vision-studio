from flask import Blueprint, request, jsonify, Response
import os
import json
import time
from dependency_injector.wiring import inject, Provide
from vision_studio.application.services.di_container import Container
from vision_studio.application.use_cases.manage_project import ManageProjectUseCase
from vision_studio.application.use_cases.dataset_use_cases import DatasetUseCases
from vision_studio.infrastructure.external.kaggle_adapter import KaggleAdapter
from vision_studio.infrastructure.external.yolo_dataset_transformer import YoloDatasetTransformer
from vision_studio.application.services.job_manager import job_manager

dataset_bp = Blueprint('dataset', __name__, url_prefix='/api/v1/datasets')

kaggle_adapter = KaggleAdapter()
yolo_transformer = YoloDatasetTransformer()
dataset_use_cases = DatasetUseCases(kaggle_adapter, yolo_transformer)

def _download_task(slug, dest_path, credentials, job_id):
    job_manager.update_job(job_id, progress=10, message="Authenticating with Kaggle...")
    # Because downloading blocks, we simulate progress steps
    job_manager.update_job(job_id, progress=30, message="Downloading dataset archive...")
    schema = dataset_use_cases.ingest_dataset(slug, dest_path, credentials)
    job_manager.update_job(job_id, progress=90, message="Extracting and indexing...")
    return {"path": dest_path, "schema": schema}

@dataset_bp.route('/kaggle', methods=['POST'])
def pull_kaggle_dataset():
    data = request.json
    slug = data.get('slug')
    credentials = data.get('credentials', {})
    
    if not slug:
        return jsonify({"error": "Missing dataset slug"}), 400
        
    dest_path = os.path.join("data", "raw", slug.replace('/', '_'))
    
    # Queue job
    job_id = job_manager.submit("Kaggle Pull", _download_task, slug, dest_path, credentials, job_id=None)
    
    return jsonify({
        "message": "Download job started",
        "job_id": job_id
    })

def _wrangle_task(source_dir, dest_dir, column_mapping, splits, project_use_case, project_id, job_id):
    job_manager.update_job(job_id, progress=20, message="Validating schema and parsing columns...")
    # Artificial small delay to let UI show progress
    time.sleep(1)
    job_manager.update_job(job_id, progress=50, message="Processing bounding boxes and moving images...")
    config_path = dataset_use_cases.wrangle_dataset(source_dir, dest_dir, column_mapping, splits)
    job_manager.update_job(job_id, progress=85, message="Writing YOLO YAML config...")
    
    if project_id:
        project = project_use_case.get_project(project_id)
        if project:
            setattr(project.domain_config, 'dataset_config_path', config_path)
            project_use_case.update_project(project)
            
    return {"config_path": config_path, "format": "YOLO"}

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
    
    job_id = job_manager.submit("Dataset Wrangle", _wrangle_task, source_dir, dest_dir, column_mapping, splits, project_use_case, project_id, job_id=None)
    
    return jsonify({
        "message": "Wrangle job started",
        "job_id": job_id
    })

@dataset_bp.route('/jobs/<job_id>', methods=['GET'])
def get_job_status(job_id):
    job = job_manager.get_job(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(job)

@dataset_bp.route('/jobs/<job_id>/stream', methods=['GET'])
def stream_job_status(job_id):
    def event_stream():
        # Stream job updates every 0.5s via SSE
        while True:
            job = job_manager.get_job(job_id)
            if not job:
                yield f"data: {json.dumps({'error': 'Job not found'})}\n\n"
                break
                
            yield f"data: {json.dumps(job)}\n\n"
            
            if job['status'] in ['completed', 'failed']:
                break
            time.sleep(0.5)
            
    return Response(event_stream(), mimetype="text/event-stream")
