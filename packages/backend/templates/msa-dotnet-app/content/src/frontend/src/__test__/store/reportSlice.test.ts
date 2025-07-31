import type { AssetReport } from "@/entities/report";
import { describe, expect, it, jest } from "@jest/globals";
import type { AnyAction } from "@reduxjs/toolkit";
import axiosInstance from "@services/axiosInterceptorService";
import reducer, { getReportThunk, type ReportState } from "@store/reportSlice";

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

const initialState: ReportState = {
  isLoading: false,
  error: null,
  report: null,
};

describe("reportSlice reducer", () => {
  it("should handle initial state", () => {
    expect(reducer(undefined, {} as AnyAction)).toEqual(initialState);
  });
});

describe("reportSlice thunks", () => {
  const mockReports: AssetReport = {
    states: [
      { id: 1, name: "Available" },
      { id: 2, name: "Not Available" },
    ],
    categories: [
      {
        id: 1,
        name: "Electronics",
        total: 10,
        "1": 5,
        "2": 5,
      },
      {
        id: 2,
        name: "Furniture",
        total: 8,
        "1": 3,
        "2": 5,
      },
    ],
  };

  const mockResponse = {
    data: mockReports,
    message: "Reports fetched successfully",
    status: 200,
  };

  it("getReportThunk should handle pending state", () => {
    const action = getReportThunk.pending("", {});
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("getReportThunk should handle fulfilled state", () => {
    const action = getReportThunk.fulfilled(mockResponse, "", {});
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.report).toEqual(mockResponse);
    expect(state.error).toBeNull();
  });

  it("getReportThunk should handle rejected state", () => {
    const errorMessage = "An error occurred during fetching report info";
    const action = getReportThunk.rejected(new Error(errorMessage), "", {});
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("getReportThunk should handle rejected state with default message", () => {
    const action = getReportThunk.rejected(new Error(), "", {});
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe("An error occurred during fetching report info");
  });

  it("calls getReport and dispatches result manually", async () => {
    (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse } as never);

    const { store, invoke } = create();

    await invoke(getReportThunk({}));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: typeof mockResponse;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === getReportThunk.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockResponse);
  });
});
