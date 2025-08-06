import { ENV } from "@/config/env";
import { store } from "@/store";
import { LocalStorageService } from "@services/storage/BaseStorageService";
import { logout } from "@store/auth/authSlice.login";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const user = state.auth.user;
    const userProfile = state.auth.userProfile;
    const token = user?.accessToken ?? LocalStorageService.getAccessToken();

    if (token) {
      config.headers.Authorization = `${token}`;
    }

    if (userProfile?.locationId) {
      config.headers["Authorization-LocationId"] = `${userProfile.locationId}`;
    }

    return config;
  },
  (error) => Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.status === 504 || error.status === 429) { 
      return Promise.reject({status: error.status, message: "Too many requests"});
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth state and redirect to login
      store.dispatch(logout());
      window.location.href = "/login";
    }

    const status = error.response?.data?.statusCode;
    const message =
      error.response?.data?.message ??
      (Array.isArray(error.response?.data?.errors) ? error.response.data.errors.join("\n") : "Unknown errors");

    return Promise.reject({ message, status, error });
  }
);

export default axiosInstance;
