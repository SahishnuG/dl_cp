FROM python:3.11-slim

WORKDIR /app

# System deps needed for some Python/image packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN pip install --no-cache-dir uv

# Copy dependency files first for better layer caching
COPY pyproject.toml uv.lock* ./

# Install project dependencies
RUN uv sync --frozen || uv sync
RUN rm -rf /root/.cache/uv /root/.cache/pip

# Copy app source
COPY . .

# Hardcoded port for platform start-command compatibility
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
