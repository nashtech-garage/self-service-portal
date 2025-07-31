import type { SelectOption } from "@/entities/common";
import { describe, expect, it, jest } from "@jest/globals";
import type { AnyAction } from "@reduxjs/toolkit";
import axiosInstance from "@services/axiosInterceptorService";
import reducer, { getListCategoriesThunk, type MetaDataState } from "@store/metaDataSlice";

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

const initialState: MetaDataState = {
  isLoading: false,
  error: "",
  categories: [],
};

describe("metaDataSlice reducer", () => {
  it("should handle initial state", () => {
    expect(reducer(undefined, {} as AnyAction)).toEqual(initialState);
  });
});

describe("metaDataSlice thunks", () => {
  const mockCategories: SelectOption[] = [
    { value: 1, name: "Category 1" },
    { value: 2, name: "Category 2" },
  ];

  const mockResponse = {
    data: mockCategories,
    message: "Categories fetched successfully",
    status: 200,
  };

  it("getListCategoriesThunk should handle pending state", () => {
    const action = getListCategoriesThunk.pending("", {});
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("getListCategoriesThunk should handle fulfilled state", () => {
    const action = getListCategoriesThunk.fulfilled(mockResponse, "", {});
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.categories).toEqual(mockCategories);
    expect(state.error).toBeNull();
  });

  it("getListCategoriesThunk should handle rejected state", () => {
    const errorMessage = "An error occurred during fetching asset info";
    const action = getListCategoriesThunk.rejected(new Error(errorMessage), "", {});
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("getListCategoriesThunk should handle rejected state with default message", () => {
    const action = getListCategoriesThunk.rejected(new Error(), "", {});
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe("An error occurred during fetching asset info");
  });

  it("calls getListCategories and dispatches result manually", async () => {
    (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockResponse } as never);

    const { store, invoke } = create();

    await invoke(getListCategoriesThunk({}));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: typeof mockResponse;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === getListCategoriesThunk.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockResponse);
  });
});
