import { ROUTES } from "@constants/routes";
import useEditUserForm from "@hooks/useEditUserForm";
import { editUserThunk } from "@store/userSlice";
import { act, renderHook } from "@testing-library/react";
import { formatDateWithoutTime } from "@utils/datetime";
import { paramsSerializer } from "@utils/formatUtils";
import { getGenderEnum } from "@utils/userUtils";

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockShowSuccess = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));
jest.mock("react-redux", () => ({ useDispatch: () => mockDispatch }));
jest.mock("@components/Toast/useToastContext", () => ({ useToastContext: () => ({ showSuccess: mockShowSuccess }) }));

jest.mock("@utils/datetime", () => ({
  formatDateWithoutTime: jest.fn((date) => date.toISOString().split("T")[0]),
}));
jest.mock("@utils/userUtils", () => ({
  getGenderEnum: jest.fn((gender) => (gender === "Female" ? 0 : 1)),
}));
jest.mock("@utils/formatUtils", () => ({
  paramsSerializer: jest.fn(),
}));

jest.mock("@/schemas/user.schema", () => ({ userFormSchema: {} }));
jest.mock("@/constants/user", () => ({ USER_TYPE_ENUM: { ADMIN: 1, STAFF: 2 } }));
jest.mock("@constants/routes", () => ({ ROUTES: { USERS: { path: "/manage/users" } } }));
jest.mock("@store/userSlice", () => ({ editUserThunk: jest.fn() }));

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
  }),
}));

describe("useEditUserForm Hook", () => {
  const mockParams = { page: 1, search: "test" };
  const serializedParams = "page=1&search=test";
  beforeEach(() => {
    jest.clearAllMocks();
    (paramsSerializer as jest.Mock).mockReturnValue(serializedParams);
  });

  it("should initialize with correct default values and user types", () => {
    const { result } = renderHook(() => useEditUserForm(mockParams));

    expect(result.current.showConfirmModal).toBe(false);
    expect(result.current.userTypes).toEqual([
      { name: "Admin", value: 1 },
      { name: "Staff", value: 2 },
    ]);
  });

  it("should allow setting the userId", () => {
    const { result } = renderHook(() => useEditUserForm(mockParams));

    act(() => {
      result.current.setUserId(123);
    });
  });

  describe("Form Submission (onSubmit)", () => {
    const formData = {
      firstName: "Jane",
      lastName: "Doe",
      dateOfBirth: new Date("2000-01-10T12:00:00.000Z"),
      gender: "Female" as const,
      joinedDate: new Date("2022-01-15T12:00:00.000Z"),
      userType: "1",
    };

    beforeEach(() => {
      mockHookFormSubmit.mockImplementation((callback) => () => callback(formData));
      const unwrap = jest.fn().mockResolvedValue({ success: true });
      mockDispatch.mockReturnValue({ unwrap });
    });

    it("should not dispatch anything if userId is not set", async () => {
      const { result } = renderHook(() => useEditUserForm(mockParams));
      await act(async () => {
        await result.current.handleSubmit({} as any);
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("should dispatch editUserThunk with correctly formatted payload when form is submitted", async () => {
      const { result } = renderHook(() => useEditUserForm(mockParams));
      const testUserId = 456;
      act(() => {
        result.current.setUserId(testUserId);
      });

      await act(async () => {
        await result.current.handleSubmit({} as any);
      });

      const expectedPayload = {
        id: testUserId,
        dateOfBirth: "2000-01-10",
        gender: 0,
        joinedDate: "2022-01-15",
        userType: 1,
      };
      expect(formatDateWithoutTime).toHaveBeenCalledWith(formData.dateOfBirth);
      expect(getGenderEnum).toHaveBeenCalledWith(formData.gender);

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(editUserThunk).toHaveBeenCalledWith(expectedPayload);
    });

    it("should show success toast and navigate on successful submission", async () => {
      const { result } = renderHook(() => useEditUserForm(mockParams));

      act(() => {
        result.current.setUserId(789);
      });

      await act(async () => {
        await result.current.handleSubmit({} as any);
      });

      expect(mockShowSuccess).toHaveBeenCalledWith("User updated successfully", "Success");
      expect(paramsSerializer).toHaveBeenCalledWith(mockParams);
      expect(mockNavigate).toHaveBeenCalledWith(`${ROUTES.USERS.path}?${serializedParams}`);
    });

    it("should not show toast or navigate on failed submission", async () => {
      const error = new Error("API Error");
      const unwrap = jest.fn().mockRejectedValue(error);
      mockDispatch.mockReturnValue({ unwrap });

      const { result } = renderHook(() => useEditUserForm(mockParams));

      act(() => {
        result.current.setUserId(101);
      });

      await act(async () => {
        await expect(result.current.handleSubmit({} as any)).rejects.toThrow("API Error");
      });

      expect(mockShowSuccess).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
