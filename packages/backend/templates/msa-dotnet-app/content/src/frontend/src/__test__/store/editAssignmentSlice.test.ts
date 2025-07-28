import type { ApiResponse } from "@/entities/api";
import type { EditAssignmentDetail, UpdateAssignmentRequest, UpdateAssignmentResponse } from "@/entities/assignment";
import { describe, expect, it, jest } from "@jest/globals";
import axiosInstance from "@services/axiosInterceptorService";
import reducer, {
  getAssignmentDetailThunk,
  resetEditAssignmentState,
  updateAssignmentThunk,
  type EditAssignmentState,
} from "@store/editAssignmentSlice";

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

const initialState: EditAssignmentState = {
  assignableUsers: null,
  assignableAssets: null,
  assignmentDetail: null,
  updatedAssignment: null,
  loading: false,
  loadingUpdate: false,
  loadingDelete: false,
  error: null,
  deleteSuccess: false,
};

describe("editAssignmentSlice reducer", () => {
  it("should reset state to initial state", () => {
    const prevState = {
      ...initialState,
      assignmentDetail: {
        id: 1,
        assetId: 1,
        userId: 1,
        fullName: "John Doe",
        assetName: "Laptop",
        assignedDate: "2024-03-20",
        state: 1,
      },
      loadingUpdate: true,
      error: "Some error",
    };

    const state = reducer(prevState, resetEditAssignmentState());

    expect(state).toEqual(initialState);
  });
});

describe("editAssignmentSlice thunks", () => {
  const mockAssignmentDetail: EditAssignmentDetail = {
    id: 1,
    assetId: 1,
    userId: 1,
    fullName: "John Doe",
    assetName: "Laptop",
    assignedDate: "2024-03-20",
    state: 1,
  };

  const mockUpdateRequest: UpdateAssignmentRequest = {
    assetId: 1,
    userId: 1,
    assignedDate: "2024-03-20",
  };

  const mockUpdateResponse: UpdateAssignmentResponse = {
    id: 1,
    assetId: 1,
    assetCode: "LAP123",
    assetName: "Laptop",
    assignedTo: "John Doe",
    assignedBy: "Admin Da Nang",
    assignedDate: "2024-03-20",
    state: 1,
  };

  const mockApiResponse: ApiResponse<UpdateAssignmentResponse> = {
    data: mockUpdateResponse,
    message: "Assignment updated successfully",
    status: 200,
  };

  it("getAssignmentDetailThunk should handle pending state", () => {
    const action = getAssignmentDetailThunk.pending("", 1);
    const state = reducer(initialState, action);

    expect(state.loadingUpdate).toBe(true);
    expect(state.error).toBeNull();
  });

  it("getAssignmentDetailThunk should handle fulfilled state", () => {
    const action = getAssignmentDetailThunk.fulfilled(mockAssignmentDetail, "", 1);
    const state = reducer(initialState, action);

    expect(state.loadingUpdate).toBe(false);
    expect(state.assignmentDetail).toEqual(mockAssignmentDetail);
  });

  it("getAssignmentDetailThunk should handle rejected state", () => {
    const errorMessage = "An error occurred during fetching assignment detail.";
    const action = getAssignmentDetailThunk.rejected({ message: errorMessage } as any, "", 1);
    const state = reducer(initialState, action);

    expect(state.loadingUpdate).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("getAssignmentDetailThunk should handle rejected state with default message", () => {
    const action = getAssignmentDetailThunk.rejected(new Error(), "", 1);
    const state = reducer(initialState, action);

    expect(state.loadingUpdate).toBe(false);
    expect(state.error).toBe("An error occurred during fetching assignment detail.");
  });

  it("updateAssignmentThunk should handle pending state", () => {
    const action = updateAssignmentThunk.pending("", { id: 1, data: mockUpdateRequest });
    const state = reducer(initialState, action);

    expect(state.loadingUpdate).toBe(true);
    expect(state.error).toBeNull();
  });

  it("updateAssignmentThunk should handle fulfilled state", () => {
    const action = updateAssignmentThunk.fulfilled(mockApiResponse, "", { id: 1, data: mockUpdateRequest });
    const state = reducer(initialState, action);

    expect(state.loadingUpdate).toBe(false);
    expect(state.updatedAssignment).toEqual(mockUpdateResponse);
  });

  it("updateAssignmentThunk should handle rejected state", () => {
    const errorMessage = "Failed to update assignment.";
    const action = updateAssignmentThunk.rejected({ message: errorMessage } as any, "", {
      id: 1,
      data: mockUpdateRequest,
    });
    const state = reducer(initialState, action);

    expect(state.loadingUpdate).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("updateAssignmentThunk should handle rejected state with default message", () => {
    const action = updateAssignmentThunk.rejected(new Error(), "", { id: 1, data: mockUpdateRequest });
    const state = reducer(initialState, action);

    expect(state.loadingUpdate).toBe(false);
    expect(state.error).toBe("Failed to update assignment.");
  });

  it("calls getAssignmentDetailThunk and dispatches result manually", async () => {
    (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { data: mockAssignmentDetail } } as never);

    const { store, invoke } = create();

    await invoke(getAssignmentDetailThunk(1));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: EditAssignmentDetail;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === getAssignmentDetailThunk.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockAssignmentDetail);
  });

  it("calls updateAssignmentThunk and dispatches result manually", async () => {
    (axiosInstance.patch as jest.Mock).mockResolvedValue({ data: mockApiResponse } as never);

    const { store, invoke } = create();

    await invoke(updateAssignmentThunk({ id: 1, data: mockUpdateRequest }));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: ApiResponse<UpdateAssignmentResponse>;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === updateAssignmentThunk.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockApiResponse);
  });
});
