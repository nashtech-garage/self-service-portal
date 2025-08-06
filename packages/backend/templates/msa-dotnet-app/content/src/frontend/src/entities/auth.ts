export interface User {
  userId: number;
  userType: number;
  accessToken: string;
  refreshToken: string;
  expireIn: number;
  isChangedPassword: boolean;
}

export interface UserProfile {
  userId: number;
  username: string;
  isChangedPassword: boolean;
  firstName: string;
  lastName: string;
  locationId: number;
  userType: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  password: string;
}
