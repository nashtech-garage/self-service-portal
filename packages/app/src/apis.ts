import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  oauthRequestApiRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { OAuth2 } from '@backstage/core-app-api';

import { cognitoAuthApiRef } from './components/signin/identityProviders';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  createApiFactory({
    api: cognitoAuthApiRef,
    deps: { discoveryApi: discoveryApiRef, oauthRequestApi: oauthRequestApiRef },
    factory: ({ discoveryApi, oauthRequestApi }) =>
      OAuth2.create({
        discoveryApi,
        oauthRequestApi,
        provider: {icon: () => null,id: 'cognito', title: 'AWS Cognito' }, // 🔹 Specify the provider
      }),
  }),
];
