import type { ApiResponse, PaginationResponse } from "@/entities/api";
import type {
  AssignableAssetsResponse,
  AssignableUsersResponse,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  GetAssignableAssetsRequest,
  GetAssignableUsersRequest,
} from "@/entities/createAssignment";
import { UserTypeEnum } from "@/entities/enums";
import { describe, expect, it, jest } from "@jest/globals";
import type { AnyAction } from "@reduxjs/toolkit";
import { adminAssignmentService } from "@services/assignmentService";
import reducer, {
  createAssignmentThunk,
  fetchAssignableAssetsThunk,
  fetchAssignableUsersThunk,
  resetCreateAssignmentState,
  type CreateAssignmentState,
} from "@store/createAssignmentSlice";

jest.mock("@services/assignmentService");
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

const initialState: CreateAssignmentState = {
  assignableUsers: null,
  assignableAssets: null,
  createdAssignment: null,
  loading: false,
  loadingCreate: false,
  error: null,
};

describe("createAssignmentSlice reducer", () => {
  it("should handle initial state", () => {
    expect(reducer(undefined, {} as AnyAction)).toEqual(initialState);
  });

  it("should handle resetCreateAssignmentState", () => {
    const prevState = {
      ...initialState,
      assignableUsers: { data: [], currentPage: 1, pageSize: 10, total: 0, lastPage: 1 },
      assignableAssets: { data: [], currentPage: 1, pageSize: 10, total: 0, lastPage: 1 },
      createdAssignment: {
        id: 1,
        assetCode: "ASSET001",
        assetName: "Asset 1",
        assignedTo: "User 1",
        assignedBy: "Admin",
        assignedDate: "2024-03-20",
        state: 1,
      },
      loading: true,
      loadingCreate: true,
      error: "Some error",
    };
    const state = reducer(prevState, resetCreateAssignmentState());
    expect(state).toEqual(initialState);
  });
});

describe("createAssignmentSlice thunks", () => {
  const mockUsers: AssignableUsersResponse[] = [
    { id: 1, staffCode: "SD0001", fullName: "User 1", type: UserTypeEnum.STAFF },
    { id: 2, staffCode: "SD0002", fullName: "User 2", type: UserTypeEnum.ADMIN },
  ];

  const mockAssets: AssignableAssetsResponse[] = [
    { id: 1, code: "ASSET001", name: "Asset 1", categoryName: "Category 1" },
    { id: 2, code: "ASSET002", name: "Asset 2", categoryName: "Category 2" },
  ];

  const mockCreatedAssignment: CreateAssignmentResponse = {
    id: 1,
    assetCode: "ASSET001",
    assetName: "Asset 1",
    assignedTo: "User 1",
    assignedBy: "Admin",
    assignedDate: "2024-03-20",
    state: 1,
  };

  const mockUsersResponse: PaginationResponse<AssignableUsersResponse> = {
    data: mockUsers,
    currentPage: 1,
    pageSize: 10,
    total: 2,
    lastPage: 1,
  };

  const mockAssetsResponse: PaginationResponse<AssignableAssetsResponse> = {
    data: mockAssets,
    currentPage: 1,
    pageSize: 10,
    total: 2,
    lastPage: 1,
  };

  const mockCreateResponse: ApiResponse<CreateAssignmentResponse> = {
    data: mockCreatedAssignment,
    message: "Assignment created successfully",
    status: 200,
  };

  const mockUsersRequest: GetAssignableUsersRequest = {
    page: 1,
    pageSize: 10,
    sortBy: "staffCode",
    direction: "asc",
  };

  const mockAssetsRequest: GetAssignableAssetsRequest = {
    page: 1,
    pageSize: 10,
    sortBy: "code",
    direction: "asc",
  };

  const mockCreateRequest: CreateAssignmentRequest = {
    assetId: 1,
    userId: 1,
    assignedDate: "2024-03-20",
    note: "Test assignment",
  };

  describe("fetchAssignableUsersThunk", () => {
    it("should handle pending state", () => {
      const action = fetchAssignableUsersThunk.pending("", mockUsersRequest);
      const state = reducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle fulfilled state", () => {
      const action = fetchAssignableUsersThunk.fulfilled(mockUsersResponse, "", mockUsersRequest);
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.assignableUsers).toEqual(mockUsersResponse);
      expect(state.error).toBeNull();
    });

    it("should handle rejected state", () => {
      const errorMessage = "This is a test error message.";
      const actualErrormessage = "An error occurred during fetching users.";
      const action = fetchAssignableUsersThunk.rejected(new Error(errorMessage), "", mockUsersRequest);
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(actualErrormessage);
    });

    it("should handle rejected state with payload message", () => {
      const errorPayload = { message: "Custom rejected error from payload" };

      const action = {
        type: fetchAssignableUsersThunk.rejected.type,
        payload: errorPayload,
        error: { message: undefined },
      };

      const state = reducer(initialState, action as any);

      expect(state.loading).toBe(false);
      expect(state.error).toBe("Custom rejected error from payload");
    });

    it("should handle rejected state with default message", () => {
      const action = fetchAssignableUsersThunk.rejected(new Error(), "", mockUsersRequest);
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe("An error occurred during fetching users.");
    });

    it("calls fetchAssignableUsersThunk and dispatches result manually", async () => {
      (adminAssignmentService.fetchAssignableUsers as jest.Mock).mockResolvedValue(mockUsersResponse as never);

      const { store, invoke } = create();

      await invoke(fetchAssignableUsersThunk(mockUsersRequest));

      const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

      type FulfilledAction = {
        type: string;
        payload: PaginationResponse<AssignableUsersResponse>;
      };

      const fulfilledAction = dispatchedActions.find(
        (action: any) => action.type === fetchAssignableUsersThunk.fulfilled.type
      ) as FulfilledAction;

      expect(fulfilledAction).toBeDefined();
      expect(fulfilledAction.payload).toEqual(mockUsersResponse);
    });
  });

  describe("fetchAssignableAssetsThunk", () => {
    it("should handle pending state", () => {
      const action = fetchAssignableAssetsThunk.pending("", mockAssetsRequest);
      const state = reducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle fulfilled state", () => {
      const action = fetchAssignableAssetsThunk.fulfilled(mockAssetsResponse, "", mockAssetsRequest);
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.assignableAssets).toEqual(mockAssetsResponse);
      expect(state.error).toBeNull();
    });

    it("should handle rejected state", () => {
      const errorMessage = "An error occurred during fetching assets.";
      const action = fetchAssignableAssetsThunk.rejected(new Error(errorMessage), "", mockAssetsRequest);
      const state = reducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it("should handle rejected state with payload message", () => {
      const errorPayload = { message: "Custom rejected error from payload" };

      const action = {
        type: fetchAssignableAssetsThunk.rejected.type,
        payload: errorPayload,
        error: { message: undefined },
      };

      const state = reducer(initialState, action as any);

      expect(state.loading).toBe(false);
      expect(state.error).toBe("Custom rejected error from payload");
    });

    it("calls fetchAssignableAssetsThunk and dispatches result manually", async () => {
      (adminAssignmentService.fetchAssignableAssets as jest.Mock).mockResolvedValue(mockAssetsResponse as never);

      const { store, invoke } = create();

      await invoke(fetchAssignableAssetsThunk(mockAssetsRequest));

      const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

      type FulfilledAction = {
        type: string;
        payload: PaginationResponse<AssignableAssetsResponse>;
      };

      const fulfilledAction = dispatchedActions.find(
        (action: any) => action.type === fetchAssignableAssetsThunk.fulfilled.type
      ) as FulfilledAction;

      expect(fulfilledAction).toBeDefined();
      expect(fulfilledAction.payload).toEqual(mockAssetsResponse);
    });
  });

  describe("createAssignmentThunk", () => {
    it("should handle pending state", () => {
      const action = createAssignmentThunk.pending("", mockCreateRequest);
      const state = reducer(initialState, action);

      expect(state.loadingCreate).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle fulfilled state", () => {
      const action = createAssignmentThunk.fulfilled(mockCreateResponse, "", mockCreateRequest);
      const state = reducer(initialState, action);

      expect(state.loadingCreate).toBe(false);
      expect(state.createdAssignment).toEqual(mockCreatedAssignment);
      expect(state.error).toBeNull();
    });

    it("should handle rejected state", () => {
      const errorMessage = "Failed to create assignment.";
      const action = createAssignmentThunk.rejected(new Error(errorMessage), "", mockCreateRequest);
      const state = reducer(initialState, action);

      expect(state.loadingCreate).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it("should handle rejected state with payload message", () => {
      const errorPayload = { message: "Custom rejected error from payload" };

      const action = {
        type: createAssignmentThunk.rejected.type,
        payload: errorPayload,
        error: { message: undefined },
      };

      const state = reducer(initialState, action as any);

      expect(state.loading).toBe(false);
      expect(state.error).toBe("Custom rejected error from payload");
    });

    it("calls createAssignmentThunk and dispatches result manually", async () => {
      (adminAssignmentService.createAssignment as jest.Mock).mockResolvedValue(mockCreateResponse as never);

      const { store, invoke } = create();

      await invoke(createAssignmentThunk(mockCreateRequest));

      const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

      type FulfilledAction = {
        type: string;
        payload: ApiResponse<CreateAssignmentResponse>;
      };

      const fulfilledAction = dispatchedActions.find(
        (action: any) => action.type === createAssignmentThunk.fulfilled.type
      ) as FulfilledAction;

      expect(fulfilledAction).toBeDefined();
      expect(fulfilledAction.payload).toEqual(mockCreateResponse);
    });
  });
});
