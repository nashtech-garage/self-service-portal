import { UserSelector } from "@/components/Assignment/userSelector";
import { type PaginationResponse } from "@/entities/api";
import { type AssignableUsersResponse } from "@/entities/createAssignment";
import { UserTypeEnum } from "@/entities/enums";
import createAssignmentReducer from "@/store/createAssignmentSlice";
import { describe, expect, it, jest } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { Provider } from "react-redux";

// Mock toast context
jest.mock("@components/Toast/useToastContext", () => ({
  useToastContext: () => ({
    showError: jest.fn(),
    showSuccess: jest.fn(),
    showInfo: jest.fn(),
    showWarn: jest.fn(),
  }),
}));

// Mock the axiosInterceptorService
jest.mock("@/services/axiosInterceptorService", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock the createAssignment schema
jest.mock("@/schemas/createAssignment.schema", () => ({
  createAssignmentSchema: {
    shape: {
      userId: {
        _def: {
          typeName: "ZodNumber",
        },
      },
    },
  },
}));

// Create test store
const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      createAssignment: createAssignmentReducer,
    },
    preloadedState,
  });

// Mock data for users
const mockUsers: AssignableUsersResponse[] = [
  { id: 1, staffCode: "SD0001", fullName: "John Doe", type: UserTypeEnum.STAFF },
  { id: 2, staffCode: "SD0002", fullName: "Jane Smith", type: UserTypeEnum.ADMIN },
];

const paginatedUsers: PaginationResponse<AssignableUsersResponse> = {
  data: mockUsers,
  currentPage: 0,
  pageSize: 10,
  total: 2,
  lastPage: 1,
};

// Test wrapper component
const Wrapper = () => {
  const { setValue } = useForm();
  return (
    <Provider
      store={createTestStore({
        createAssignment: {
          assignableUsers: paginatedUsers,
          assignableAssets: null,
          createdAssignment: null,
          loading: false,
          loadingCreate: false,
          error: null,
        },
      })}
    >
      <UserSelector setValue={setValue} />
    </Provider>
  );
};

describe("UserSelector", () => {
  it("should render user selector component", async () => {
    await act(async () => {
      render(<Wrapper />);
    });

    await waitFor(() => {
      const inputField = screen.getByRole("textbox");
      expect(inputField).toBeInTheDocument();
    });

    const searchIcon = document.querySelector(".pi.pi-search");
    expect(searchIcon).toBeInTheDocument();
  });
});

describe("UserSelector with no users", () => {
  it("should display an empty table when there are no assignable users", async () => {
    const store = createTestStore({
      createAssignment: {
        assignableUsers: { data: [], currentPage: 0, pageSize: 10, total: 0, lastPage: 0 },
        assignableAssets: null,
        createdAssignment: null,
        loading: false,
        loadingCreate: false,
        error: null,
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <UserSelector setValue={jest.fn()} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    await waitFor(() => {
      expect(screen.getByText("Select User")).toBeInTheDocument();
    });

    const emptyMessage = screen.getByText("No available options");
    expect(emptyMessage).toBeInTheDocument();
  });
});

describe("UserSelector interactions", () => {
  it("should open the dialog when clicking the input field", async () => {
    await act(async () => {
      render(<Wrapper />);
    });

    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    await waitFor(() => {
      expect(screen.getByText("Select User")).toBeInTheDocument();
    });
  });

  it("should select a user and update the input field", async () => {
    const setValue = jest.fn();

    await act(async () => {
      render(
        <Provider
          store={createTestStore({
            createAssignment: {
              assignableUsers: paginatedUsers,
              assignableAssets: null,
              createdAssignment: null,
              loading: false,
              loadingCreate: false,
              error: null,
            },
          })}
        >
          <UserSelector setValue={setValue} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    await waitFor(() => {
      expect(screen.getByText("Select User")).toBeInTheDocument();
    });

    // Select a user
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    fireEvent.click(radioButtons[0]);

    // Click save button
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    // Verify setValue was called with correct user ID
    expect(setValue).toHaveBeenCalledWith("userId", 1, expect.any(Object));
  });

  it("should apply sorting when clicking column headers", async () => {
    const store = createTestStore({
      createAssignment: {
        assignableUsers: paginatedUsers,
        assignableAssets: null,
        createdAssignment: null,
        loading: false,
        loadingCreate: false,
        error: null,
      },
    });

    const dispatchSpy = jest.spyOn(store, "dispatch");

    await act(async () => {
      render(
        <Provider store={store}>
          <UserSelector setValue={jest.fn()} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    await waitFor(() => {
      expect(screen.getByText("Select User")).toBeInTheDocument();
    });

    // Find and click the Full Name column header
    const nameColumnHeader = screen.getByText("Full Name");
    fireEvent.click(nameColumnHeader);

    // Wait for the dispatch to be called
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });

    // Verify that at least one dispatch call contains our expected type
    const dispatchCalls = dispatchSpy.mock.calls;
    const hasExpectedAction = dispatchCalls.some((call) => call[0] && typeof call[0] === "function");
    expect(hasExpectedAction).toBeTruthy();
  });

  it("should initialize with provided values", async () => {
    const setValue = jest.fn();

    await act(async () => {
      render(
        <Provider
          store={createTestStore({
            createAssignment: {
              assignableUsers: paginatedUsers,
              assignableAssets: null,
              createdAssignment: null,
              loading: false,
              loadingCreate: false,
              error: null,
            },
          })}
        >
          <UserSelector setValue={setValue} initialValue={1} initialName="John Doe" />
        </Provider>
      );
    });

    const inputField = screen.getByRole("textbox");
    expect(inputField).toHaveValue("John Doe");
    expect(setValue).toHaveBeenCalledWith("userId", 1, expect.any(Object));
  });

  it("should show loading state when fetching users", async () => {
    const store = createTestStore({
      createAssignment: {
        assignableUsers: null,
        assignableAssets: null,
        createdAssignment: null,
        loading: true,
        loadingCreate: false,
        error: null,
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <UserSelector setValue={jest.fn()} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    await waitFor(() => {
      expect(screen.getByText("Select User")).toBeInTheDocument();
    });

    // Verify loading state indicators
    const table = document.querySelector(".p-datatable-table");
    expect(table).toBeInTheDocument();

    const emptyMessage = screen.getByText("No available options");
    expect(emptyMessage).toBeInTheDocument();

    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton).toBeDisabled();
  });
});

describe("UserSelector in Create Mode", () => {
  it("should render empty input field when no initial values are provided", async () => {
    const setValue = jest.fn();

    await act(async () => {
      render(
        <Provider
          store={createTestStore({
            createAssignment: {
              assignableUsers: paginatedUsers,
              assignableAssets: null,
              createdAssignment: null,
              loading: false,
              loadingCreate: false,
              error: null,
            },
          })}
        >
          <UserSelector setValue={setValue} />
        </Provider>
      );
    });

    const inputField = screen.getByRole("textbox");
    expect(inputField).toHaveValue("");
    expect(setValue).not.toHaveBeenCalled();
  });

  it("should handle search functionality in create mode", async () => {
    const setValue = jest.fn();

    await act(async () => {
      render(
        <Provider
          store={createTestStore({
            createAssignment: {
              assignableUsers: paginatedUsers,
              assignableAssets: null,
              createdAssignment: null,
              loading: false,
              loadingCreate: false,
              error: null,
            },
          })}
        >
          <UserSelector setValue={setValue} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    await waitFor(() => {
      expect(screen.getByText("Select User")).toBeInTheDocument();
    });

    // Find the search input (it's the second textbox in the dialog)
    const searchInputs = screen.getAllByRole("textbox");
    const searchInput = searchInputs[1];
    expect(searchInput).toBeInTheDocument();

    // Use the search input
    fireEvent.change(searchInput, { target: { value: "John" } });

    // Verify search functionality
    await waitFor(() => {
      const userName = screen.getByText("John Doe");
      expect(userName).toBeInTheDocument();
    });
  });

  it("should clear selection when clicking cancel button", async () => {
    const setValue = jest.fn();

    await act(async () => {
      render(
        <Provider
          store={createTestStore({
            createAssignment: {
              assignableUsers: paginatedUsers,
              assignableAssets: null,
              createdAssignment: null,
              loading: false,
              loadingCreate: false,
              error: null,
            },
          })}
        >
          <UserSelector setValue={setValue} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    await waitFor(() => {
      expect(screen.getByText("Select User")).toBeInTheDocument();
    });

    // Select a user
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    fireEvent.click(radioButtons[0]);

    // Click cancel button
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Verify input is cleared
    expect(inputField).toHaveValue("");
    expect(setValue).not.toHaveBeenCalled();
  });

  it("should handle pagination in create mode", async () => {
    const store = createTestStore({
      createAssignment: {
        assignableUsers: {
          data: [
            ...mockUsers,
            { id: 3, staffCode: "SD0003", fullName: "Bob Wilson", type: UserTypeEnum.STAFF },
            { id: 4, staffCode: "SD0004", fullName: "Alice Brown", type: UserTypeEnum.ADMIN },
          ],
          currentPage: 0,
          pageSize: 2,
          total: 4,
          lastPage: 2,
        },
        assignableAssets: null,
        createdAssignment: null,
        loading: false,
        loadingCreate: false,
        error: null,
      },
    });

    const dispatchSpy = jest.spyOn(store, "dispatch");

    await act(async () => {
      render(
        <Provider store={store}>
          <UserSelector setValue={jest.fn()} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    await waitFor(() => {
      expect(screen.getByText("Select User")).toBeInTheDocument();
    });

    // Find and click next page button
    const nextPageButton = document.querySelector(".p-paginator-next");
    fireEvent.click(nextPageButton);

    // Wait for the dispatch to be called
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });

    // Verify that at least one dispatch call was made
    const dispatchCalls = dispatchSpy.mock.calls;
    const hasDispatchCall = dispatchCalls.length > 0;
    expect(hasDispatchCall).toBeTruthy();
  });
});
