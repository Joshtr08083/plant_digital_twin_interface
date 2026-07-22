FROM node:20-slim AS frontend-build
WORKDIR /frontend
COPY frontend_react/package.json frontend_react/package-lock.json ./
RUN npm ci
COPY frontend_react/ .
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
COPY backend_django/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend_django/ .

COPY --from=frontend-build /frontend/dist/ /app/telemetry/static/telemetry/app/

RUN python manage.py collectstatic --noinput