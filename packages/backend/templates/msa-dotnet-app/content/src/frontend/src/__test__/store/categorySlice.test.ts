import { describe, expect, it, jest } from "@jest/globals";
import { categoryService } from "@services/categoryService";
import reducer, {
  clearCategoryMessage,
  fetchCategories,
  fetchCreateCategories,
  type CategoryState,
} from "@store/categorySlice";

jest.mock("@services/categoryService");

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

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  message: null,
};

describe("categorySlice reducer", () => {
  it("should clear category message and error", () => {
    const prevState = {
      ...initialState,
      message: "Success message",
      error: "Error message",
    };

    const state = reducer(prevState, clearCategoryMessage());

    expect(state.message).toBeNull();
    expect(state.error).toBeNull();
  });
});

describe("categorySlice thunks", () => {
  const mockCategories = [
    { id: 1, prefix: "LAP", category: "Laptop" },
    { id: 2, prefix: "MON", category: "Monitor" },
  ];

  const mockResponse = {
    data: mockCategories,
  };

  const mockCreateResponse = {
    data: {
      message: "Category created successfully",
    },
  };

  it("fetchCategories should handle pending state", () => {
    const action = fetchCategories.pending("", undefined);
    const state = reducer(initialState, action);

    expect(state.loading).toBe(true);
  });

  it("fetchCategories should handle fulfilled state", () => {
    const action = fetchCategories.fulfilled(mockCategories, "", undefined);
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.categories).toEqual(mockCategories);
    expect(state.error).toBeNull();
  });

  it("fetchCategories should handle rejected state", () => {
    const errorMessage = "Failed to fetch categories";
    const action = fetchCategories.rejected(new Error(errorMessage), "", undefined);
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("fetchCategories should handle rejected state with message null", () => {
    const errorMessage = undefined;
    const action = fetchCategories.rejected(new Error(errorMessage), "", undefined);
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to fetch categories");
  });

  it("fetchCreateCategories should handle pending state", () => {
    const action = fetchCreateCategories.pending("", { prefix: "LAP", category: "Laptop" });
    const state = reducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.message).toBeNull();
    expect(state.error).toBeNull();
  });

  it("fetchCreateCategories should handle fulfilled state", () => {
    const action = fetchCreateCategories.fulfilled(mockCreateResponse.data, "", { prefix: "LAP", category: "Laptop" });
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.message).toBe("Category created successfully");
    expect(state.error).toBeNull();
  });

  it("fetchCreateCategories should handle rejected state with object payload", () => {
    const errorPayload = { message: "Custom error message" };

    const action = {
      type: fetchCreateCategories.rejected.type,
      payload: errorPayload,
      error: { message: undefined },
    };

    const state = reducer(initialState, action as any);

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Custom error message");
  });

  it("fetchCreateCategories should handle rejected state with error message", () => {
    const errorMessage = "Failed to create category";
    const action = fetchCreateCategories.rejected(new Error(errorMessage), "", { prefix: "LAP", category: "Laptop" });
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("calls fetchCategories and dispatches result manually", async () => {
    (categoryService.getCategories as jest.Mock).mockResolvedValue(mockResponse as never);

    const { store, invoke } = create();

    await invoke(fetchCategories());

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: typeof mockCategories;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === fetchCategories.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockCategories);
  });

  it("calls fetchCreateCategories and dispatches result manually", async () => {
    (categoryService.createCategory as jest.Mock).mockResolvedValue(mockCreateResponse as never);

    const { store, invoke } = create();

    await invoke(fetchCreateCategories({ prefix: "LAP", category: "Laptop" }));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: typeof mockCreateResponse.data;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === fetchCreateCategories.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockCreateResponse.data);
  });
});
