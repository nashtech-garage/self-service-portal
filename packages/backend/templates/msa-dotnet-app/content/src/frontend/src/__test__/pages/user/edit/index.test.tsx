import React from "react";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureMockStore from "redux-mock-store";
import { thunk } from "redux-thunk";
import type { RootState } from "@store";
import type { UserState } from "@store/userSlice";
import type { AppState } from "@store/appSlice";
import type { AuthState } from "@store/auth/authSlice.login";
import type { AssetState } from "@store/assetSlice";
import type { CategoryState } from "@store/categorySlice";
import type { HomeState } from "@store/homeAssignmentSlice";
import type { MetaDataState } from "@store/metaDataSlice";
import type { CreateAssignmentState } from "@store/createAssignmentSlice";
import type { AdminAssignmentState } from "@store/assignmentSlice";
import type { ReturningRequestState } from "@store/returningRequestSlice";
import type { PersistPartial } from "redux-persist/es/persistReducer";
import type { ReportState } from "@store/reportSlice";
import EditUser from "@/pages/Users/Edit";
import { ROUTES } from "@constants/routes";

// Mock EditUserForm component
jest.mock("@/components/User/EditUserForm", () => ({
  __esModule: true,
  default: () => <div data-testid="edit-user-form">Mock Edit User Form</div>,
}));

// Mock primereact components
jest.mock("primereact/calendar", () => ({
  Calendar: React.forwardRef(({ value, onChange, id, inputId, name, ...props }: any, ref) => (
    <input
      ref={ref}
      type="date"
      id={inputId}
      name={name}
      value={value instanceof Date ? value.toISOString().split("T")[0] : ""}
      onChange={(e) => onChange({ value: new Date(e.target.value) })}
      {...props}
    />
  )),
}));

jest.mock("primereact/radiobutton", () => ({
  RadioButton: React.forwardRef(({ onChange, checked, inputId, ...props }: any, ref) => (
    <input
      type="radio"
      id={inputId}
      checked={checked}
      onChange={(e) => onChange({ value: e.target.value })}
      {...props}
    />
  )),
}));

jest.mock("primereact/button", () => ({
  Button: ({ onClick, children, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("primereact/inputtext", () => ({
  InputText: React.forwardRef((props: any, ref) => <input ref={ref} type="text" {...props} />),
}));

jest.mock("primereact/progressspinner", () => ({
  ProgressSpinner: () => <div data-testid="spinner">Loading...</div>,
}));

jest.mock("@components/common/SelectDropdown", () => ({
  __esModule: true,
  default: ({ value, onChange, options, id, ...props }: any) => (
    <select id={id} value={value} onChange={(e) => onChange({ value: Number(e.target.value) })} {...props}>
      {options?.map((opt: any) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  ),
}));

jest.mock("react-hook-form", () => ({
  Controller: ({ render, name }: any) =>
    render({
      field: {
        value: "",
        onChange: jest.fn(),
        name,
        ref: React.createRef(),
      },
    }),
}));

jest.mock("@components/Toast/useToastContext", () => ({
  useToastContext: () => ({
    showError: jest.fn(),
    showSuccess: jest.fn(),
    showInfo: jest.fn(),
    showWarn: jest.fn(),
  }),
}));

// Mock IconField component
jest.mock("primereact/iconfield", () => ({
  IconField: ({ children }: any) => <>{children}</>,
}));

// Mock InputIcon component
jest.mock("primereact/inputicon", () => ({
  InputIcon: ({ className }: any) => <span className={className} />,
}));

const mockStore = configureMockStore<RootState>([thunk as any]);

const createMockState = (userState: Partial<UserState>) => ({
  app: {
    loading: false,
    toast: null,
  } as AppState,
  auth: {
    _persist: { version: -1, rehydrated: true },
    user: null,
    userProfile: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  } as AuthState & PersistPartial,
  assets: {} as AssetState,
  users: {
    loading: false,
    selectedUser: null,
    error: null,
    ...userState,
  } as UserState,
  categories: {} as CategoryState,
  home: {} as HomeState,
  metaData: {} as MetaDataState,
  createAssignment: {} as CreateAssignmentState,
  adminAssignments: {} as AdminAssignmentState,
  returningRequest: {} as ReturningRequestState,
  editAssignment: {
    assignableUsers: null,
    assignableAssets: null,
    assignmentDetail: null,
    updatedAssignment: null,
    loading: false,
    loadingUpdate: false,
    loadingDelete: false,
    error: null,
    deleteSuccess: false,
  },
  report: {
    isLoading: false,
    error: null,
    report: null,
  } as ReportState,
});

// Test cho component EditUser từ index.tsx
describe("EditUser Page", () => {
  let store: any;

  beforeEach(() => {
    store = mockStore(
      createMockState({
        selectedUser: {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: "1990-01-01",
          gender: 1,
          joinedDate: "2024-01-01",
          userType: 1,
        },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderEditUserPage = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <EditUser />
        </MemoryRouter>
      </Provider>
    );

  it("should render the EditUser component", () => {
    renderEditUserPage();
    expect(screen.getByTestId("edit-user-form")).toBeInTheDocument();
  });

  it("should display the correct title", () => {
    renderEditUserPage();
    expect(screen.getByText(ROUTES.EDIT_USER.title)).toBeInTheDocument();
  });

  it("should render EditUserForm component", () => {
    renderEditUserPage();
    expect(screen.getByTestId("edit-user-form")).toBeInTheDocument();
  });

  it("should have the proper page structure", () => {
    renderEditUserPage();

    // Check title is present with correct class
    const title = screen.getByText(ROUTES.EDIT_USER.title);
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe("H2");
    expect(title.className).toContain("text-primary");

    // Check container divs are present
    const headerDiv = title.closest("div");
    expect(headerDiv).toHaveClass("page-header");

    // Check form wrapper div exists
    const formWrapper = screen.getByTestId("edit-user-form").closest("div");
    expect(formWrapper).toBeTruthy();
  });

  it("should use the correct layout for the form", () => {
    renderEditUserPage();

    // Verify the main container
    const mainContainer = screen.getByText(ROUTES.EDIT_USER.title).parentElement?.parentElement;
    expect(mainContainer).toBeInTheDocument();

    // Check that the header and form sections are rendered correctly
    const headerSection = screen.getByText(ROUTES.EDIT_USER.title).parentElement;
    expect(headerSection).toHaveClass("page-header");

    const formSection = screen.getByTestId("edit-user-form").parentElement;
    expect(formSection).toBeTruthy();
  });

  it("should have wrapper div with proper styling", () => {
    renderEditUserPage();

    // Verify the form section is within a div with mt-4 class
    const formSection = screen.getByTestId("edit-user-form").parentElement;
    expect(formSection).toHaveClass("mt-4");
  });
});
