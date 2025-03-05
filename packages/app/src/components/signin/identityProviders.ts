import { microsoftAuthApiRef , githubAuthApiRef , googleAuthApiRef , createApiRef } from '@backstage/core-plugin-api';

export const cognitoAuthApiRef = createApiRef({
  id: 'cognito-auth-provider',
});

export const providers = [
  {
    id: 'microsoft-auth-provider',
    title: 'Azure Active Directory',
    message: 'Sign in using Azure AD',
    apiRef: microsoftAuthApiRef
  },
  {
    id: 'github-auth-provider',
    title: 'GitHub',
    message: 'Sign in using GitHub',
    apiRef: githubAuthApiRef
  },
  {
    id: 'google-auth-provider',
    title: 'Google',
    message: 'Sign in using Google',
    apiRef: googleAuthApiRef
  },
  {
    id: 'cognito-auth-provider', 
    title: 'AWS Cognito',
    message: 'Sign in using AWS Cognito',
    apiRef: cognitoAuthApiRef
  }
];