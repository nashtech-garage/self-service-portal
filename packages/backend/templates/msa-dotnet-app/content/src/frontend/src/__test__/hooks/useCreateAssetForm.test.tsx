import { ASSET_CREATE_STATE } from "@constants/asset";
import { ROUTES } from "@constants/routes";
import useCreateAssetForm from "@hooks/useCreateAssetForm";
import { createAssetThunk, resetState } from "@store/assetSlice";
import { act, renderHook } from "@testing-library/react";
import { useSelector } from "react-redux";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockDispatch = jest.fn();
const mockUseSelector = useSelector as unknown as jest.Mock;
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
}));

const mockHookFormSubmit = jest.fn();
const mockSetValue = jest.fn();
jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"),
  useForm: () => ({
    register: jest.fn(),
    formState: { errors: {} },
    handleSubmit: mockHookFormSubmit,
    setValue: mockSetValue,
    watch: jest.fn(),
    control: {},
    getValues: jest.fn(),
    trigger: jest.fn(),
  }),
}));

const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
jest.mock("@components/Toast/useToastContext", () => ({
  useToastContext: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));
jest.mock("@schemas/asset.schema", () => ({
  assetFormSchema: {},
}));
jest.mock("@constants/asset", () => ({
  ASSET_CREATE_STATE: {
    available: 1,
    notAvailable: 2,
  },
}));
jest.mock("@constants/routes", () => ({
  ROUTES: {
    ASSETS: { path: "/manage/assets" },
  },
}));
jest.mock("@store/assetSlice", () => ({
  createAssetThunk: jest.fn((payload) => ({ type: "createAsset", payload })),
  resetState: jest.fn(() => ({ type: "resetState" })),
}));

describe("useCreateAssetForm Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSelector.mockReturnValue({ error: null, message: null });
  });

  it("should initialize with correct state options", () => {
    const { result } = renderHook(() => useCreateAssetForm());
    expect(result.current.state).toEqual([
      { name: "available", value: ASSET_CREATE_STATE.available },
      { name: "not Available", value: ASSET_CREATE_STATE.notAvailable },
    ]);
  });

  it("should call setValue on handleInputChange", () => {
    const { result } = renderHook(() => useCreateAssetForm());
    act(() => {
      result.current.handleInputChange("name", "New Asset");
    });
    expect(mockSetValue).toHaveBeenCalledWith("name", "New Asset", { shouldValidate: true });
  });

  it("should dispatch createAssetThunk with formatted data on form submission", async () => {
    const formData = {
      name: "Test Asset",
      categoryId: 1,
      specifications: "Test Specs",
      installedDate: new Date("2024-01-01T00:00:00.000Z"),
      state: 1 as 1 | 2,
    };
    mockHookFormSubmit.mockImplementation((callback) => () => callback(formData));

    const { result } = renderHook(() => useCreateAssetForm());

    await act(async () => {
      await result.current.handleSubmit({} as any);
    });

    const expectedPayload = {
      name: "Test Asset",
      categoryId: 1,
      specification: "Test Specs",
      installedDate: "2024-01-01T00:00:00.000Z",
      state: 1,
    };

    expect(mockDispatch).toHaveBeenCalledWith(createAssetThunk(expectedPayload));
  });

  describe("useEffect for handling Redux state changes", () => {
    it("should show success toast, reset state, and navigate on new assetMessage", () => {
      const { rerender } = renderHook(() => useCreateAssetForm());
      const successMessage = "Asset created successfully!";
      mockUseSelector.mockReturnValue({ error: null, message: successMessage });
      rerender();

      expect(mockShowSuccess).toHaveBeenCalledWith(successMessage);
      expect(mockDispatch).toHaveBeenCalledWith(resetState());
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ASSETS.path);
      expect(mockShowError).not.toHaveBeenCalled();
    });

    it("should show error toast and reset state on new assetError", () => {
      const { rerender } = renderHook(() => useCreateAssetForm());

      const errorMessage = "Asset code already exists";
      mockUseSelector.mockReturnValue({ error: errorMessage, message: null });
      rerender();

      expect(mockShowError).toHaveBeenCalledWith(errorMessage);
      expect(mockDispatch).toHaveBeenCalledWith(resetState());
      expect(mockShowSuccess).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should not do anything if message and error are null", () => {
      const { rerender } = renderHook(() => useCreateAssetForm());

      mockUseSelector.mockReturnValue({ error: null, message: null });
      rerender();

      expect(mockShowSuccess).not.toHaveBeenCalled();
      expect(mockShowError).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
