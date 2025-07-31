import type { HomeAssignmentDetail } from "@/entities/homeAssignment";
import { describe, expect, it, jest } from "@jest/globals";
import { homeAssignmentService } from "@services/homeAssignmentService";
import reducer, { clearActionStatus, fetchHomeAssignment, type HomeState } from "@store/homeAssignmentSlice";

jest.mock("@services/homeAssignmentService");

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

const initialState: HomeState = {
  assignments: [],
  loading: false,
  error: null,
  totalRecords: 0,
  acceptLoading: false,
};

describe("homeAssignmentSlice reducer", () => {
  it("should clear action status", () => {
    const prevState = {
      ...initialState,
      loading: true,
      error: "Some error",
    };

    const state = reducer(prevState, clearActionStatus());

    expect(state.loading).toBe(true);
    expect(state.error).toBe("Some error");
  });
});

describe("homeAssignmentSlice thunks", () => {
  const mockAssignments: HomeAssignmentDetail[] = [
    {
      id: 1,
      assetId: "1",
      assetCode: "LAP001",
      assetName: "Laptop",
      assetCategoryName: "Electronics",
      assetSpecification: "High-performance laptop",
      assignedTo: "John Doe",
      assignedBy: "Admin",
      assignedDate: "2024-03-20",
      state: 1,
      isReturningRequested: false,
      note: "New assignment",
      specification: "High-performance laptop",
    },
    {
      id: 2,
      assetId: "2",
      assetCode: "MON001",
      assetName: "Monitor",
      assetCategoryName: "Electronics",
      assetSpecification: "4K Monitor",
      assignedTo: "Jane Smith",
      assignedBy: "Admin",
      assignedDate: "2024-03-19",
      state: 1,
      isReturningRequested: false,
      note: "New assignment",
      specification: "4K Monitor",
    },
  ];

  const mockResponse = {
    data: mockAssignments,
    total: 2,
  };

  it("fetchHomeAssignment should handle pending state", () => {
    const action = fetchHomeAssignment.pending("", {});
    const state = reducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fetchHomeAssignment should handle fulfilled state", () => {
    const action = fetchHomeAssignment.fulfilled({ assignments: mockAssignments, totalRecords: 2 }, "", {});
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.assignments).toEqual(mockAssignments);
    expect(state.totalRecords).toBe(2);
    expect(state.error).toBeNull();
  });

  it("fetchHomeAssignment should handle rejected state", () => {
    const errorMessage = "Failed to fetch assignments";
    const action = fetchHomeAssignment.rejected(new Error(errorMessage), "", {});
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("fetchHomeAssignment should handle rejected state with default message", () => {
    const action = fetchHomeAssignment.rejected(new Error(), "", {});
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to fetch assignments");
  });

  it("calls fetchHomeAssignment and dispatches result manually", async () => {
    (homeAssignmentService.getMyAssignments as jest.Mock).mockResolvedValue(mockResponse as never);

    const { store, invoke } = create();

    await invoke(fetchHomeAssignment({}));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: {
        assignments: HomeAssignmentDetail[];
        totalRecords: number;
      };
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === fetchHomeAssignment.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual({
      assignments: mockAssignments,
      totalRecords: 2,
    });
  });
});
