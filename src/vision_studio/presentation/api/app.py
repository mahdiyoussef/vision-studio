import os
import sys
from pathlib import Path

# Ensure src is on python path
src_dir = str(Path(__file__).resolve().parent.parent.parent.parent)
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import logging

from vision_studio.application.services.di_container import Container
from vision_studio.presentation.api.webrtc_server import start_webrtc_thread

def create_app(config_object=None) -> Flask:
    app = Flask(__name__)
    CORS(app)
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)

    if config_object:
        app.config.from_object(config_object)

    # Initialize DI Container
    container = Container()
    
    # Connect to MongoDB
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
    mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=100)
    db = mongo_client["vision_studio"]
    container.db.override(db)
    
    container.wire(modules=[
        "vision_studio.presentation.api.routes.inference",
        "vision_studio.presentation.api.routes.projects",
        "vision_studio.presentation.api.routes.mlops",
        "vision_studio.presentation.api.controllers.dataset_controller",
        "vision_studio.presentation.api.webrtc_server"
    ])
    app.container = container

    # Register blueprints
    from vision_studio.presentation.api.routes.inference import inference_bp
    from vision_studio.presentation.api.routes.projects import projects_bp
    from vision_studio.presentation.api.routes.webrtc import webrtc_bp
    from vision_studio.presentation.api.routes.auth_routes import auth_bp
    from vision_studio.presentation.api.routes.mlops import mlops_bp
    from vision_studio.presentation.api.routes.analytics import analytics_bp
    from vision_studio.presentation.api.routes.system import system_bp
    from vision_studio.presentation.api.controllers.dataset_controller import dataset_bp

    app.register_blueprint(inference_bp, url_prefix="/api/v1/inference")
    app.register_blueprint(projects_bp, url_prefix="/api/v1/projects")
    app.register_blueprint(webrtc_bp, url_prefix="/api/v1/webrtc")
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(mlops_bp, url_prefix="/api/v1/mlops")
    app.register_blueprint(analytics_bp, url_prefix="/api/v1/analytics")
    app.register_blueprint(system_bp, url_prefix="/api/v1/system")
    app.register_blueprint(dataset_bp)
    
    # Start WebRTC Background thread
    start_webrtc_thread()

    @app.route("/health")
    def health_check():
        return jsonify({"status": "healthy", "version": "0.1.0"})

    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f"Unhandled exception: {e}")
        return jsonify({"error": str(e)}), 500
        
    @app.errorhandler(ValueError)
    def handle_value_error(e):
        return jsonify({"error": str(e)}), 400

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5001, debug=True)
