
import { createBackend } from '@backstage/backend-defaults';

import { createBackendModule } from '@backstage/backend-plugin-api';
import { microsoftAuthenticator, } from '@backstage/plugin-auth-backend-module-microsoft-provider';
import { githubAuthenticator, } from '@backstage/plugin-auth-backend-module-github-provider';
import { googleAuthenticator, } from '@backstage/plugin-auth-backend-module-google-provider';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';

import { stringifyEntityRef, DEFAULT_NAMESPACE } from '@backstage/catalog-model';

import { cognitoAuthenticator, } from './auth/cognito';

const customAuth = createBackendModule({
  // This ID must be exactly "auth" because that's the plugin it targets

  pluginId: 'auth',
  // This ID must be unique, but can be anything
  moduleId: 'custom-auth-provider',
  register(reg) {
    reg.registerInit({
      deps: { providers: authProvidersExtensionPoint },
      async init({ providers }) {
       
        const providerConfigs = [
          {
            providerId: 'github',
            authenticator: githubAuthenticator
          },
          {
            providerId: 'microsoft',
            authenticator: microsoftAuthenticator
          },
          {
            providerId: 'google',
            authenticator: googleAuthenticator
          },
          {
            providerId: 'cognito',
            authenticator: cognitoAuthenticator
          }
        ];

        providerConfigs.forEach(({ providerId, authenticator }) => {
          providers.registerProvider({
            providerId,
            factory: createOAuthProviderFactory({
              authenticator,
              async signInResolver({ profile }, ctx) {
                console.log(`start signInResolver`);
                const values = Object.values(profile);
                console.log(`profile: ${values}`);   
                if (!profile.email) {
                  throw new Error(
                    'Login failed, user profile does not contain an email',
                  );
                }
                // Split the email into the local part and the domain.
                const [localPart] = profile.email.split('@');   
                console.log(`Email: ${localPart.toLowerCase()}`);   
                // By using `stringifyEntityRef` we ensure that the reference is formatted correctly
                const userEntityRef = stringifyEntityRef({
                  kind: 'User',
                  name: localPart.toLowerCase(),
                  namespace: DEFAULT_NAMESPACE,
                });                                               
                                        
                console.log(`userEntityRef: ${userEntityRef}`); 
                return ctx.issueToken({
                  claims: {
                    sub: userEntityRef,
                    ent: [userEntityRef]
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

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// backend.add(import('@backstage/plugin-auth-backend-module-microsoft-provider'));
// backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
 backend.add(customAuth);
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
//backend.add(import('@backstage/plugin-permission-backend/alpha'));
// backend.add(
 // import('@backstage/plugin-permission-backend-module-allow-all-policy'),
// );
//backend.add(catalogOwnerViewPolicyModule);

//backend.add(import('@spotify/backstage-plugin-rbac-backend'));
//backend.add(import('@spotify/backstage-plugin-permission-backend-module-rbac'));

backend.add(import('@janus-idp/backstage-plugin-rbac-backend'));

// kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend/alpha'));

// search plugin
backend.add(import('@backstage/plugin-search-backend/alpha'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg/alpha'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));

// scaffolder plugin
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'))
backend.add(import('@backstage/plugin-scaffolder-backend-module-azure'));

backend.start();
