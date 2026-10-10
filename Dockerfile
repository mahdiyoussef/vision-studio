FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (for OpenCV, MindVision, etc)
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml /app/
# Copy src so pip install . can find the package
COPY src/ /app/src/

RUN pip install --no-cache-dir build && \
    pip install --no-cache-dir .[cameras,azure,gpu]

ENV PYTHONPATH=/app/src
ENV FLASK_APP=src/vision_studio/presentation/api/app.py
ENV FLASK_RUN_HOST=0.0.0.0

EXPOSE 5000

CMD ["flask", "run"]
