import type { ApiResponse } from "@/entities/api";
import type { User, UserProfile } from "@/entities/auth";
import { STORAGE_KEYS } from "@constants/storageKeys";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "@services/authService";
import axiosInstance from "@services/axiosInterceptorService";
import { LocalStorageService } from "@services/storage/BaseStorageService";

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const storedAccessToken = LocalStorageService.getAccessToken();

const initialState: AuthState = {
  user: null,
  userProfile: null,
  isAuthenticated: !!storedAccessToken,
  loading: false,
  error: null,
};

export const login = createAsyncThunk<User, { username: string; password: string }>(
  "auth/login",
  async ({ username, password }) => {
    const response = await authService.login({ username, password });
    return response.data;
  }
);

export const getMe = createAsyncThunk(
  "auth/getMe",
  async () => (await axiosInstance.get<ApiResponse<UserProfile>>("/me")).data
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;

      LocalStorageService.clearToken();
      LocalStorageService.removeItem("user");
    },
    clearError(state) {
      state.error = null;
    },
    markPasswordChanged(state) {
      if (state.userProfile) {
        state.userProfile.isChangedPassword = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;

        LocalStorageService.setToken({
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        });

        if ("isChangedPassword" in action.payload) {
          state.userProfile = {
            ...state.userProfile,
            isChangedPassword: (action.payload as any).isChangedPassword,
          } as UserProfile;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        const message = (action.payload as { message: string })?.message || "An error occurred during login";
        state.error = message;
      })
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userProfile = action.payload.data as UserProfile;
        state.error = null;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        const message =
          (action.payload as { message: string })?.message || "An error occurred during fetching user info";
        state.error = message;
      });
  },
});

export const { logout, clearError, markPasswordChanged } = authSlice.actions;
export default authSlice.reducer;
