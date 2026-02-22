# Docker & Kubernetes Deployment Guide

## Prerequisites

1. **Install Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop
   - Enable Kubernetes in Docker Desktop settings

2. **Install kubectl**
   ```bash
   # Windows (using Chocolatey)
   choco install kubernetes-cli
   
   # Or download from: https://kubernetes.io/docs/tasks/tools/
   ```

3. **Create Docker Hub Account**
   - Sign up at: https://hub.docker.com

---

## Part 1: Docker Setup

### Step 1: Test Docker Installation

```bash
docker --version
docker-compose --version
```

### Step 2: Build Docker Images

```bash
cd /d/devops-ci-cd-project

# Build backend image
docker build -t devops-backend:latest ./Backend

# Build frontend image
docker build -t devops-frontend:latest ./Frontend/frontend-app
```

### Step 3: Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check running containers
docker ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access Application:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api/message

### Step 4: Push Images to Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag images
docker tag devops-backend:latest YOUR_DOCKERHUB_USERNAME/devops-backend:latest
docker tag devops-frontend:latest YOUR_DOCKERHUB_USERNAME/devops-frontend:latest

# Push images
docker push YOUR_DOCKERHUB_USERNAME/devops-backend:latest
docker push YOUR_DOCKERHUB_USERNAME/devops-frontend:latest
```

---

## Part 2: Kubernetes Setup

### Step 1: Enable Kubernetes in Docker Desktop

1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Check "Enable Kubernetes"
4. Click "Apply & Restart"
5. Wait for Kubernetes to start

### Step 2: Verify Kubernetes

```bash
kubectl version --client
kubectl cluster-info
kubectl get nodes
```

### Step 3: Update Kubernetes Manifests

Edit `k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml`:
- Replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username

### Step 4: Deploy to Kubernetes

```bash
cd /d/devops-ci-cd-project

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Check deployments
kubectl get deployments

# Check pods
kubectl get pods

# Check services
kubectl get services
```

### Step 5: Access Application

```bash
# Get NodePort
kubectl get service frontend-service

# Access at: http://localhost:30000
```

### Step 6: Useful Kubernetes Commands

```bash
# View pod logs
kubectl logs <pod-name>

# Describe pod
kubectl describe pod <pod-name>

# Scale deployment
kubectl scale deployment backend-deployment --replicas=3

# Delete deployment
kubectl delete -f k8s/backend-deployment.yaml

# Get all resources
kubectl get all
```

---

## Part 3: CI/CD with Docker

### Update GitHub Actions Workflow

Create `.github/workflows/docker-build.yml`:

```yaml
name: Docker Build and Push

on:
  push:
    branches:
      - main

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: ./Backend
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/devops-backend:latest
      
      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: ./Frontend/frontend-app
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/devops-frontend:latest
```

**Add GitHub Secrets:**
1. Go to GitHub → Settings → Secrets
2. Add `DOCKERHUB_USERNAME`
3. Add `DOCKERHUB_TOKEN` (create at hub.docker.com → Account Settings → Security)

---

## Part 4: Deploy to AWS EKS (Optional)

### Step 1: Install AWS CLI and eksctl

```bash
# Install AWS CLI
choco install awscli

# Install eksctl
choco install eksctl
```

### Step 2: Create EKS Cluster

```bash
eksctl create cluster \
  --name devops-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3
```

### Step 3: Deploy to EKS

```bash
# Configure kubectl
aws eks update-kubeconfig --name devops-cluster --region us-east-1

# Deploy application
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Get LoadBalancer URL
kubectl get service frontend-service
```

---

## Troubleshooting

### Docker Issues

```bash
# Remove all containers
docker rm -f $(docker ps -aq)

# Remove all images
docker rmi -f $(docker images -q)

# Clean up
docker system prune -a
```

### Kubernetes Issues

```bash
# Restart pod
kubectl delete pod <pod-name>

# View events
kubectl get events --sort-by=.metadata.creationTimestamp

# Check pod logs
kubectl logs <pod-name> --previous
```

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           Load Balancer                 │
│         (NodePort: 30000)               │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │   Frontend      │
        │   (Nginx)       │
        │   Port: 80      │
        │   Replicas: 2   │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │   Backend       │
        │   (Flask)       │
        │   Port: 5000    │
        │   Replicas: 2   │
        └─────────────────┘
```

---

## Summary

✅ **Docker**: Containerized both frontend and backend  
✅ **Docker Compose**: Local multi-container setup  
✅ **Kubernetes**: Orchestrated deployment with scaling  
✅ **CI/CD**: Automated Docker image builds  
✅ **Production Ready**: Can deploy to AWS EKS  

**Next Steps:**
1. Test locally with Docker Compose
2. Deploy to local Kubernetes
3. Push images to Docker Hub
4. Set up CI/CD pipeline
5. Deploy to cloud (EKS/GKE/AKS)
