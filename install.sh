#!/bin/bash

set -e

echo "========================================="
echo "  Xray Config Repository Manager"
echo "  Installation Script"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "Docker installed successfully."
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    if ! command -v docker-compose &> /dev/null; then
        echo "Docker Compose is not installed. Installing..."
        apt-get update && apt-get install -y docker-compose-plugin
        echo "Docker Compose installed successfully."
    fi
fi

# Generate package-lock.json if not exists
if [ ! -f "package-lock.json" ]; then
    echo "Generating package-lock.json..."
    if command -v npm &> /dev/null; then
        npm install --package-lock-only
    else
        echo "npm not found, using Docker to generate lock file..."
        docker run --rm -v "$(pwd)":/app -w /app node:20-alpine npm install --package-lock-only
    fi
fi

echo ""
echo "Building and starting services..."
echo ""

# Stop existing containers if running
docker compose down 2>/dev/null || true

# Build and start
docker compose up -d --build

echo ""
echo "Waiting for database to be ready..."
sleep 5

echo "Waiting for application to start..."
sleep 10

# Initialize admin account
echo "Initializing admin account..."
curl -s http://localhost:8080/api/init > /dev/null 2>&1 || true

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="localhost"
fi

echo ""
echo "========================================="
echo "  Installation Complete!"
echo "========================================="
echo ""
echo "  URL:      http://${SERVER_IP}:8080"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "  Please change the default password"
echo "  after your first login!"
echo ""
echo "  Repository path: /app/repository/"
echo ""
echo "========================================="
echo ""
echo "Useful commands:"
echo "  docker compose logs -f    # View logs"
echo "  docker compose restart    # Restart"
echo "  docker compose down       # Stop"
echo ""
