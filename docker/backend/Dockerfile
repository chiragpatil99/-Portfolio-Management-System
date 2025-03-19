
# Author: Pranav Pawar
# Description: backend dockerfile

# Stage 1: Frontend build
FROM node:18 as frontend-builder
WORKDIR /usr/src/app/frontend
COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm ci
COPY ./frontend ./
RUN npm run build

# Stage 2: Backend runtime
FROM python:3.11.4-slim-buster

# Set work directory
WORKDIR /usr/src/app/backend

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends netcat \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY ./backend/requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy backend source code
COPY ./backend ./

# Copy frontend build artifacts from the frontend-builder stage
COPY --from=frontend-builder /usr/src/app/frontend/build ./build

# Handle script permissions and line endings
RUN sed -i 's/\r$//' /usr/src/app/backend/entrypoint.sh
RUN chmod +x /usr/src/app/backend/entrypoint.sh

# Expose port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/usr/src/app/backend/entrypoint.sh"]
