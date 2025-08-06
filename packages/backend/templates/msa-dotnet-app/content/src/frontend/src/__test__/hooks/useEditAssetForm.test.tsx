import { ROUTES } from "@constants/routes";
import useEditAssetForm from "@hooks/useEditAssetForm";
import { editAssetThunk } from "@store/assetSlice";
import { act, renderHook } from "@testing-library/react";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

const mockHookFormSubmit = jest.fn();
const mockSetValue = jest.fn();
const mockReset = jest.fn();
jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"),
  useForm: () => ({
    register: jest.fn(),
    formState: { errors: {} },
    handleSubmit: mockHookFormSubmit,
    setValue: mockSetValue,
    watch: jest.fn(),
    control: {},
    reset: mockReset,
  }),
}));

const mockShowSuccess = jest.fn();
jest.mock("@components/Toast/useToastContext", () => ({
  useToastContext: () => ({
    showSuccess: mockShowSuccess,
  }),
}));
jest.mock("@schemas/asset.schema", () => ({
  assetEditFormSchema: {},
}));
jest.mock("@constants/asset", () => ({
  ASSET_EDIT_STATE: {
    available: "AVAILABLE",
    notAvailable: "NOT_AVAILABLE",
    waitingForRecycling: "WAITING_FOR_RECYCLING",
    recycled: "RECYCLED",
  },
}));
jest.mock("@constants/routes", () => ({
  ROUTES: {
    ASSETS: { path: "/manage/assets" },
  },
}));
jest.mock("@store/assetSlice", () => ({
  editAssetThunk: jest.fn(),
}));

describe("useEditAssetForm Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with correct stateOptions and default form values", () => {
    const { result } = renderHook(() => useEditAssetForm());

    expect(result.current.stateOptions).toEqual([
      { name: "available", value: "AVAILABLE" },
      { name: "not Available", value: "NOT_AVAILABLE" },
      { name: "waiting for recycling", value: "WAITING_FOR_RECYCLING" },
      { name: "recycled", value: "RECYCLED" },
    ]);
    expect(result.current.errors).toEqual({});
  });

  it("should call setValue with correct parameters on handleInputChange", () => {
    const { result } = renderHook(() => useEditAssetForm());
    act(() => {
      result.current.handleInputChange("name", "New Asset Name");
    });
    expect(mockSetValue).toHaveBeenCalledWith("name", "New Asset Name", {
      shouldValidate: true,
    });
  });

  it("should call reset with formatted data when updateFormWithAssetData is called", () => {
    const { result } = renderHook(() => useEditAssetForm());
    const assetData = {
      id: 123,
      name: "Laptop HP",
      specification: "Core i5, 8GB RAM",
      installedDate: "2023-10-26T10:00:00.000Z",
      state: "AVAILABLE",
    };

    act(() => {
      result.current.updateFormWithAssetData(assetData);
    });

    expect(mockReset).toHaveBeenCalledWith({
      id: 123,
      name: "Laptop HP",
      specifications: "Core i5, 8GB RAM",
      installedDate: new Date("2023-10-26T10:00:00.000Z"),
      state: "AVAILABLE",
    });
  });

  it("should not call reset if assetData is null or has no id", () => {
    const { result } = renderHook(() => useEditAssetForm());

    act(() => result.current.updateFormWithAssetData(null));
    expect(mockReset).not.toHaveBeenCalled();

    act(() => result.current.updateFormWithAssetData({ name: "No ID" }));
    expect(mockReset).not.toHaveBeenCalled();
  });

  describe("onSubmit", () => {
    const formData = {
      id: 123,
      name: "Updated Laptop",
      specifications: "Core i7, 16GB RAM",
      installedDate: new Date("2024-01-01T00:00:00.000Z"),
      state: "AVAILABLE",
    };

    beforeEach(() => {
      mockHookFormSubmit.mockImplementation((callback) => () => callback(formData));
    });

    it("should dispatch editAssetThunk, show success toast, and navigate on successful submission", async () => {
      const unwrap = jest.fn().mockResolvedValue({ success: true });
      mockDispatch.mockReturnValue({ unwrap });

      const { result } = renderHook(() => useEditAssetForm());

      await act(async () => {
        result.current.handleSubmit();
      });

      const expectedPayload = {
        id: 123,
        name: "Updated Laptop",
        specification: "Core i7, 16GB RAM",
        installedDate: "2024-01-01T00:00:00.000Z",
        state: "AVAILABLE",
      };
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(editAssetThunk).toHaveBeenCalledWith(expectedPayload);

      expect(mockShowSuccess).toHaveBeenCalledWith("Asset updated successfully", "Success");

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ASSETS.path);
    });

    it("should not show success toast or navigate on failed submission", async () => {
      const error = new Error("API Error");
      const unwrap = jest.fn().mockRejectedValue(error);
      mockDispatch.mockReturnValue({ unwrap });

      const { result } = renderHook(() => useEditAssetForm());
      await act(async () => {
        await expect(result.current.handleSubmit()).rejects.toThrow("API Error");
      });

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockShowSuccess).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
