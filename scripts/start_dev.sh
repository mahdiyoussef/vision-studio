#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=== VisionStudio Local Development Runner ==="

# Check MongoDB
if ! docker ps --format '{{.Names}}' | grep -q "^vs-mongo-dev$"; then
    echo "[1/3] Starting MongoDB container (vs-mongo-dev)..."
    docker start vs-mongo-dev 2>/dev/null || docker run -d --name vs-mongo-dev -p 27017:27017 mongo:6.0
else
    echo "[1/3] MongoDB container is running."
fi

# Kill any existing stale processes on ports 5000 and 5173/5174
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
fuser -k 5174/tcp 2>/dev/null || true

echo "[2/3] Starting Flask API backend on http://localhost:5000..."
./venv/bin/python src/vision_studio/presentation/api/app.py &
API_PID=$!

echo "[3/3] Starting Vite frontend dev server on http://localhost:5173..."
npm --prefix frontend run dev &
UI_PID=$!

echo "================================================="
echo "VisionStudio is running locally:"
echo "  - Backend API: http://localhost:5000"
echo "  - Frontend UI: http://localhost:5173"
echo "Press Ctrl+C to stop both servers."
echo "================================================="

cleanup() {
    echo "Stopping servers..."
    kill $API_PID $UI_PID 2>/dev/null || true
    wait $API_PID $UI_PID 2>/dev/null || true
    exit 0
}

trap cleanup EXIT INT TERM
wait

