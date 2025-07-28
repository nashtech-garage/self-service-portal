import type { PaginationResponse } from "@/entities/api";
import type { ReturningRequest } from "@/entities/returningRequest";
import { describe, expect, it, jest } from "@jest/globals";
import type { AnyAction } from "@reduxjs/toolkit";
import { returningRequestService } from "@services/returningRequestService";
import reducer, { clearError, fetchReturningRequests, type ReturningRequestState } from "@store/returningRequestSlice";

jest.mock("@services/returningRequestService");
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

const initialState: ReturningRequestState = {
  data: [],
  loading: false,
  error: null,
  totalRecords: 0,
  currentPage: 1,
  pageSize: 10,
  lastPage: 1,
};

describe("returningRequestSlice reducer", () => {
  it("should handle initial state", () => {
    expect(reducer(undefined, {} as AnyAction)).toEqual(initialState);
  });

  it("should handle clearError", () => {
    const prevState = { ...initialState, error: "Some error" };
    const state = reducer(prevState, clearError());
    expect(state.error).toBeNull();
  });
});

describe("returningRequestSlice thunks", () => {
  const mockRequests: ReturningRequest[] = [
    {
      id: 1,
      assetCode: "ASSET001",
      assetName: "Asset 1",
      requestedBy: "User 1",
      acceptedBy: null,
      assignedDate: "2024-03-20",
      returnedDate: null,
      state: 1,
    },
    {
      id: 2,
      assetCode: "ASSET002",
      assetName: "Asset 2",
      requestedBy: "User 2",
      acceptedBy: null,
      assignedDate: "2024-03-21",
      returnedDate: null,
      state: 2,
    },
  ];

  const mockResponse: PaginationResponse<ReturningRequest> = {
    data: mockRequests,
    currentPage: 1,
    pageSize: 10,
    total: 2,
    lastPage: 1,
  };

  const mockParams = {
    page: 1,
    pageSize: 10,
    sortBy: "assetCode",
    direction: "asc",
  };

  it("fetchReturningRequests should handle pending state", () => {
    const action = fetchReturningRequests.pending("", mockParams);
    const state = reducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fetchReturningRequests should handle fulfilled state", () => {
    const action = fetchReturningRequests.fulfilled(mockResponse, "", mockParams);
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.data).toEqual(mockRequests);
    expect(state.totalRecords).toBe(2);
    expect(state.currentPage).toBe(1);
    expect(state.pageSize).toBe(10);
    expect(state.lastPage).toBe(1);
    expect(state.error).toBeNull();
  });

  it("fetchReturningRequests should handle rejected state", () => {
    const errorMessage = "Failed to fetch returning requests";
    const action = {
      type: fetchReturningRequests.rejected.type,
      payload: errorMessage,
    };

    const state = reducer(undefined, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("fetchReturningRequests should handle rejected state with default message", () => {
    const defaultMessage = "Some default error";
    const action = {
      type: fetchReturningRequests.rejected.type,
      payload: defaultMessage,
    };

    const state = reducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(defaultMessage);
  });

  it("calls fetchReturningRequests and dispatches result manually", async () => {
    (returningRequestService.getReturningRequests as jest.Mock).mockResolvedValue(mockResponse as never);

    const { store, invoke } = create();

    await invoke(fetchReturningRequests(mockParams));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: PaginationResponse<ReturningRequest>;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === fetchReturningRequests.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockResponse);
  });
});
