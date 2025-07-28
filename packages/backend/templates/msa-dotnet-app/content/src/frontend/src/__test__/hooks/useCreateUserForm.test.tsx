import { USER_TYPE_ENUM } from "@/constants/user";
import useCreateUserForm from "@hooks/useCreateUserForm";
import { act, renderHook } from "@testing-library/react";

const mockSetValue = jest.fn();
const mockGetValues = jest.fn();
const mockHookFormSubmit = jest.fn();
const mockWatch = jest.fn();

jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"),
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: mockHookFormSubmit,
    formState: { errors: {} },
    getValues: mockGetValues,
    setValue: mockSetValue,
    watch: mockWatch,
    control: {},
  })),
}));

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: jest.fn((schema) => schema),
}));

jest.mock("@/schemas/user.schema", () => ({
  userFormSchema: {},
}));

jest.mock("@/constants/user", () => ({
  USER_TYPE_ENUM: {
    ADMIN: 1,
    STAFF: 2,
  },
}));

describe("useCreateUserForm Hook", () => {
  let mockOnSubmit: jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit = jest.fn();
    mockGetValues.mockReturnValue({
      firstName: "John",
      lastName: "Doe",
      userType: USER_TYPE_ENUM.ADMIN,
    });
  });

  it("should initialize with correct default values and state", () => {
    const { result } = renderHook(() => useCreateUserForm(mockOnSubmit));
    expect(result.current.showConfirmModal).toBe(false);
    expect(result.current.showPasswordModal).toBe(false);
    expect(result.current.generatedPassword).toBe("");
    expect(result.current.userTypes).toEqual([
      { name: "Admin", value: USER_TYPE_ENUM.ADMIN },
      { name: "Staff", value: USER_TYPE_ENUM.STAFF },
    ]);
    expect(result.current.errors).toEqual({});
  });

  it("should call setValue with correct parameters on handleInputChange", () => {
    const { result } = renderHook(() => useCreateUserForm(mockOnSubmit));
    act(() => {
      result.current.handleInputChange("firstName", "Jane");
    });
    expect(mockSetValue).toHaveBeenCalledWith("firstName", "Jane", {
      shouldValidate: true,
    });
  });

  it("should show confirmation modal when handleSubmit is called and form is valid", () => {
    mockHookFormSubmit.mockImplementation((onSuccess) => (e: React.FormEvent) => {
      e.preventDefault();
      onSuccess();
    });
    const { result } = renderHook(() => useCreateUserForm(mockOnSubmit));
    const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent;
    act(() => {
      result.current.handleSubmit(mockEvent);
    });
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.showConfirmModal).toBe(true);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should not show confirmation modal when form is invalid", () => {
    mockHookFormSubmit.mockImplementation((onSuccess, onError) => (e: React.FormEvent) => {
      e.preventDefault();
      if (onError) onError({});
    });
    const { result } = renderHook(() => useCreateUserForm(mockOnSubmit));
    const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent;
    act(() => {
      result.current.handleSubmit(mockEvent);
    });
    expect(result.current.showConfirmModal).toBe(false);
  });

  it("should call onSubmit and hide modal on handleConfirmSubmit", () => {
    const { result } = renderHook(() => useCreateUserForm(mockOnSubmit));
    act(() => {
      result.current.setShowConfirmModal(true);
    });
    expect(result.current.showConfirmModal).toBe(true);
    act(() => {
      result.current.handleConfirmSubmit();
    });
    expect(result.current.showConfirmModal).toBe(false);
    expect(mockGetValues).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(mockGetValues());
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it("should set password and show password modal on showPasswordDisplay", () => {
    const { result } = renderHook(() => useCreateUserForm(mockOnSubmit));
    const testPassword = "new-generated-password-123";
    act(() => {
      result.current.showPasswordDisplay(testPassword);
    });
    expect(result.current.generatedPassword).toBe(testPassword);
    expect(result.current.showPasswordModal).toBe(true);
  });

  it("should update state when direct setters are called", () => {
    const { result } = renderHook(() => useCreateUserForm(mockOnSubmit));
    act(() => {
      result.current.setShowConfirmModal(true);
    });
    expect(result.current.showConfirmModal).toBe(true);
    act(() => {
      result.current.setShowConfirmModal(false);
    });
    expect(result.current.showConfirmModal).toBe(false);
    act(() => {
      result.current.setShowPasswordModal(true);
    });
    expect(result.current.showPasswordModal).toBe(true);
  });
});
