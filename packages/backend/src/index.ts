import { createBackend } from '@backstage/backend-defaults';
import { getRepoIdAction } from './plugins/getRepoID'; 
import { flattenParameterGroup } from './plugins/flattenParameterGroup';
import { createOrSkipVariableGroup } from './plugins/createOrSkipVariableGroup';
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

// ✅ RoadieHQ utility actions
import {
  createParseFileAction,
  createAppendFileAction,
  createReplaceInFileAction,
} from '@roadiehq/scaffolder-backend-module-utils';

import { TemplateAction } from '@backstage/plugin-scaffolder-node';

// 🔐 Custom Auth Module
const customAuth = createBackendModule({
  pluginId: 'auth',
  moduleId: 'custom-auth-provider',
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

// ⚙️ Custom Scaffolder Module
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
        scaffolder.addActions(createOrSkipVariableGroup());
        scaffolder.addActions(flattenParameterGroup());

        // ✅ Registered with TypeScript fix
        scaffolder.addActions(createParseFileAction() as unknown as TemplateAction<any, any>);
        scaffolder.addActions(createAppendFileAction() as unknown as TemplateAction<any, any>);
        scaffolder.addActions(createReplaceInFileAction() as unknown as TemplateAction<any, any>);
      },
    });
  },
});

// 🚀 Backend Initialization
const backend = createBackend();

// 🔌 Core Plugins
backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));

// 🔐 Auth Plugins
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(customAuth);
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

// 📦 Catalog Plugins
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'));
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// 🔐 Permissions Plugins
backend.add(import('@janus-idp/backstage-plugin-rbac-backend'));

// ☸ Kubernetes Plugin
backend.add(import('@backstage/plugin-kubernetes-backend/alpha'));

// 🔍 Search Plugins
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-pg/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));

// 🚧 Scaffolder Plugins
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-azure'));
backend.add(import('@parfuemerie-douglas/scaffolder-backend-module-azure-pipelines')); 

// 🔌 Custom Scaffolder Extensions
backend.add(scaffolderModuleCustomExtensions);

// ✅ Start Backend
backend.start();
