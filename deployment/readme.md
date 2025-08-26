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
  --resource-group selfserviceportal-rg \
  --name selfserviceportal-aks \
  --node-count 2 \
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
