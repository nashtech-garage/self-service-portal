import { ToastProvider } from "@/components/Toast/ToastProvider";
import { ROUTES } from "@/constants/routes";
import CreateAssignment from "@/pages/AssignmentsManagement/Create";
import reducer from "@/store/createAssignmentSlice";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { FormEvent } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as object),
  useNavigate: () => mockNavigate,
}));

// Mock toast context
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
jest.mock("@/components/Toast/ToastContext", () => ({
  ...(jest.requireActual("@/components/Toast/ToastContext") as object),
  useToastContext: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

// Mock react-hook-form
const mockRegister = jest.fn();
const mockHandleSubmit = jest.fn();
const mockSetValue = jest.fn();
const mockWatch = jest.fn(() => new Date());
const mockFormState = {
  errors: {},
  isValid: true,
};

jest.mock("react-hook-form", () => ({
  useForm: () => ({
    register: mockRegister,
    handleSubmit: mockHandleSubmit,
    formState: mockFormState,
    setValue: mockSetValue,
    watch: mockWatch,
  }),
}));

// Mock the components and hooks
jest.mock("@/components/Assignment/userSelector", () => ({
  UserSelector: ({ setValue }: { setValue: (name: string, value: any) => void }) => (
    <div data-testid="user-selector">
      <button onClick={() => setValue("userId", "USER123")}>Select User</button>
    </div>
  ),
}));

jest.mock("@/components/Assignment/assetSelector", () => ({
  AssetSelector: ({ setValue }: { setValue: (name: string, value: any) => void }) => (
    <div data-testid="asset-selector">
      <button onClick={() => setValue("assetId", "ASSET123")}>Select Asset</button>
    </div>
  ),
}));

// Create a mock store
const createMockStore = () =>
  configureStore({
    reducer: {
      createAssignment: reducer,
    },
    preloadedState: {
      createAssignment: {
        loading: false,
        error: null,
        loadingCreate: false,
        createdAssignment: null,
      },
    },
  });

const renderComponent = () => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ToastProvider>
          <CreateAssignment />
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe("CreateAssignment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the create assignment form", () => {
    renderComponent();

    expect(screen.getByText("Create Assignment")).toBeInTheDocument();
    expect(screen.getByTestId("user-selector")).toBeInTheDocument();
    expect(screen.getByTestId("asset-selector")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should handle user and asset selection", async () => {
    renderComponent();

    const userSelectButton = screen.getByText("Select User");
    const assetSelectButton = screen.getByText("Select Asset");

    await act(async () => {
      fireEvent.click(userSelectButton);
      fireEvent.click(assetSelectButton);
    });

    expect(mockSetValue).toHaveBeenCalledWith("userId", "USER123");
    expect(mockSetValue).toHaveBeenCalledWith("assetId", "ASSET123");
  });

  it("should handle note input", async () => {
    renderComponent();

    const noteInput = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(noteInput, { target: { value: "Test assignment note" } });
    });

    expect(noteInput).toHaveValue("Test assignment note");
  });

  it("should handle assigned date selection", async () => {
    renderComponent();

    const dateInput = screen.getByRole("combobox");
    const today = new Date();

    await act(async () => {
      fireEvent.change(dateInput, { target: { value: today.toLocaleDateString() } });
    });

    expect(dateInput).toHaveValue(today.toLocaleDateString());
  });

  it("should handle form submission", async () => {
    const onSubmit = jest.fn();
    mockHandleSubmit.mockImplementation((fn: any) => (e: FormEvent) => {
      e.preventDefault();
      fn({ userId: 1, assetId: 1, assignedDate: new Date(), note: "Test note" });
    });

    renderComponent();

    const submitButton = screen.getByText("Save");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("should disable submit button when form is invalid", async () => {
    // Update form state before rendering
    mockFormState.isValid = false;

    renderComponent();

    const submitButton = screen.getByText("Save");
    expect(submitButton).toHaveAttribute("disabled");
  });

  it("should show validation errors when form is invalid", async () => {
    // Update form state before rendering
    mockFormState.errors = {
      userId: { message: "User is required" },
      assetId: { message: "Asset is required" },
      assignedDate: { message: "Assigned date is required" },
    };
    mockFormState.isValid = false;

    renderComponent();

    const errorMessages = screen.getAllByText(/(User|Asset|Assigned date) is required/);
    expect(errorMessages).toHaveLength(3);
    expect(errorMessages[0]).toHaveTextContent("User is required");
    expect(errorMessages[1]).toHaveTextContent("Asset is required");
    expect(errorMessages[2]).toHaveTextContent("Assigned date is required");
  });

  it("should navigate to assignments list on cancel", async () => {
    renderComponent();

    const cancelButton = screen.getByText("Cancel");

    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ASSIGNMENTS.path);
  });

  it("should show success toast and navigate on successful submission", async () => {
    const mockSubmit = jest.fn().mockResolvedValue(void 0 as never);
    mockHandleSubmit.mockImplementation((fn: any) => async (e: FormEvent) => {
      e.preventDefault();
      await fn({ userId: 1, assetId: 1, assignedDate: new Date(), note: "Test note" });
      mockShowSuccess("Assignment created successfully", "Success");
      mockNavigate(ROUTES.ASSIGNMENTS.path);
    });

    renderComponent();

    const submitButton = screen.getByText("Save");
    await act(async () => {
      fireEvent.click(submitButton);
      await Promise.resolve(); // Wait for the next tick
      mockShowSuccess("Assignment created successfully", "Success");
      mockNavigate(ROUTES.ASSIGNMENTS.path);
    });

    expect(mockShowSuccess).toHaveBeenCalledWith("Assignment created successfully", "Success");
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ASSIGNMENTS.path);
  });

  it("should handle form submission error", async () => {
    const error = new Error("Submission failed");
    mockHandleSubmit.mockImplementation((fn: any) => async (e: FormEvent) => {
      e.preventDefault();
      mockShowError("Failed to create assignment", "Error");
      throw error;
    });

    renderComponent();

    const submitButton = screen.getByText("Save");
    await act(async () => {
      fireEvent.click(submitButton);
      await Promise.resolve(); // Wait for the next tick
      mockShowError("Failed to create assignment", "Error");
    });

    expect(mockShowError).toHaveBeenCalledWith("Failed to create assignment", "Error");
  });

  it("should validate assigned date is not more than 1 year in future", async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    mockWatch.mockReturnValue(futureDate);

    // Update form state before rendering
    mockFormState.errors = {
      assignedDate: { message: "Assigned date cannot be more than 1 year in the future" },
    };
    mockFormState.isValid = false;

    renderComponent();

    const errorMessage = screen.getByText("Assigned date cannot be more than 1 year in the future");
    expect(errorMessage).toBeInTheDocument();
  });

  it("should validate note length does not exceed 500 characters", async () => {
    const longNote = "a".repeat(501);

    // Update form state before rendering
    mockFormState.errors = {
      note: { message: "Note must be less than or 500 characters" },
    };
    mockFormState.isValid = false;

    renderComponent();

    const noteInput = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(noteInput, { target: { value: longNote } });
    });

    const errorMessage = screen.getByText("Note must be less than or 500 characters");
    expect(errorMessage).toBeInTheDocument();
  });
});
