# Docker Installation Guide

## Install Docker on Linux

### Option 1: Quick Installation Script

```bash
# Update package index
sudo apt-get update

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
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Apply group changes (or logout/login)
newgrp docker
```

### Option 2: Using Convenience Script

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### Verify Installation

```bash
docker --version
docker compose version
```

You should see output like:
```
Docker version 24.0.x, build xxxxx
Docker Compose version v2.x.x
```

## Test Docker Installation

```bash
# Run hello-world container
docker run hello-world

# If successful, you'll see a welcome message
```

## Common Issues

### Permission Denied
If you get "permission denied" errors:
```bash
sudo usermod -aG docker $USER
newgrp docker
# Or logout and login again
```

### Docker Service Not Running
```bash
sudo systemctl start docker
sudo systemctl status docker
```

## After Installing Docker

Once Docker is installed, navigate back to the plugin directory and run:

```bash
cd /home/betopia/projects/user-support-ticket-plugin
docker compose up -d
```

Then follow the instructions in [DOCKER-SETUP.md](DOCKER-SETUP.md)
