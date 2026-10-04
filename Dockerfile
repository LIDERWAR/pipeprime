# ==========================================
# PipePrime Enterprise B2B Platform Dockerfile
# Python 3.12 Slim, Production-Ready ASGI
# ==========================================

FROM python:3.12-slim as base

# Prevents Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install system dependencies (curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY server/requirements.txt /app/server/requirements.txt
RUN pip install --no-cache-dir -r /app/server/requirements.txt

# Copy platform files
COPY assets/ /app/assets/
COPY *.html /app/
COPY robots.txt sitemap.xml favicon.ico site.webmanifest /app/
COPY server/ /app/server/


# Ensure runtime directories exist
RUN mkdir -p /app/server/data /app/server/storage/uploads /app/server/storage/protected

# Create non-root user for security
RUN groupadd -r pipeprime && useradd -r -g pipeprime -d /app pipeprime && \
    chown -R pipeprime:pipeprime /app

USER pipeprime

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Production command: uvicorn ASGI server with multi-worker support
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--proxy-headers", "--forwarded-allow-ips", "*"]
