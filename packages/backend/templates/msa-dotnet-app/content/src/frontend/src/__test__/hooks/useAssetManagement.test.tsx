import { getTableConfig } from "@config/TableConfig";
import { useActionTable } from "@hooks/useAssetManagement";
import { act, renderHook } from "@testing-library/react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const mockSetSearchParams = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: jest.fn(),
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
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
const mockedUseSelector = useSelector as unknown as jest.Mock;
const mockedGetTableConfig = getTableConfig as jest.Mock;

describe("useActionTable Hook", () => {
  const tableName = "assetsTable";

  const defaultConfig = {
    pageSize: 15,
    direction: "desc",
    page: 1,
    sortBy: "id",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetTableConfig.mockReturnValue(defaultConfig);
    mockedUseSelector.mockReturnValue(undefined);
    mockedUseSearchParams.mockReturnValue([new URLSearchParams(), mockSetSearchParams]);
  });

  it("should initialize with default parameters from config when no URL or Redux params are present", () => {
    const { result } = renderHook(() => useActionTable(tableName));
    expect(mockedGetTableConfig).toHaveBeenCalledWith(tableName);
    expect(result.current.params).toEqual({
      pageSize: 15,
      direction: "desc",
      page: 1,
      sortBy: "id",
      keySearch: null,
    });
  });

  it("should initialize with parameters from URL search params, overriding defaults", () => {
    const searchParams = new URLSearchParams({
      pageSize: "25",
      page: "2",
      sortBy: "name",
      direction: "asc",
      keySearch: "laptop",
    });
    mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);
    const { result } = renderHook(() => useActionTable(tableName));
    expect(result.current.params).toEqual({
      pageSize: 25,
      direction: "asc",
      page: 2,
      sortBy: "name",
      keySearch: "laptop",
    });
  });

  it("should initialize with parameters from Redux store, overriding URL and default params", () => {
    const reduxParams = {
      pageSize: 50,
      direction: "asc",
      page: 5,
      sortBy: "updatedAt",
      keySearch: "redux-search",
    };
    mockedUseSelector.mockReturnValue(reduxParams);
    const searchParams = new URLSearchParams({ pageSize: "25", page: "2" });
    mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);
    const { result } = renderHook(() => useActionTable(tableName));
    expect(result.current.params).toEqual(reduxParams);
  });

  it("should update params and call setSearchParams when updateParams is called", () => {
    const { result } = renderHook(() => useActionTable(tableName));
    act(() => {
      result.current.updateParams({ page: 3, keySearch: "test" });
    });
    expect(result.current.params).toEqual({
      ...defaultConfig,
      direction: "desc",
      page: 3,
      keySearch: "test",
    });
    expect(mockSetSearchParams).toHaveBeenCalledWith({
      pageSize: "15",
      direction: "desc",
      page: "3",
      sortBy: "id",
      keySearch: "test",
    });
  });

  it("should filter out null values when calling setSearchParams", () => {
    const searchParams = new URLSearchParams({ keySearch: "initial" });
    mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);
    const { result } = renderHook(() => useActionTable(tableName));
    act(() => {
      result.current.updateParams({ keySearch: null });
    });
    expect(result.current.params.keySearch).toBeNull();
    expect(mockSetSearchParams).toHaveBeenCalledWith({
      pageSize: "15",
      direction: "desc",
      page: "1",
      sortBy: "id",
    });
  });

  it("should initialize with a mix of URL and default parameters", () => {
    const searchParams = new URLSearchParams({ page: "5", keySearch: "mixed" });
    mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

    const { result } = renderHook(() => useActionTable(tableName));

    expect(result.current.params).toEqual({
      pageSize: 15,
      direction: "desc",
      page: 5,
      sortBy: "id",
      keySearch: "mixed",
    });
  });

  it("should handle invalid numeric URL params by resulting in NaN", () => {
    const searchParams = new URLSearchParams({ pageSize: "abc", page: "xyz" });
    mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

    const { result } = renderHook(() => useActionTable(tableName));

    expect(result.current.params).toEqual({
      pageSize: NaN,
      direction: "desc",
      page: NaN,
      sortBy: "id",
      keySearch: null,
    });
  });

  it("should filter out undefined values when calling setSearchParams", () => {
    const { result } = renderHook(() => useActionTable(tableName));

    act(() => {
      result.current.updateParams({ keySearch: undefined, page: undefined });
    });

    expect(result.current.params.keySearch).toBeUndefined();
    expect(result.current.params.page).toBeUndefined();
    expect(mockSetSearchParams).toHaveBeenCalledWith({
      pageSize: "15",
      direction: "desc",
      sortBy: "id",
    });
  });

  it("should add a new, previously unknown parameter via updateParams", () => {
    const { result } = renderHook(() => useActionTable(tableName));

    act(() => {
      result.current.updateParams({ statusFilter: "active" });
    });

    expect(result.current.params).toHaveProperty("statusFilter", "active");
    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.objectContaining({
        statusFilter: "active",
      })
    );
  });

  it("should return a `defaultParams` object that reflects the current URL search params", () => {
    const { result, rerender } = renderHook(({ p_tableName }) => useActionTable(p_tableName), {
      initialProps: { p_tableName: tableName },
    });
    expect(result.current.defaultParams).toEqual({
      pageSize: 15,
      direction: "desc",
      page: 1,
      sortBy: "id",
      keySearch: null,
    });
    const newSearchParams = new URLSearchParams({ page: "3", sortBy: "name" });
    mockedUseSearchParams.mockReturnValue([newSearchParams, mockSetSearchParams]);
    rerender({ p_tableName: tableName });
    expect(result.current.defaultParams).toEqual({
      pageSize: 15,
      direction: "desc",
      page: 3,
      sortBy: "name",
      keySearch: null,
    });
  });
});
