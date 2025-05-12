# Create EKS cluster
# Install Crossplane
```bash
#Enable the Crossplane Helm Chart repository
helm repo add \
crossplane-stable https://charts.crossplane.io/stable
helm repo update

#Run the Helm dry-run to see all the Crossplane components Helm installs.
helm install crossplane \
crossplane-stable/crossplane \
--dry-run --debug \
--namespace crossplane-system \
--create-namespace

#Install the Crossplane components using helm install
helm install crossplane \
crossplane-stable/crossplane \
--namespace crossplane-system \
--create-namespace

```

- create secret to access AWS resources
```bash
kubectl create secret generic aws-creds \
  -n crossplane-system \
  --from-literal=creds="[default]
aws_access_key_id=<your-access-key-id>
aws_secret_access_key=<your-secret-access-key>"
```
```bash
kubectl apply -f infra-stepone/infrastruture/provider.yaml
kubectl apply -f infra-stepone/infrastruture/provider-config.yaml
```

- create secret for RDS (make sure create this secret before create the dbinstance)
```bash
kubectl create secret generic rds-password \
  -n crossplane-system \
  --from-literal=password=<your-rds-password>
```

Var list
```
-- Global var ---
region
clusterName

--- EKS ---
cidrVPCBlock
cidrSubnetBlockA
cidrSubnetBlockB

--- S3 ---
bucketName

--- RDS ---
dbInstanceClass
storage
engine
engineVersion
ingressFromPort
ingressToPort
ingressCIDRBlock

--- ElasticCache ---
cacheNodeType
numCacheClusters

--- EKS ---
instanceTypes
minSize
maxSize
desiredSize
capacityType
instanceTypes (array)
diskSize
```