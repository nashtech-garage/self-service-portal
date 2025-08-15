import {
  microsoftAuthApiRef,
  githubAuthApiRef,
  googleAuthApiRef,
  createApiRef,
  ApiRef,
  ProfileInfoApi,
  BackstageIdentityApi,
  SessionApi,
} from '@backstage/core-plugin-api';

// Define the interface type expected by SignInPage
type AuthApiInterface = ProfileInfoApi & BackstageIdentityApi & SessionApi;
type AuthApiRefType = ApiRef<AuthApiInterface>;

// Create a custom Cognito API ref with correct inner type
export const cognitoAuthApiRef: AuthApiRefType = createApiRef<AuthApiInterface>({
  id: 'cognito-auth-provider',
});

// Export the providers array with properly typed apiRefs
export const providers = [
  {
    id: 'microsoft-auth-provider',
    title: 'Azure Active Directory',
    message: 'Sign in using Azure AD',
    apiRef: microsoftAuthApiRef as AuthApiRefType,
  },
  {
    id: 'github-auth-provider',
    title: 'GitHub',
    message: 'Sign in using GitHub',
    apiRef: githubAuthApiRef as AuthApiRefType,
  },
  {
    id: 'google-auth-provider',
    title: 'Google',
    message: 'Sign in using Google',
    apiRef: googleAuthApiRef as AuthApiRefType,
  },
  {
    id: 'cognito-auth-provider',
    title: 'AWS Cognito',
    message: 'Sign in using AWS Cognito',
    apiRef: cognitoAuthApiRef,
  },
];
