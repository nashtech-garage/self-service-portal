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
