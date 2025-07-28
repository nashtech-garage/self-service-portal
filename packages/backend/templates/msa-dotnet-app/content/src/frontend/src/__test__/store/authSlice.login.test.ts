import type { ApiResponse } from "@/entities/api";
import type { User, UserProfile } from "@/entities/auth";
import { describe, expect, it, jest } from "@jest/globals";
import type { AnyAction } from "@reduxjs/toolkit";
import { authService } from "@services/authService";
import axiosInstance from "@services/axiosInterceptorService";
import { LocalStorageService } from "@services/storage/BaseStorageService";
import reducer, {
  clearError,
  getMe,
  login,
  logout,
  markPasswordChanged,
  type AuthState,
} from "@store/auth/authSlice.login";

jest.mock("@services/authService");
jest.mock("@services/axiosInterceptorService");
jest.mock("@services/storage/BaseStorageService");

// Simulated redux-thunk
const thunkMiddleware =
  ({ dispatch, getState }: any) =>
  (next: any) =>
  (action: any) => {
    if (typeof action === "function") {
      return action(dispatch, getState);
    }
    return next(action);
  };

// Factory to create the mocked Redux "environment"
const create = () => {
  const store = {
    getState: jest.fn(() => ({ user: { name: "Mock" } })), // Example state
    dispatch: jest.fn(),
  };
  const next = jest.fn();

  // Runs middleware like Redux would
  const invoke = (action: any) => thunkMiddleware(store)(next)(action);

  return { store, next, invoke };
};

const initialState: AuthState = {
  user: null,
  userProfile: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

describe("authSlice reducer", () => {
  it("should handle initial state", () => {
    expect(reducer(undefined, {} as AnyAction)).toEqual(initialState);
  });

  it("should handle logout", () => {
    const mockUser: User = {
      userId: 1,
      userType: 1,
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expireIn: 3600,
      isChangedPassword: false,
    };

    const mockUserProfile: UserProfile = {
      userId: 1,
      username: "test",
      firstName: "Test",
      lastName: "User",
      locationId: 1,
      userType: 1,
      isChangedPassword: false,
    };

    const prevState = {
      ...initialState,
      user: mockUser,
      isAuthenticated: true,
      userProfile: mockUserProfile,
    };
    const state = reducer(prevState, logout());

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
    expect(LocalStorageService.clearToken).toHaveBeenCalled();
    expect(LocalStorageService.removeItem).toHaveBeenCalledWith("user");
  });

  it("should handle clearError", () => {
    const prevState = { ...initialState, error: "Some error" };
    const state = reducer(prevState, clearError());

    expect(state.error).toBeNull();
  });

  it("should handle markPasswordChanged", () => {
    const mockUserProfile: UserProfile = {
      userId: 1,
      username: "test",
      firstName: "Test",
      lastName: "User",
      locationId: 1,
      userType: 1,
      isChangedPassword: false,
    };

    const prevState = {
      ...initialState,
      userProfile: mockUserProfile,
    };
    const state = reducer(prevState, markPasswordChanged());

    expect(state.userProfile?.isChangedPassword).toBe(true);
  });
});

describe("authSlice thunks", () => {
  const mockUser: User = {
    userId: 1,
    userType: 1,
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expireIn: 3600,
    isChangedPassword: false,
  };

  const mockUserProfile: UserProfile = {
    userId: 1,
    username: "testuser",
    firstName: "Test",
    lastName: "User",
    locationId: 1,
    userType: 1,
    isChangedPassword: false,
  };

  const mockLoginResponse: ApiResponse<User> = {
    data: mockUser,
    message: "Login successful",
    status: 200,
  };

  const mockGetMeResponse: ApiResponse<UserProfile> = {
    data: mockUserProfile,
    message: "User profile fetched successfully",
    status: 200,
  };

  const mockLoginRequest = {
    username: "testuser",
    password: "password123",
  };

  describe("login thunk", () => {
    it("should handle pending state", () => {
      const action = login.pending("", mockLoginRequest);
      const state = reducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle fulfilled state", () => {
      const action = login.fulfilled(mockUser, "", mockLoginRequest);
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBeNull();
      expect(LocalStorageService.setToken).toHaveBeenCalledWith({
        accessToken: mockUser.accessToken,
        refreshToken: mockUser.refreshToken,
      });
    });

    it("should handle rejected state", () => {
      const errorMessage = "Invalid credentials";
      const defaultErrorMessage = "An error occurred during login";
      const action = login.rejected(new Error(errorMessage), "", mockLoginRequest);
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe(defaultErrorMessage);
    });

    it("should handle rejected state with payload message", () => {
      const errorPayload = { message: "Custom rejected error from payload" };

      const action = {
        type: login.rejected.type,
        payload: errorPayload,
        error: { message: undefined },
      };

      const state = reducer(initialState, action as any);

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe("Custom rejected error from payload");
    });

    it("should handle rejected state with default message", () => {
      const action = login.rejected(new Error(), "", mockLoginRequest);
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe("An error occurred during login");
    });

    it("calls login and dispatches result manually", async () => {
      (authService.login as jest.Mock).mockResolvedValue(mockLoginResponse as never);

      const { store, invoke } = create();

      await invoke(login(mockLoginRequest));

      const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

      type FulfilledAction = {
        type: string;
        payload: User;
      };

      const fulfilledAction = dispatchedActions.find(
        (action: any) => action.type === login.fulfilled.type
      ) as FulfilledAction;

      expect(fulfilledAction).toBeDefined();
      expect(fulfilledAction.payload).toEqual(mockUser);
    });
  });

  describe("getMe thunk", () => {
    it("should handle pending state", () => {
      const action = getMe.pending("");
      const state = reducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle fulfilled state", () => {
      const action = getMe.fulfilled(mockGetMeResponse, "");
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.userProfile).toEqual(mockUserProfile);
      expect(state.error).toBeNull();
    });

    it("should handle rejected state", () => {
      const errorMessage = "Failed to fetch user profile";
      const defaultErrorMessage = "An error occurred during fetching user info";
      const action = getMe.rejected(new Error(errorMessage), "");
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe(defaultErrorMessage);
    });

    it("should handle rejected state with payload message", () => {
      const errorPayload = { message: "Custom rejected error from payload" };

      const action = {
        type: getMe.rejected.type,
        payload: errorPayload,
        error: { message: undefined },
      };

      const state = reducer(initialState, action as any);

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe("Custom rejected error from payload");
    });

    it("calls getMe and dispatches result manually", async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockGetMeResponse } as never);

      const { store, invoke } = create();

      await invoke(getMe());

      const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

      type FulfilledAction = {
        type: string;
        payload: ApiResponse<UserProfile>;
      };

      const fulfilledAction = dispatchedActions.find(
        (action: any) => action.type === getMe.fulfilled.type
      ) as FulfilledAction;

      expect(fulfilledAction).toBeDefined();
      expect(fulfilledAction.payload).toEqual(mockGetMeResponse);
    });
  });
});
