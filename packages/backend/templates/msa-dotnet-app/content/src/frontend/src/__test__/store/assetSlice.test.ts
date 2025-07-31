import type { ApiResponse } from "@/entities/api";
import type { CreateAsset } from "@/entities/asset";
import { describe, expect, it, jest } from "@jest/globals";
import { assetService } from "@services/assetService";
import axiosInstance from "@services/axiosInterceptorService";
import reducer, {
  addAssetToTop,
  createAssetThunk,
  editAssetThunk,
  getDetailAssetThunk,
  getListAssetThunk,
  resetEditedAsset,
  resetReduxParams,
  resetState,
  setReduxParams,
  type AssetState,
} from "@store/assetSlice";

jest.mock("@services/assetService");
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

const initialState: AssetState = {
  isLoading: false,
  error: "",
  assets: null,
  asset: {},
  success: false,
  message: null,
  editedAsset: null,
  reduxParams: null,
};
describe("assetSlice reducer", () => {
  it("should reset state", () => {
    const prevState = { ...initialState, isLoading: true, error: "some error", success: true, message: "hi" };
    const state = reducer(prevState, resetState());
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.success).toBe(false);
    expect(state.message).toBeNull();
  });

  it("should add asset to top and remove duplicate", () => {
    const mockAsset = { id: 2, name: "Asset A" };
    const prevState = {
      ...initialState,
      assets: { data: [{ id: 1, name: "Old Asset A" }], currentPage: 1, pageSize: 15, total: 1, lastPage: 1 },
    };

    const state = reducer(prevState, addAssetToTop(mockAsset));
    expect(state.assets?.data[0]).toEqual(mockAsset);
    expect(state.assets?.data.length).toBe(2);
  });

  it("should set reduxParams", () => {
    const params = { page: 1, pageSize: 10, sortBy: "name", direction: "asc", keySearch: "abc" };
    const state = reducer(initialState, setReduxParams(params));
    expect(state.reduxParams).toEqual(params);
  });

  it("should reset reduxParams", () => {
    const prevState = {
      ...initialState,
      reduxParams: { page: 2, pageSize: 10, sortBy: "", direction: "asc" as const, keySearch: null },
    };
    const state = reducer(prevState, resetReduxParams());
    expect(state.reduxParams).toBeNull();
  });

  it("should reset editedAsset", () => {
    const prevState = { ...initialState, editedAsset: { id: 1, name: "Test Asset" } };
    const state = reducer(prevState, resetEditedAsset());
    expect(state.editedAsset).toBeNull();
  });
});

describe("assetSlice thunks", () => {
  const mockAsset: CreateAsset = {
    name: "Asset A",
    categoryId: 1,
    specification: "Specs here",
    installedDate: "2025-06-10",
    state: 1,
  };
  const mockResponse: ApiResponse<any> = {
    data: mockAsset,
    message: "Asset created successfully",
    status: 200,
  };

  it("createAssetThunk should handle pending state", () => {
    const action = createAssetThunk.pending("", mockAsset);
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBe("");
  });

  it("createAssetThunk should handle fulfilled state", () => {
    const action = createAssetThunk.fulfilled(mockResponse, "", mockAsset);
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.asset).toEqual(mockAsset);
    expect(state.message).toBe("Asset created successfully");
  });

  it("createAssetThunk should handle rejected state", () => {
    const errorMessage = "Failed to create asset";
    const action = createAssetThunk.rejected(new Error(errorMessage), "", mockAsset);
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("getListAssetThunk should handle pending state", () => {
    const action = getListAssetThunk.pending("", {});
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("getListAssetThunk should handle fulfilled state", () => {
    const mockListResponse = {
      data: [mockAsset],
      currentPage: 1,
      pageSize: 10,
      total: 1,
      lastPage: 1,
    };
    const action = getListAssetThunk.fulfilled(mockListResponse, "", {});
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.assets).toEqual(mockListResponse);
    expect(state.error).toBeNull();
  });

  it("getListAssetThunk should handle rejected state", () => {
    const errorMessage = "An error occurred during fetching asset info";
    const action = getListAssetThunk.rejected(new Error(errorMessage), "", {});
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("getDetailAssetThunk should handle pending state", () => {
    const action = getDetailAssetThunk.pending("", 1);
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("getDetailAssetThunk should handle fulfilled state", () => {
    const mockDetailResponse = {
      data: { ...mockAsset, id: 1 },
      message: "Asset details fetched successfully",
      status: 200,
    };
    const action = getDetailAssetThunk.fulfilled(mockDetailResponse, "", 1);
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.asset).toEqual(mockDetailResponse.data);
    expect(state.error).toBeNull();
  });

  it("getDetailAssetThunk should handle rejected state", () => {
    const errorMessage = "An error occurred during fetching asset info";
    const action = getDetailAssetThunk.rejected(new Error(errorMessage), "", 1);
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("editAssetThunk should handle pending state", () => {
    const action = editAssetThunk.pending("", { id: 1, ...mockAsset });
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBe("");
  });

  it("editAssetThunk should handle fulfilled state", () => {
    const mockEditResponse = {
      data: { ...mockAsset, id: 1 },
      message: "Asset updated successfully",
      status: 200,
    };
    const action = editAssetThunk.fulfilled(mockEditResponse, "", { id: 1, ...mockAsset });
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.editedAsset).toEqual(mockEditResponse.data);
    expect(state.error).toBeNull();
  });

  it("editAssetThunk should handle rejected state", () => {
    const errorMessage = "Failed to update asset";
    const action = editAssetThunk.rejected(new Error(errorMessage), "", { id: 1, ...mockAsset });
    const state = reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it("calls createAsset and dispatches result manually", async () => {
    (assetService.createAsset as jest.Mock).mockResolvedValue(mockResponse as never);

    const { store, invoke } = create();

    await invoke(createAssetThunk(mockAsset));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: ApiResponse<any>;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === createAssetThunk.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockResponse);
  });

  it("calls getListAsset and dispatches result manually", async () => {
    const mockListResponse = {
      data: [mockAsset],
      currentPage: 1,
      pageSize: 10,
      total: 1,
      lastPage: 1,
    };
    (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockListResponse } as never);

    const { store, invoke } = create();

    await invoke(getListAssetThunk({}));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: typeof mockListResponse;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === getListAssetThunk.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockListResponse);
  });

  it("calls getDetailAsset and dispatches result manually", async () => {
    const mockDetailResponse = {
      data: { ...mockAsset, id: 1 },
      message: "Asset details fetched successfully",
      status: 200,
    };
    (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockDetailResponse } as never);

    const { store, invoke } = create();

    await invoke(getDetailAssetThunk(1));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: typeof mockDetailResponse;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === getDetailAssetThunk.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockDetailResponse);
  });

  it("calls editAsset and dispatches result manually", async () => {
    const mockEditResponse = {
      data: { ...mockAsset, id: 1 },
      message: "Asset updated successfully",
      status: 200,
    };
    (assetService.editAsset as jest.Mock).mockResolvedValue(mockEditResponse as never);

    const { store, invoke } = create();

    await invoke(editAssetThunk({ id: 1, ...mockAsset }));

    const dispatchedActions = store.dispatch.mock.calls.map((call) => call[0]);

    type FulfilledAction = {
      type: string;
      payload: ApiResponse<any>;
    };

    const fulfilledAction = dispatchedActions.find(
      (action: any) => action.type === editAssetThunk.fulfilled.type
    ) as FulfilledAction;

    expect(fulfilledAction).toBeDefined();
    expect(fulfilledAction.payload).toEqual(mockEditResponse);
  });
});
