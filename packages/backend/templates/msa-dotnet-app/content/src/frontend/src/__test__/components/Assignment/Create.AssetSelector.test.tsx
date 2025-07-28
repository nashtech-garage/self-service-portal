import type { PaginationResponse } from "@/entities/api";
import type { AssignableAssetsResponse } from "@/entities/createAssignment";
import createAssignmentReducer from "@/store/createAssignmentSlice";
import { AssetSelector } from "@components/Assignment/assetSelector";
import { ToastProvider } from "@components/Toast/ToastProvider";
import { describe, expect, it, jest } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
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

jest.mock("@components/Toast/ToastProvider", () => ({
  ToastProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// Mock the axiosInterceptorService to prevent circular dependency issues
jest.mock("@/services/axiosInterceptorService", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Create test store isolated from the main application store
const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      createAssignment: createAssignmentReducer,
    },
    preloadedState,
  });

// Mock data for assets
const mockAssets: AssignableAssetsResponse[] = [
  { id: 1, name: "Dell XPS", code: "DX-001", categoryName: "Laptop" },
  { id: 2, name: "LG Monitor", code: "LG-123", categoryName: "Monitor" },
];

const paginatedAssets: PaginationResponse<AssignableAssetsResponse> = {
  data: mockAssets,
  currentPage: 0,
  pageSize: 10,
  total: 2,
  lastPage: 1,
};

const Wrapper = () => {
  const { setValue } = useForm();
  return (
    <Provider
      store={createTestStore({
        createAssignment: {
          assignableUsers: null,
          assignableAssets: paginatedAssets,
          createdAssignment: null,
          loading: false,
          loadingCreate: false,
          error: null,
        },
      })}
    >
      <ToastProvider>
        <AssetSelector setValue={setValue} />
      </ToastProvider>
    </Provider>
  );
};

// Test cases
describe("AssetSelector", () => {
  it("should render asset selector component", async () => {
    await act(async () => {
      render(<Wrapper />);
    });

    // Wait for any state updates to complete
    await waitFor(() => {
      // Test that the search input is rendered
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    const searchIcon = document.querySelector(".pi.pi-search");
    expect(searchIcon).toBeInTheDocument();
  });
});

describe("AssetSelector with no assets", () => {
  it("should display an empty table when there are no assignable assets", async () => {
    const store = createTestStore({
      createAssignment: {
        assignableUsers: null,
        assignableAssets: { data: [], pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
        createdAssignment: null,
        loading: false,
        loadingCreate: false,
        error: null,
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <AssetSelector setValue={jest.fn()} />
        </Provider>
      );
    });

    // Open the dialog by clicking on the input field
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    // After clicking, wait for the dialog to appear
    await waitFor(() => {
      expect(screen.getByText("Select Asset")).toBeInTheDocument();
    });

    // Check that the table is rendered but has no data
    const table = document.querySelector(".p-datatable");
    expect(table).toBeInTheDocument();

    // Check for empty message in table body
    const emptyMessage = screen.getByText(/No available options/i);
    expect(emptyMessage).toBeInTheDocument();
  });
});

describe("AssetSelector interactions", () => {
  it("should open the dialog when clicking the input field", async () => {
    await act(async () => {
      render(<Wrapper />);
    });

    const inputField = screen.getByRole("textbox");

    // Dialog should be hidden initially
    expect(screen.queryByText("Select Asset")).not.toBeInTheDocument();

    // Click to open dialog
    fireEvent.click(inputField);

    // Dialog should be visible
    await waitFor(() => {
      expect(screen.getByText("Select Asset")).toBeInTheDocument();
    });
  });

  it("should select an asset and update the input field", async () => {
    const setValue = jest.fn();

    await act(async () => {
      render(
        <Provider
          store={createTestStore({
            createAssignment: {
              assignableUsers: null,
              assignableAssets: paginatedAssets,
              createdAssignment: null,
              loading: false,
              loadingCreate: false,
              error: null,
            },
          })}
        >
          <AssetSelector setValue={setValue} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByText("Select Asset")).toBeInTheDocument();
    });

    // Select an asset (the first radio button)
    await waitFor(() => {
      const radioButtons = document.querySelectorAll('input[type="radio"]');
      expect(radioButtons.length).toBeGreaterThan(0);
      fireEvent.click(radioButtons[0]);
    });

    // Click save button
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    // Verify setValue was called with correct asset ID
    expect(setValue).toHaveBeenCalledWith("assetId", 1, expect.any(Object));
  });

  it("should apply sorting when clicking column headers", async () => {
    const store = createTestStore({
      createAssignment: {
        assignableUsers: null,
        assignableAssets: paginatedAssets,
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
          <AssetSelector setValue={jest.fn()} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    // Wait for dialog and table to appear
    await waitFor(() => {
      expect(screen.getByText("Select Asset")).toBeInTheDocument();
    });

    // Find and click the Asset Name column header
    const nameColumnHeader = screen.getByText("Asset Name");
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
              assignableUsers: null,
              assignableAssets: paginatedAssets,
              createdAssignment: null,
              loading: false,
              loadingCreate: false,
              error: null,
            },
          })}
        >
          <AssetSelector setValue={setValue} initialValue={1} initialName="Dell XPS" />
        </Provider>
      );
    });

    // Check if input shows the initial name
    const inputField = screen.getByRole("textbox");
    expect(inputField).toHaveValue("Dell XPS");

    // Verify setValue was called with initial value
    expect(setValue).toHaveBeenCalledWith("assetId", 1, expect.any(Object));
  });

  it("should show loading state when fetching assets", async () => {
    // Create a store with loading state
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
          <AssetSelector setValue={jest.fn()} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByText("Select Asset")).toBeInTheDocument();
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

describe("AssetSelector in Create Mode", () => {
  it("should render empty input field when no initial values are provided", async () => {
    const setValue = jest.fn();

    await act(async () => {
      render(
        <Provider
          store={createTestStore({
            createAssignment: {
              assignableUsers: null,
              assignableAssets: paginatedAssets,
              createdAssignment: null,
              loading: false,
              loadingCreate: false,
              error: null,
            },
          })}
        >
          <AssetSelector setValue={setValue} />
        </Provider>
      );
    });

    const inputField = screen.getByRole("textbox");
    expect(inputField).toHaveValue(""); // Input should be empty
    expect(setValue).not.toHaveBeenCalled(); // setValue should not be called initially
  });

  it("should handle search functionality in create mode", async () => {
    const setValue = jest.fn();

    await act(async () => {
      render(
        <Provider
          store={createTestStore({
            createAssignment: {
              assignableUsers: null,
              assignableAssets: paginatedAssets,
              createdAssignment: null,
              loading: false,
              loadingCreate: false,
              error: null,
            },
          })}
        >
          <AssetSelector setValue={setValue} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    await waitFor(() => {
      expect(screen.getByText("Select Asset")).toBeInTheDocument();
    });

    // Find the search input (it's the second textbox in the dialog)
    const searchInputs = screen.getAllByRole("textbox");
    const searchInput = searchInputs[1]; // The search input is the second textbox
    expect(searchInput).toBeInTheDocument();

    // Use the search input
    fireEvent.change(searchInput, { target: { value: "Dell" } });

    // Verify search functionality
    await waitFor(() => {
      const assetName = screen.getByText("Dell XPS");
      expect(assetName).toBeInTheDocument();
    });
  });

  it("should clear selection when clicking cancel button", async () => {
    const setValue = jest.fn();

    await act(async () => {
      render(
        <Provider
          store={createTestStore({
            createAssignment: {
              assignableUsers: null,
              assignableAssets: paginatedAssets,
              createdAssignment: null,
              loading: false,
              loadingCreate: false,
              error: null,
            },
          })}
        >
          <AssetSelector setValue={setValue} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByText("Select Asset")).toBeInTheDocument();
    });

    // Select an asset
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    fireEvent.click(radioButtons[0]);

    // Click cancel button
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Verify input is cleared
    expect(inputField).toHaveValue("");
    // Verify setValue wasn't called after canceling
    expect(setValue).not.toHaveBeenCalled();
  });

  it("should handle pagination in create mode", async () => {
    const store = createTestStore({
      createAssignment: {
        assignableUsers: null,
        assignableAssets: {
          data: [
            ...mockAssets,
            { id: 3, name: "HP Laptop", code: "HP-001", categoryName: "Laptop" },
            { id: 4, name: "Samsung Monitor", code: "SM-001", categoryName: "Monitor" },
          ],
          currentPage: 0,
          pageSize: 2,
          total: 4,
          lastPage: 2,
        },
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
          <AssetSelector setValue={jest.fn()} />
        </Provider>
      );
    });

    // Open the dialog
    const inputField = screen.getByRole("textbox");
    fireEvent.click(inputField);

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByText("Select Asset")).toBeInTheDocument();
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
