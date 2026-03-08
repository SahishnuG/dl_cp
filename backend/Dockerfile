FROM python:3.11-slim

WORKDIR /app

# System deps needed for some Python/image packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN pip install --no-cache-dir uv

# Copy dependency files first for better layer caching
COPY pyproject.toml uv.lock* ./

# Install project dependencies
RUN uv sync --frozen || uv sync

# Copy app source
COPY . .

# Railway provides PORT at runtime
CMD ["sh", "-c", "uv run uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
