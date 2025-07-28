import SidebarMenu from "@components/layouts/SidebarMenu";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { getSidebarMenuRoutesByUserType as mockGetSidebarMenuRoutesByUserType } from "@utils/getRouteInfo";
import { Provider, useSelector } from "react-redux";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import configureMockStore from "redux-mock-store";
// Remove this line; do not import useSelector as mockUseSelector
// Mocks
jest.mock("react-redux", () => {
  const actual = jest.requireActual("react-redux");
  return {
    ...(actual as object),
    useSelector: jest.fn(),
  };
});
jest.mock("@utils/getRouteInfo", () => ({
  getSidebarMenuRoutesByUserType: jest.fn(),
}));
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom") as object;
  return {
    ...(actual as object),
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
  };
});

const mockStore = configureMockStore();

describe("SidebarMenu", () => {
  const mockNavigate = jest.fn();
  const mockUseNavigate = useNavigate as jest.Mock;
  const mockUseLocation = useLocation as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLocation.mockReturnValue({ pathname: "/assets" });
  });

  it("renders logo and title", () => {
    (useSelector as unknown as jest.Mock).mockImplementation((fn: any) =>
      fn({ auth: { userProfile: { userType: "admin" } } })
    );
    (mockGetSidebarMenuRoutesByUserType as jest.Mock).mockReturnValue([]);
    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <SidebarMenu />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.getByText("Online Asset Management")).toBeInTheDocument();
  });

  it("renders menu items based on userProfile", () => {
    (useSelector as unknown as jest.Mock).mockImplementation((fn: any) =>
      fn({ auth: { userProfile: { userType: "admin" } } })
    );
    (mockGetSidebarMenuRoutesByUserType as jest.Mock).mockReturnValue([
      { path: "/assets", label: "Assets" },
      { path: "/users", label: "Users" },
    ]);
    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <SidebarMenu />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("Assets")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  it("highlights the active menu item", () => {
    (useSelector as unknown as jest.Mock).mockImplementation((fn: any) =>
      fn({ auth: { userProfile: { userType: "admin" } } })
    );
    (mockGetSidebarMenuRoutesByUserType as jest.Mock).mockReturnValue([
      { path: "/assets", label: "Assets" },
      { path: "/users", label: "Users" },
    ]);
    mockUseLocation.mockReturnValue({ pathname: "/assets" });
    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <SidebarMenu />
        </MemoryRouter>
      </Provider>
    );
    const assetsMenu = screen.getByText("Assets");
    expect(assetsMenu.className).toContain("active-menu");
    const usersMenu = screen.getByText("Users");
    expect(usersMenu.className).not.toContain("active-menu");
  });

  it("calls navigate when a menu item is clicked", () => {
    (useSelector as unknown as jest.Mock).mockImplementation((fn: any) =>
      fn({ auth: { userProfile: { userType: "admin" } } })
    );
    (mockGetSidebarMenuRoutesByUserType as jest.Mock).mockReturnValue([
      { path: "/assets", label: "Assets" },
      { path: "/users", label: "Users" },
    ]);
    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <SidebarMenu />
        </MemoryRouter>
      </Provider>
    );
    fireEvent.click(screen.getByText("Users"));
    expect(mockNavigate).toHaveBeenCalledWith("/users");
  });

  it("does not render menu items if userProfile is not present", () => {
    (useSelector as unknown as jest.Mock).mockImplementation((fn: any) =>
      fn({ auth: { userProfile: { userType: null } } })
    );
    (mockGetSidebarMenuRoutesByUserType as jest.Mock).mockReturnValue([]);
    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <SidebarMenu />
        </MemoryRouter>
      </Provider>
    );
    // Only logo and title should be present
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.getByText("Online Asset Management")).toBeInTheDocument();
    // No menu items
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
