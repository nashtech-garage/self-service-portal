import { getTableConfig } from "@config/TableConfig";
import { useActionTableUser } from "@hooks/useUserManagement";
import { act, renderHook } from "@testing-library/react";
import { useSearchParams } from "react-router-dom";

const mockSetSearchParams = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: jest.fn(),
}));

jest.mock("@config/TableConfig", () => ({
  getTableConfig: jest.fn(),
}));
jest.mock("@constants/pagination", () => ({
  SORT_OPTION_NAMES: {
    asc: "asc",
    desc: "desc",
  },
}));

const mockedUseSearchParams = useSearchParams as jest.Mock;
const mockedGetTableConfig = getTableConfig as jest.Mock;

describe("useActionTableUser Hook", () => {
  const tableName = "usersTable";

  const defaultConfig = {
    pageSize: 15,
    direction: "asc",
    page: 1,
    sortBy: "fullName",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetTableConfig.mockReturnValue(defaultConfig);
    mockedUseSearchParams.mockReturnValue([new URLSearchParams(), mockSetSearchParams]);
  });

  it("should initialize with default parameters when no URL params are present", () => {
    const { result } = renderHook(() => useActionTableUser(tableName));

    expect(mockedGetTableConfig).toHaveBeenCalledWith(tableName);
    expect(result.current.params).toEqual({
      pageSize: 15,
      direction: "asc",
      page: 1,
      sortBy: "fullName",
      keySearch: undefined,
      userType: undefined,
    });
  });

  it("should initialize with parameters from URL, including a parsed userType", () => {
    const searchParams = new URLSearchParams({
      pageSize: "50",
      page: "3",
      sortBy: "joinedDate",
      keySearch: "admin",
      userType: "1",
    });
    mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

    const { result } = renderHook(() => useActionTableUser(tableName));

    expect(result.current.params).toEqual({
      pageSize: 50,
      direction: "asc",
      page: 3,
      sortBy: "joinedDate",
      keySearch: "admin",
      userType: 1,
    });
  });

  it("should update params and URL when adding a userType via updateParams", () => {
    const { result } = renderHook(() => useActionTableUser(tableName));

    expect(result.current.params.userType).toBeUndefined();

    act(() => {
      result.current.updateParams({ page: 2, userType: 2 });
    });

    expect(result.current.params).toEqual(
      expect.objectContaining({
        page: 2,
        userType: 2,
      })
    );

    expect(mockSetSearchParams).toHaveBeenCalledWith({
      pageSize: "15",
      direction: "asc",
      page: "2",
      sortBy: "fullName",
      userType: "2",
    });
  });

  it("should remove userType from URL when it is set to undefined via updateParams", () => {
    const searchParams = new URLSearchParams({ userType: "1" });
    mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

    const { result } = renderHook(() => useActionTableUser(tableName));
    expect(result.current.params.userType).toBe(1);
    act(() => {
      result.current.updateParams({ userType: undefined });
    });
    expect(result.current.params.userType).toBeUndefined();
    expect(mockSetSearchParams).toHaveBeenCalledWith({
      pageSize: "15",
      direction: "asc",
      page: "1",
      sortBy: "fullName",
    });
  });

  it("should result in NaN for userType if the URL param is not a valid number", () => {
    const searchParams = new URLSearchParams({ userType: "admin" });
    mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

    const { result } = renderHook(() => useActionTableUser(tableName));
    expect(result.current.params.userType).toBeNaN();
  });

  it("should return a `defaultParams` object that correctly reflects the userType from URL", () => {
    const searchParams = new URLSearchParams({ userType: "2" });
    mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

    const { result } = renderHook(() => useActionTableUser(tableName));
    expect(result.current.defaultParams).toEqual({
      pageSize: 15,
      direction: "asc",
      page: 1,
      sortBy: "fullName",
      keySearch: undefined,
      userType: 2,
    });
  });

  it("should remove keySearch from URL when it is set to undefined via updateParams", () => {
    const searchParams = new URLSearchParams({ keySearch: "initial" });
    mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

    const { result } = renderHook(() => useActionTableUser(tableName));
    expect(result.current.params.keySearch).toBe("initial");

    act(() => {
      result.current.updateParams({ keySearch: undefined });
    });

    expect(result.current.params.keySearch).toBeUndefined();
    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.not.objectContaining({
        keySearch: expect.any(String),
      })
    );
  });
});
