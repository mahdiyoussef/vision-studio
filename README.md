# VisionStudio

VisionStudio is an enterprise-grade, multi-purpose Computer Vision Metrology platform. It is designed to run quality-assurance inspections on arbitrary industrial components (Stators, Chignons, Cables, etc.) using decoupled Domain-Driven Design (DDD).

Unlike legacy hardcoded scripts, VisionStudio is a completely generic platform that can connect to any camera and execute any ML model. It is **100% configurable via a modern Web UI**.

## Architecture

The project strictly follows **Domain-Driven Design (DDD)** and Clean Architecture.

- **`src/vision_studio/domain/`**: The pure-Python core. Contains Entities (`Project`, `Detection`, `Measurement`), Value Objects (`ToleranceBand`), and Abstract Ports (`ICameraAdapter`, `IModelAdapter`). It has **zero dependencies** on infrastructure, ML frameworks, or APIs.
- **`src/vision_studio/application/`**: Orchestrates the flow. Contains Use Cases (`RunInferenceUseCase`, `ManageProjectUseCase`), Data Transfer Objects (DTOs), and the Dependency Injection container.
- **`src/vision_studio/infrastructure/`**: The concrete implementations. Connects to the outside world (MongoDB, Azure Blob Storage, Ultralytics YOLO, PyTorch UNet, OpenCV Webcams, MindVision SDK).
- **`src/vision_studio/presentation/`**: Exposes the system via a Flask REST API, WebRTC streaming endpoints, and a JWT authentication layer.
- **`frontend/`**: A modern React SPA built with Vite, Tailwind CSS v4, and Lucide Icons. It completely replaces legacy YAML plugins with an intuitive visual editor.

## Key Features

1. **Universal Camera Support**: Connect to USB webcams (`UVCAdapter`), IP cameras (`RTSPAdapter`), or industrial machine vision cameras (`MindVisionAdapter`).
2. **Pluggable ML Models**: Swap out YOLO object detection or UNet segmentation without changing the core application logic.
3. **Dynamic Tolerances**: Define measurement pass/fail rules directly in the database or via the UI. The `MeasurementEngine` computes real-time pass/fail logic dynamically.
4. **Active Learning (MLOps)**: The system automatically detects low-confidence inferences on the edge and pushes the raw image frames to Azure Blob Storage for human review and retraining.
5. **Edge & Cloud Native**: Deploy to the cloud via Azure Kubernetes Service (Terraform/Helm), or deploy to the factory floor using the `docker-compose.yml` stack.

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

For factory-floor deployments (IoT / Edge), start the local stack:

```bash
make edge-up
```
This will launch the Flask API, the React UI, a local MongoDB instance, and the Cloud Sync agent.

## User Interface (React)

The new Frontend completely eliminates the need to manually edit `plugin.yaml` files. It features:
- **Projects Dashboard**: Manage unlimited active inspection domains.
- **Project Details**: Configure Domain Settings, Quality Assurance Tolerances, Measurement Rules, and Camera Hardware in one place.
- **Live Inspection Monitor**: Real-time WebRTC inference streaming with live HUD overlays, FPS metrics, and Yield/Defect shift stats.
- **MLOps & Training Studio**: Visually inspect the Model Registry, configure Confidence Thresholds, manage Active Learning sync rules, and train/fine-tune custom YOLO or ResNet models directly from the browser!
- **Filter Pipeline**: Build sequential image pre-processing graphs with live before/after previews.
- **Yield & Defect Analytics**: Live Pareto charts for QA tracking.

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
