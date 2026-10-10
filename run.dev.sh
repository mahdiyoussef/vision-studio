#!/bin/bash
set -e

echo "==========================================="
echo "   Starting VisionStudio Dev Environment   "
echo "==========================================="

echo "-> Starting MongoDB container..."
docker compose up -d mongo

# Give mongo a couple of seconds to start
sleep 2

echo "-> Starting Python API Backend (Port 5001)..."
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Warning: No virtual environment 'venv' found. Using system Python."
fi

export PYTHONPATH=$(pwd)/src
export FLASK_APP=src/vision_studio/presentation/api/app.py
export FLASK_ENV=development
export MONGO_URI=mongodb://localhost:27017/vision_studio
export JWT_SECRET=edge-deployment-local-secret

flask run --host=0.0.0.0 --port=5001 > flask.log 2>&1 &
BACKEND_PID=$!

echo "-> Starting React Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ..

# Cleanup function to kill background processes on exit
cleanup() {
    echo ""
    echo "Stopping dev servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Catch Ctrl+C
trap cleanup SIGINT SIGTERM

echo "==========================================="
echo "Dev environment is running!"
echo "Backend API: http://localhost:5001"
echo "Frontend UI: Wait for Vite to log the URL"
echo "Press Ctrl+C to stop both servers."
echo "==========================================="

# Wait indefinitely so the script doesn't exit
wait

