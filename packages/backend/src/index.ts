import { createBackend } from '@backstage/backend-defaults';
import { getRepoIdAction } from './plugins/getRepoID';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { microsoftAuthenticator } from '@backstage/plugin-auth-backend-module-microsoft-provider';
import { githubAuthenticator } from '@backstage/plugin-auth-backend-module-github-provider';
import { googleAuthenticator } from '@backstage/plugin-auth-backend-module-google-provider';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';

import { stringifyEntityRef, DEFAULT_NAMESPACE } from '@backstage/catalog-model';

import { cognitoAuthenticator } from './auth/cognito';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createGetSecretAction } from '../../../plugins/scaffolder-backend-module-scaffolder/src/actions/getSecret';
// Custom Auth Module
require('dotenv').config();
console.log(process.env.AZURE_PAT);
const customAuth = createBackendModule({
  pluginId: 'auth', // The plugin targeted
  moduleId: 'custom-auth-provider', // Unique module name
  register(reg) {
    reg.registerInit({
      deps: { providers: authProvidersExtensionPoint },
      async init({ providers }) {
        const providerConfigs = [
          { providerId: 'github', authenticator: githubAuthenticator },
          { providerId: 'microsoft', authenticator: microsoftAuthenticator },
          { providerId: 'google', authenticator: googleAuthenticator },
          { providerId: 'cognito', authenticator: cognitoAuthenticator },
        ];

        providerConfigs.forEach(({ providerId, authenticator }) => {
          providers.registerProvider({
            providerId,
            factory: createOAuthProviderFactory({
              authenticator,
              async signInResolver({ profile }, ctx) {
                if (!profile.email) {
                  throw new Error('Login failed, user profile does not contain an email');
                }
                const [localPart] = profile.email.split('@');
                const userEntityRef = stringifyEntityRef({
                  kind: 'User',
                  name: localPart.toLowerCase(),
                  namespace: DEFAULT_NAMESPACE,
                });

                return ctx.issueToken({
                  claims: {
                    sub: userEntityRef,
                    ent: [userEntityRef],
                  },
                });
              },
            }),
          });
        });
      },
    });
  },
});

// Custom Scaffolder Module
const scaffolderModuleCustomExtensions = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'custom-extensions',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(createGetSecretAction());
        scaffolder.addActions(getRepoIdAction());
      },
    });
  },
});

// Backend Initialization
const backend = createBackend();

// Backend Plugins
backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));

// Authentication Plugins
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(customAuth);
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

// Catalog Plugins
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'));
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// Permissions Plugins
backend.add(import('@janus-idp/backstage-plugin-rbac-backend'));

// Kubernetes Plugin
backend.add(import('@backstage/plugin-kubernetes-backend/alpha'));

// Search Plugins
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-pg/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));

// Scaffolder Plugins
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@parfuemerie-douglas/scaffolder-backend-module-azure-pipelines'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-azure'));
backend.add(scaffolderModuleCustomExtensions);


// Start Backend
backend.start();
