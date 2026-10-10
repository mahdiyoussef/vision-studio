# Vision Studio

Vision Studio is a platform designed to make Computer Vision **easy, accessible, and highly configurable**. Whether you are building smart applications, running visual intelligence tasks, or exploring AI, Vision Studio democratizes ML model deployment by abstracting the complexities of inference, hardware, and MLOps.

Unlike legacy hardcoded scripts, Vision Studio is a completely generic platform that can connect to any camera and execute any ML model. It is **100% configurable via a modern Web UI**.

## Key Features

1. **Universal Camera Support**: Connect to USB webcams (`UVCAdapter`), IP cameras (`RTSPAdapter`), or specialized machine vision cameras (like `MindVisionAdapter`).
2. **Pluggable ML Models**: Swap out YOLO object detection or UNet segmentation without changing the core application logic.
3. **Dynamic Rule Engine**: Define logic, regions of interest, and custom rules directly in the database or via the UI.
4. **Data Studio & MLOps**: Ingest datasets (e.g., from Kaggle), wrangle data, and automatically manage active learning. The system detects low-confidence inferences and pushes raw image frames to Blob Storage for human review and retraining.
5. **Edge & Cloud Native**: Deploy to the cloud via Azure Kubernetes Service (Terraform/Helm), or run it locally using the `docker-compose.yml` stack.

## Architecture

The project is built on **Domain-Driven Design (DDD)** and Clean Architecture.

- **`src/vision_studio/domain/`**: The pure-Python core. Contains Entities (`Project`, `Detection`), Value Objects, and Abstract Ports (`ICameraAdapter`, `IModelAdapter`). It has **zero dependencies** on infrastructure, ML frameworks, or APIs.
- **`src/vision_studio/application/`**: Orchestrates the flow. Contains Use Cases (`RunInferenceUseCase`, `ManageProjectUseCase`), Data Transfer Objects (DTOs), and the Dependency Injection container.
- **`src/vision_studio/infrastructure/`**: The concrete implementations. Connects to the outside world (MongoDB, Azure Blob Storage, Ultralytics YOLO, PyTorch UNet, OpenCV Webcams, etc.).
- **`src/vision_studio/presentation/`**: Exposes the system via a Flask REST API, WebRTC streaming endpoints, and a JWT authentication layer.
- **`frontend/`**: A modern React SPA built with Vite, Tailwind CSS v4, and Lucide Icons. It provides an intuitive visual editor for configuring projects, models, and data pipelines.

## Installation & Setup

We recommend using Python 3.11+ and Node.js 20+.

### 1. Backend Setup

```bash
# Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies and the vision_studio package
pip install -e .[dev,test,cameras,azure,gpu]
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The React UI will be available at `http://localhost:5173` (or the port specified in terminal).

### 3. Edge Deployment (Docker Compose)

For edge computing deployments or quick local evaluation, start the local stack:

```bash
make edge-up
```
This will launch the Flask API, the React UI, a local MongoDB instance, and the Cloud Sync agent.

## User Interface (React)

The Vision Studio Frontend features:
- **Projects Dashboard**: Manage unlimited computer vision projects and domains.
- **Project Details**: Configure Domain Settings, Rules, and Camera Hardware in one place.
- **Live Inference Monitor**: Real-time WebRTC inference streaming with live HUD overlays, FPS metrics, and analytics.
- **Data Studio & Training**: Visually inspect the Model Registry, configure Confidence Thresholds, ingest datasets, and train/fine-tune custom YOLO or ResNet models directly from the browser!
- **Filter Pipeline**: Build sequential image pre-processing graphs with live before/after previews.
- **Analytics & Telemetry**: Live charts and real-time hardware telemetry (CPU, GPU, Storage).

## Testing

Run the test suite to ensure the domain rules are intact:

```bash
PYTHONPATH=src pytest tests/
```

## Cloud Infrastructure (Azure)

The `terraform/` directory contains complete Infrastructure-as-Code to provision:
- Azure Kubernetes Service (AKS)
- Azure Container Registry (ACR)
- Azure Cosmos DB (MongoDB API)
- Azure Blob Storage (for MLOps active learning and model weights)
- Azure Key Vault & Application Insights

To deploy manually:
```bash
cd terraform/
terraform init
terraform apply
```
