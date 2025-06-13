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

export GRAFANA_URL=''
export GRAFANA_TOKEN=''

yarn install
yarn dev

## Open another terminal
export ARGOCD_URL="http://example.com"
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

export GRAFANA_URL='http://example.com'
export GRAFANA_TOKEN=''


export COGNITO_DOMAIN='https://ap-southeast-27dppoctgo.auth.ap-southeast-2.amazoncognito.com'
export COGNITO_CLIENT_ID='2udoi16kp0f2ev78odq7eo3eev'
export COGNITO_CLIENT_SECRET='1gcmtd7dshstt498ilunol15ov37nsq62jva5nvgqj4d1itu41u2'

cd package/backend
yarn install 
yarn start
```


# Build and publish

```bash
yarn install --frozen-lockfile
yarn tsc
yarn build:backend

docker build . -f packages/backend/Dockerfile --tag backstage:1.0.0
```