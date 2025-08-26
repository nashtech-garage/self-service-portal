# 🚀 Self Service Portal Deployment Guide

This repository contains everything you need to deploy the **Self Service Portal** application and its dependencies on Azure Kubernetes Service (AKS) using Kubernetes manifests and Azure CLI.

---

## 📂 Kubernetes Manifests

| File                      | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| `config-map.yaml`         | Stores non-sensitive configuration values using a Kubernetes `ConfigMap`.  |
| `secret.yaml`             | Stores sensitive data using a Kubernetes `Secret`.                         |
| `postgres-service.yaml`   | Defines the `Service` for the PostgreSQL database.                         |
| `postgres-deployment.yaml`| Defines the `Deployment` for the PostgreSQL database.                     |
| `deployment.yaml`         | Main `Deployment` for the Backstage application.                           |

---

## ⚙️ AKS Cluster Setup (via Azure CLI)

Follow these steps to create an AKS cluster and configure access:

### 1. 🔐 Login to Azure
```bash
az login
```

### 2. 📦 Create Resource Group
```bash
az group create --name selfserviceportal-rg --location eastus
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

## 🚀 Deploy to Kubernetes

Apply all manifests to your AKS cluster:

```bash
kubectl apply -f config-map.yaml
kubectl apply -f secret.yaml
kubectl apply -f postgres-service.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f deployment.yaml
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

## 📎 Notes

- Ensure your ACR is linked to AKS if you're using private container images.
- You can update secrets and config maps without restarting pods using:
  ```bash
  kubectl apply -f secret.yaml
  kubectl apply -f config-map.yaml
  ```
- If you need to redeploy or update the application, reapply the relevant manifest files.

---

Happy deploying! 🎉
