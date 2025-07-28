import type { ApiResponse } from "@/entities/api";
import type { CreateUserResponse, EditUserPayload, UserDetail } from "@/entities/user";
import { describe, expect, it, jest } from "@jest/globals";
import { userManagementService } from "@services/userManagementService";
import reducer, {
  addUserToTop,
  clearNewUser,
  editUserThunk,
  fetchUsers,
  fetchUsersById,
  resetEditedUser,
  setNewUser,
  setUserList,
  type UserState,
} from "@store/userSlice";

jest.mock("@services/userManagementService");
jest.mock("@services/axiosInterceptorService");

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

const initialState: UserState = {
  newUser: null,
  userList: [],
  users: null,
  editedUser: null,
  loading: false,
  error: null,
  selectedUser: null,
  totalRecords: 0,
};

describe("userSlice reducer", () => {
  it("should handle setNewUser", () => {
    const mockUser: CreateUserResponse = {
      id: 1,
      username: "testu",
      firstName: "Test",
      lastName: "User",
      joinedDate: "2024-01-01",
      staffCode: "TEST001",
      fullName: "Test User",
      userType: 2,
      rawPassword: "password123",
    };
    const state = reducer(initialState, setNewUser(mockUser));
    expect(state.newUser).toEqual(mockUser);
  });

  it("should handle clearNewUser", () => {
    const prevState = {
      ...initialState,
      newUser: {
        id: 1,
        username: "testu",
        firstName: "Test",
        lastName: "User",
        joinedDate: "2024-01-01",
        staffCode: "TEST001",
        fullName: "Test User",
        userType: 2,
        rawPassword: "password123",
      },
    };
    const state = reducer(prevState, clearNewUser());
    expect(state.newUser).toBeNull();
  });

  it("should handle setUserList", () => {
    const mockUserList = [
      {
        id: 1,
        username: "testu",
        firstName: "Test",
        lastName: "User",
        joinedDate: "2024-01-01",
        staffCode: "TEST001",
        fullName: "Test User",
        userType: 2,
        rawPassword: "password123",
      },
    ];
    const state = reducer(initialState, setUserList(mockUserList));
    expect(state.userList).toEqual(mockUserList);
  });

  it("should add user to top and remove duplicate", () => {
    const mockUser = {
      id: 1,
      username: "testu",
      firstName: "Test",
      lastName: "User",
      joinedDate: "2024-01-01",
      staffCode: "TEST001",
      fullName: "Test User",
      userType: 2,
      rawPassword: "password123",
    };
    const prevState = {
      ...initialState,
      users: {
        data: [
          {
            id: 2,
            username: "testu2",
            firstName: "Test2",
            lastName: "User2",
            joinedDate: "2024-01-01",
            staffCode: "TEST002",
            fullName: "Test2 User2",
            userType: 2,
            rawPassword: "password123",
          },
        ],
        currentPage: 1,
        pageSize: 15,
        total: 1,
        lastPage: 1,
      },
    };
    const state = reducer(prevState, addUserToTop(mockUser));
    expect(state.users?.data[0]).toEqual(mockUser);
    expect(state.users?.data.length).toBe(2);
  });

  it("should reset editedUser", () => {
    const mockUserDetail: UserDetail = {
      id: 1,
      username: "testu",
      firstName: "Test",
      lastName: "User",
      joinedDate: "2024-01-01",
      staffCode: "TEST001",
      fullName: "Test User",
      userType: 2,
      dateOfBirth: "1990-01-01",
      gender: 1,
      locationId: 1,
    };
    const prevState = { ...initialState, editedUser: mockUserDetail };
    const state = reducer(prevState, resetEditedUser());
    expect(state.editedUser).toBeNull();
  });
});

describe("userSlice thunks", () => {
  const mockUser: CreateUserResponse = {
    id: 1,
    username: "testu",
    firstName: "Test",
    lastName: "User",
    joinedDate: "2024-01-01",
    staffCode: "TEST001",
    fullName: "Test User",
    userType: 2,
    rawPassword: "password123",
  };

  const mockResponse: ApiResponse<any> = {
    data: mockUser,
    message: "User fetched successfully",
    status: 200,
  };

  it("fetchUsers should handle pending state", () => {
    const action = fetchUsers.pending("", {});
    const state = reducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fetchUsers should handle fulfilled state", () => {
    const mockListResponse = {
      data: [mockUser],
      currentPage: 1,
      pageSize: 10,
      total: 1,
      lastPage: 1,
    };
    const action = fetchUsers.fulfilled(mockListResponse, "", {});
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.users).toEqual(mockListResponse);
    expect(state.totalRecords).toBe(1);
    expect(state.error).toBeNull();
  });

  it("fetchUsers should handle rejected state", () => {
    const errorMessage = "Failed to fetch users";
    const actualErrorMessage = "Get all user fail";
    const action = fetchUsers.rejected(new Error(errorMessage), "", {});
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(actualErrorMessage);
  });

  it("fetchUsersById should handle pending state", () => {
    const action = fetchUsersById.pending("", 1);
    const state = reducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fetchUsersById should handle fulfilled state", () => {
    const mockUserDetail: ApiResponse<UserDetail> = {
      status: 200,
      message: "User fetched successfully",
      data: {
        id: 1,
        username: "testu",
        firstName: "Test",
        lastName: "User",
        joinedDate: "2024-01-01",
        staffCode: "TEST001",
        fullName: "Test User",
        userType: 2,
        dateOfBirth: "1990-01-01",
        gender: 1,
        locationId: 1,
      },
    };
    const action = fetchUsersById.fulfilled(mockUserDetail, "", 1);
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.selectedUser).toEqual(mockUserDetail.data);
    expect(state.error).toBeNull();
  });

  it("fetchUsersById should handle rejected state", () => {
    const errorMessage = "Failed to fetch user";
    const action = fetchUsersById.rejected(new Error(errorMessage), "", 1);
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("editUserThunk should handle pending state", () => {
    const mockEditPayload: EditUserPayload = {
      id: 1,
      dateOfBirth: "1990-01-01",
      gender: 1,
      joinedDate: "2024-01-01",
      userType: 2,
    };
    const action = editUserThunk.pending("", mockEditPayload);
    const state = reducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("editUserThunk should handle fulfilled state", () => {
    const mockEditResponse = {
      data: {
        id: 1,
        username: "testu",
        firstName: "Updated",
        lastName: "User",
        joinedDate: "2024-01-01",
        staffCode: "TEST001",
        fullName: "Updated User",
        userType: 2,
        dateOfBirth: "1990-01-01",
        gender: 1,
        locationId: 1,
      },
      message: "User updated successfully",
      status: 200,
    };
    const mockEditPayload: EditUserPayload = {
      id: 1,
      dateOfBirth: "1990-01-01",
      gender: 1,
      joinedDate: "2024-01-01",
      userType: 2,
    };
    const action = editUserThunk.fulfilled(mockEditResponse, "", mockEditPayload);
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.editedUser).toEqual(mockEditResponse.data);
    expect(state.error).toBeNull();
  });

  it("editUserThunk should handle rejected state", () => {
    const errorMessage = "Failed to edit user";
    const mockEditPayload: EditUserPayload = {
      id: 1,
      dateOfBirth: "1990-01-01",
      gender: 1,
      joinedDate: "2024-01-01",
      userType: 2,
    };
    const action = editUserThunk.rejected(new Error(errorMessage), "", mockEditPayload);
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("calls fetchUsers and dispatches result manually", async () => {
    const mockListResponse = {
      data: [mockUser],
      currentPage: 1,
      pageSize: 10,
      total: 1,
      lastPage: 1,
    };
    (userManagementService.getUsers as jest.Mock).mockResolvedValue(mockListResponse as never);

    const { store, invoke } = create();

    await invoke(fetchUsers({}));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: typeof mockListResponse;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === fetchUsers.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockListResponse);
  });

  it("calls fetchUsersById and dispatches result manually", async () => {
    const mockUserDetail: UserDetail = {
      id: 1,
      username: "testu",
      firstName: "Test",
      lastName: "User",
      joinedDate: "2024-01-01",
      staffCode: "TEST001",
      fullName: "Test User",
      userType: 2,
      dateOfBirth: "1990-01-01",
      gender: 1,
      locationId: 1,
    };
    (userManagementService.getUsersById as jest.Mock).mockResolvedValue(mockUserDetail as never);

    const { store, invoke } = create();

    await invoke(fetchUsersById(1));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: UserDetail;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === fetchUsersById.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockUserDetail);
  });

  it("calls editUserThunk and dispatches result manually", async () => {
    const mockEditResponse = {
      data: {
        id: 1,
        username: "testu",
        firstName: "Updated",
        lastName: "User",
        joinedDate: "2024-01-01",
        staffCode: "TEST001",
        fullName: "Updated User",
        userType: 2,
        dateOfBirth: "1990-01-01",
        gender: 1,
        locationId: 1,
      },
      message: "User updated successfully",
      status: 200,
    };
    const mockEditPayload: EditUserPayload = {
      id: 1,
      dateOfBirth: "1990-01-01",
      gender: 1,
      joinedDate: "2024-01-01",
      userType: 2,
    };
    (userManagementService.editUser as jest.Mock).mockResolvedValue(mockEditResponse as never);

    const { store, invoke } = create();

    await invoke(editUserThunk(mockEditPayload));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: typeof mockEditResponse;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === editUserThunk.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockEditResponse);
  });
});
