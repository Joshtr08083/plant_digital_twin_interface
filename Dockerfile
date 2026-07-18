FROM python:3.12-slim

WORKDIR /app

COPY backend_django/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend_django .
