import type { ApiResponse } from "@/entities/api";
import type { LoginCredentials, User, UserProfile } from "@/entities/auth";
import axiosInstance from "./axiosInterceptorService";

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    const { data } = await axiosInstance.post<ApiResponse<User>>('/auth/login', {
      ...credentials,
    });

    return data;
  },

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    const { data } = await axiosInstance.put<ApiResponse<null>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },

  async firstChangePassword(newPassword: string): Promise<ApiResponse<null>> {
    const { data } = await axiosInstance.put<ApiResponse<null>>('/auth/first-change-password', {
      password: newPassword,
    });

    return data;
  },

  async getme(): Promise<ApiResponse<UserProfile>> {
    const { data } = await axiosInstance.get<ApiResponse<UserProfile>>('/me');
    return data;
  }
};