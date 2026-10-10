#!/bin/bash
set -e

echo "==========================================="
echo "   Building VisionStudio Docker Images     "
echo "==========================================="

echo "-> Building Python API Backend Image..."
docker build -t vision_studio_backend -f Dockerfile.server_app .

echo "-> Building React Frontend Image..."
docker build -t vision_studio_frontend -f frontend/Dockerfile .

echo "==========================================="
echo "   Build Complete!                         "
echo "==========================================="
