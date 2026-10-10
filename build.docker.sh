#!/bin/bash
set -e

echo "==========================================="
echo "   Building VisionStudio Docker Images     "
echo "==========================================="

echo "-> Building Backend Image (visionstudio-edge:latest)..."
docker build -t visionstudio-edge:latest -f Dockerfile .

echo "-> Building Frontend Image (visionstudio-ui:latest)..."
docker build -t visionstudio-ui:latest -f frontend/Dockerfile ./frontend

echo "==========================================="
echo "Build complete!"
echo "You can now start the entire stack using:"
echo "    docker compose up -d"
echo "==========================================="

