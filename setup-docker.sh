#!/bin/bash

# User Support Tickets Plugin - Docker Setup Script
# This script will install Docker (if needed) and start the WordPress environment

set -e

echo "================================================"
echo "User Support Tickets - Docker Setup"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Please do not run this script as root${NC}"
    echo "Run as: ./setup-docker.sh"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Docker is installed
echo "Checking Docker installation..."
if ! command_exists docker; then
    echo -e "${YELLOW}Docker is not installed${NC}"
    echo ""
    echo "Would you like to install Docker? (y/n)"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${GREEN}Installing Docker...${NC}"
        
        # Update package index (allow some repos to fail)
        sudo apt-get update || echo -e "${YELLOW}Warning: Some repositories had errors, continuing...${NC}"
        
        # Install prerequisites
        sudo apt-get install -y \
            ca-certificates \
            curl \
            gnupg \
            lsb-release
        
        # Add Docker's official GPG key
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        
        # Set up repository
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker Engine
        sudo apt-get update || echo -e "${YELLOW}Warning: Some repositories had errors, continuing...${NC}"
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        # Add user to docker group
        sudo usermod -aG docker $USER
        
        # Start Docker service
        sudo systemctl start docker
        sudo systemctl enable docker
        
        echo -e "${GREEN}Docker installed successfully!${NC}"
        echo -e "${YELLOW}Note: You may need to logout and login again for group changes to take effect${NC}"
        echo ""
    else
        echo -e "${RED}Docker is required to continue. Please install Docker manually.${NC}"
        echo "See INSTALL-DOCKER.md for instructions"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Docker is installed${NC}"
    docker --version
fi

# Check if Docker Compose is available
echo ""
echo "Checking Docker Compose..."
if ! command_exists docker || ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose is not available${NC}"
    echo "Please ensure Docker Compose v2 is installed"
    exit 1
else
    echo -e "${GREEN}✓ Docker Compose is available${NC}"
    docker compose version
fi

# Check if Docker daemon is running
echo ""
echo "Checking Docker daemon..."
if ! docker ps &> /dev/null; then
    echo -e "${YELLOW}Docker daemon is not running. Starting Docker...${NC}"
    sudo systemctl start docker
    sleep 2
fi

if docker ps &> /dev/null; then
    echo -e "${GREEN}✓ Docker daemon is running${NC}"
else
    echo -e "${RED}Failed to start Docker daemon${NC}"
    echo "Please run: sudo systemctl start docker"
    exit 1
fi

# Navigate to plugin directory
cd "$(dirname "$0")"

echo ""
echo "================================================"
echo "Starting WordPress containers..."
echo "================================================"
echo ""

# Start containers
docker compose up -d

echo ""
echo "Waiting for services to start..."
sleep 10

# Check container status
echo ""
echo "Container Status:"
docker compose ps

echo ""
echo "================================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "================================================"
echo ""
echo "WordPress is starting up. Please wait 30-60 seconds for all services to initialize."
echo ""
echo "URLs:"
echo "  - WordPress:   http://localhost:8080"
echo "  - Admin:       http://localhost:8080/wp-admin"
echo "  - Dashboard:   http://localhost:8080/user-dashboard (after setup)"
echo "  - phpMyAdmin:  http://localhost:8081"
echo ""
echo "Next Steps:"
echo "  1. Open http://localhost:8080 in your browser"
echo "  2. Complete WordPress installation"
echo "  3. Login to WordPress Admin"
echo "  4. Go to Plugins → Installed Plugins"
echo "  5. Activate 'User Support Tickets'"
echo "  6. Visit http://localhost:8080/user-dashboard"
echo ""
echo "For detailed instructions, see DOCKER-SETUP.md"
echo ""
echo "Useful Commands:"
echo "  - View logs:        docker compose logs -f"
echo "  - Stop containers:  docker compose stop"
echo "  - Start containers: docker compose start"
echo "  - Remove all:       docker compose down -v"
echo ""
