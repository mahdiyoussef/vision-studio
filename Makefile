.PHONY: install install-dev lint test test-cov clean

install:
	pip install -e .

install-dev:
	pip install -e ".[dev,test,gpu,cameras,azure]"
	pre-commit install

lint:
	ruff check src/ tests/
	ruff format --check src/ tests/
	mypy src/vision_studio/

format:
	ruff check --fix src/ tests/
	ruff format src/ tests/

test:
	pytest tests/ -v

test-cov:
	pytest tests/ --cov=vision_studio --cov-report=term-missing

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .mypy_cache .ruff_cache


.PHONY: edge-up
edge-up: ## Start the Edge deployment (IoT)
	docker-compose -f docker-compose.yml up -d --build

.PHONY: edge-down
edge-down: ## Stop the Edge deployment
	docker-compose -f docker-compose.yml down

.PHONY: dev
dev: ## Run both Backend and Frontend locally without Docker
	./scripts/start_dev.sh

.PHONY: api-dev
api-dev: ## Run Flask API locally with auto-reload (no Docker)
	./venv/bin/python src/vision_studio/presentation/api/app.py

.PHONY: ui-dev
ui-dev: ## Run Vite frontend locally (no Docker)
	npm --prefix frontend run dev
