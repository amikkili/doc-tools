# ── Stage 1: base image with system deps ──────────────────
FROM python:3.11-slim

# System packages needed by PyMuPDF, WeasyPrint, LibreOffice, tabula-py
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    default-jre-headless \
    libpango-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# ── Stage 2: Python dependencies ──────────────────────────
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Stage 3: App code ─────────────────────────────────────
COPY . .

# Create temp directory used by converters
RUN mkdir -p /tmp/doccraft

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
