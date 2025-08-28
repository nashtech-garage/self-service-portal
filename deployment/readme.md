# 🚀 Self Service Portal Deployment Guide

This repository contains everything you need to deploy the **Self Service Portal** application and its dependencies on Azure Kubernetes Service (AKS) using Kubernetes manifests and Azure CLI.

---

## 📂 Kubernetes Manifests

| File                          | Description                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| `acr-creds.yaml`              | Docker registry secret for pulling images from Azure Container Registry.   |
| `backstage-serviceaccount.yaml` | Defines the service account for the Backstage application.               |
| `config-map.yaml`             | Stores non-sensitive configuration values using a Kubernetes `ConfigMap`.  |
| `deployment.yaml`             | Main `Deployment` for the Backstage application.                           |
| `init-backstage-db.yaml`      | Job to initialize the Backstage database schema.                           |
| `k8s-secret.yaml`             | Additional Kubernetes secrets required by the application.                 |
| `postgres-deployment.yaml`    | Defines the `Deployment` for the PostgreSQL database.                      |
| `postgres-secret.yaml`        | Stores PostgreSQL credentials as a Kubernetes `Secret`.                    |
| `postgres-service.yaml`       | Defines the `Service` for the PostgreSQL database.                         |
| `secret.yaml`                 | Stores sensitive data using a Kubernetes `Secret`.                         |

---

## ⚙️ AKS Cluster Setup (via Azure CLI)

Follow these steps to create an AKS cluster and configure access:

### 1. 🔐 Login to Azure
```bash
az login
```

### 2. 📦 Create Resource Group
```bash
az group create --name selfserviceportal-rg
```

### 3. 🚀 Create AKS Cluster
```bash
az aks create \
  --resource-group selfserviceportal \
  --name selfserviceportal-aks \
  --node-count 1 \
  --enable-addons monitoring \
  --generate-ssh-keys
```

### 4. 🔗 Get AKS Credentials
```bash
az aks get-credentials --resource-group selfserviceportal-rg --name selfserviceportal-aks
```

---

## 📥 Azure Container Registry (ACR)

### 1. 🔍 Show ACR Credentials
```bash
az acr credential show --name <your-acr-name>
```

### 2. 🔐 Create Kubernetes Secret for Image Pull
```bash
kubectl create secret docker-registry acr-creds \
  --docker-username=<your-acr-username> \
  --docker-password='<your-acr-password>' \
  --docker-server=<your-acr-login-server>
```

---

## 📥 Download Kubernetes Manifests from Azure Storage

Before applying the manifests, download the deployment files from Azure Storage:

```bash
az storage blob download-batch \
  --account-name selfserviceportaldevops \
  --destination ./deployment \
  --source k8s-config
```

---

## 🚀 Deploy to Kubernetes

Apply all manifests to your AKS cluster:

```bash
kubectl apply -f deployment/
```

---

## ✅ Verification

Check that all pods are running:

```bash
kubectl get pods
```

Check services:

```bash
kubectl get svc
```

---

Happy deploying! 🎉

# 📦 Uploading `app-config.container.yaml` to In-Cluster NFS via Port-Forward (Linux Only)

This script uploads `app-config.container.yaml` to an NFS server running inside a Kubernetes cluster using a short-lived `kubectl port-forward` session. It automatically installs the `ncp` CLI if missing, performs the upload, and cleans up the connection.

## 🧠 Prerequisites

- Kubernetes cluster with an NFS service named `nfs-service`
- `kubectl` installed and configured
- Internet access to install `ncp` (NFS Copy CLI)

## 🐧 Upload Script

Save the following as `upload-nfs.sh`:

```bash
#!/bin/bash

# File to upload
FILE="./app-config.container.yaml"

# NFS service name and port
SERVICE="nfs-service"
PORT="2049"

# Start port-forward in background
echo "Starting port-forward to NFS service..."
kubectl port-forward svc/${SERVICE} ${PORT}:${PORT} &
PF_PID=$!

# Wait for port-forward to stabilize
sleep 2

# Install NCP if missing
if ! command -v ncp &> /dev/null; then
  echo "Installing NCP CLI..."
  curl -s https://raw.githubusercontent.com/kha7iq/ncp/master/install.sh | sudo sh
fi

# Upload the file to NFS
echo "Uploading ${FILE} to NFS export path..."
ncp to --input "${FILE}" --nfspath / --host localhost

# Kill the port-forward process
echo "Cleaning up port-forward..."
kill ${PF_PID}
```