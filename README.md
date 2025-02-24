# [Backstage](https://backstage.io)

Install node using nvm 
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

nvm install 18 --lts
nvm use 18
```

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```bash
export ARGOCD_URL=""
export ARGOCD_AUTH_TOKEN=""

export GITHUB_TOKEN=''
export AZURE_TOKEN=''

export AZURE_CLIENT_ID=''
export AZURE_CLIENT_SECRET=''
export AZURE_TENANT_ID=''

export GITHUB_CLIENT_ID=''
export GITHUB_CLIENT_SECRET=''

export GOOGLE_CLIENT_ID=""
export GOOGLE_CLIENT_SECRET=""

yarn install
yarn dev

## Open another terminal
export ARGOCD_URL=""
export ARGOCD_AUTH_TOKEN=""

export GITHUB_TOKEN=''
export AZURE_TOKEN=''

export AZURE_CLIENT_ID=''
export AZURE_CLIENT_SECRET=''
export AZURE_TENANT_ID=''

export GITHUB_CLIENT_ID=''
export GITHUB_CLIENT_SECRET=''

export GOOGLE_CLIENT_ID=""
export GOOGLE_CLIENT_SECRET=""
cd package/backend
yarn install
yarn start
```
