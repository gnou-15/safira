# Use a Python image that already has PyTorch installed (CPU-only, much smaller)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed by some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (Docker caches this layer if requirements don't change)
COPY requirements.txt .

# Install PyTorch CPU-only first (much smaller than the default GPU version)
# Then install the rest of the requirements
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app code
COPY *.py ./

# Railway injects the PORT environment variable
ENV PORT=8080

# Start the FastAPI server
CMD uvicorn app:app --host 0.0.0.0 --port $PORT
