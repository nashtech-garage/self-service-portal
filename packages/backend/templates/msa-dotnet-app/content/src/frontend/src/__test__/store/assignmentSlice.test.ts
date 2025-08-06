import type { AdminAssignment } from "@/entities/assignment";
import { describe, expect, it, jest } from "@jest/globals";
import { adminAssignmentService } from "@services/assignmentService";
import reducer, { addAssignmentToTop, fetchAdminAssignments, type AdminAssignmentState } from "@store/assignmentSlice";

jest.mock("@services/assignmentService");

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

const initialState: AdminAssignmentState = {
  assignments: [],
  loading: false,
  error: null,
  totalRecords: 0,
  searchParams: {
    page: 1,
    pageSize: 10,
    sortBy: "assignedDate",
    direction: "desc",
  },
};

describe("assignmentSlice reducer", () => {
  it("should add assignment to top and update total records", () => {
    const mockAssignment = { id: 1, assetId: 1, userId: 1, assignedDate: "2024-03-20" };
    const prevState = {
      ...initialState,
      assignments: [{ id: 2, assetId: 2, userId: 2, assignedDate: "2024-03-19" }],
      totalRecords: 1,
    };

    const state = reducer(prevState, addAssignmentToTop(mockAssignment));

    expect(state.assignments[0]).toEqual(mockAssignment);
    expect(state.assignments.length).toBe(2);
    expect(state.totalRecords).toBe(2);
  });

  it("should replace existing assignment when adding to top", () => {
    const mockAssignment = { id: 1, assetId: 1, userId: 1, assignedDate: "2024-03-20" };
    const prevState = {
      ...initialState,
      assignments: [{ id: 1, assetId: 2, userId: 2, assignedDate: "2024-03-19" }],
      totalRecords: 1,
    };

    const state = reducer(prevState, addAssignmentToTop(mockAssignment));

    expect(state.assignments[0]).toEqual(mockAssignment);
    expect(state.assignments.length).toBe(1);
    expect(state.totalRecords).toBe(1);
  });
});

describe("assignmentSlice thunks", () => {
  const mockAssignments: AdminAssignment[] = [
    { id: 1, assignedDate: "2024-03-20" },
    { id: 2, assignedDate: "2024-03-19" },
  ];

  const mockResponse = {
    data: mockAssignments,
    total: 2,
  };

  it("fetchAdminAssignments should handle pending state", () => {
    const action = fetchAdminAssignments.pending("", {});
    const state = reducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fetchAdminAssignments should handle fulfilled state", () => {
    const action = fetchAdminAssignments.fulfilled({ assignments: mockAssignments, totalRecords: 2 }, "", {});
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.assignments).toEqual(mockAssignments);
    expect(state.totalRecords).toBe(2);
    expect(state.error).toBeNull();
  });

  it("fetchAdminAssignments should handle rejected state", () => {
    const errorMessage = "Failed to fetch admin assignments";
    const action = fetchAdminAssignments.rejected(new Error(errorMessage), "", {});
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("fetchAdminAssignments should handle rejected state with message null", () => {
    const errorMessage = undefined;
    const action = fetchAdminAssignments.rejected(new Error(errorMessage), "", {});
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to fetch admin assignments");
  });

  it("calls fetchAdminAssignments and dispatches result manually", async () => {
    (adminAssignmentService.getAdminAssignments as jest.Mock).mockResolvedValue(mockResponse as never);

    const { store, invoke } = create();

    await invoke(fetchAdminAssignments({}));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: {
        assignments: AdminAssignment[];
        totalRecords: number;
      };
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === fetchAdminAssignments.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual({
      assignments: mockAssignments,
      totalRecords: 2,
    });
  });
});
