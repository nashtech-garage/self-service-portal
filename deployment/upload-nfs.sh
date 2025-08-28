#!/bin/bash

# File to upload
FILE="./app-config.container.yaml"
SERVICE="nfs-service"
PORT_NFS="2049"
PORT_RPC_CLUSTER="111"
PORT_RPC_LOCAL="3111"

# Check if ports are already in use
for PORT in $PORT_NFS $PORT_RPC_LOCAL; do
  if lsof -i TCP:${PORT} &>/dev/null; then
    echo "Port ${PORT} is already in use. Please free it before running this script."
    exit 1
  fi
done

# Start port-forward in background
echo "Starting port-forward to NFS service..."
kubectl port-forward svc/${SERVICE} ${PORT_NFS}:${PORT_NFS} ${PORT_RPC_LOCAL}:${PORT_RPC_CLUSTER} &
PF_PID=$!

# Wait for port-forward to stabilize
sleep 3

# Check if port-forward is still running
if ! kill -0 ${PF_PID} 2>/dev/null; then
  echo "Port-forward failed to start. Exiting."
  exit 1
fi

# Install NCP if missing
if ! command -v ncp &> /dev/null; then
  echo "Installing NCP CLI..."
  curl -s https://raw.githubusercontent.com/kha7iq/ncp/master/install.sh | sudo sh
fi

# Upload the file using custom RPC port
echo "Uploading ${FILE} to NFS export path..."
ncp to --input "${FILE}" --nfspath / --host localhost --port ${PORT_RPC_LOCAL}

# Clean up port-forward
if kill -0 ${PF_PID} 2>/dev/null; then
  echo "Cleaning up port-forward..."
  kill ${PF_PID}
  wait ${PF_PID} 2>/dev/null
else
  echo "Port-forward already exited."
fi
