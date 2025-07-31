import { getTableConfig } from "@config/TableConfig";
import { useReportManagement } from "@hooks/useReportManagement";
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
  SORT_OPTION_NAMES: { 0: "asc", 1: "desc" },
}));

const mockedUseSearchParams = useSearchParams as jest.Mock;
const mockedGetTableConfig = getTableConfig as jest.Mock;

describe("useReportManagement Hook", () => {
  const defaultConfig = {
    pageSize: 10,
    direction: 1,
    page: 1,
    sortBy: "category",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetTableConfig.mockReturnValue(defaultConfig);
    mockedUseSearchParams.mockReturnValue([new URLSearchParams(), mockSetSearchParams]);
  });

  describe("Initialization", () => {
    it('should call getTableConfig with "report"', () => {
      renderHook(() => useReportManagement());
      expect(mockedGetTableConfig).toHaveBeenCalledWith("report");
      expect(mockedGetTableConfig).toHaveBeenCalledTimes(1);
    });

    it("should initialize with default parameters from config when no URL params are present", () => {
      const { result } = renderHook(() => useReportManagement());

      expect(result.current.params).toEqual({
        pageSize: 10,
        direction: "desc",
        page: 1,
        sortBy: "category",
        keySearch: null,
      });
    });

    it("should initialize with parameters from URL, overriding defaults", () => {
      const searchParams = new URLSearchParams({
        pageSize: "25",
        page: "2",
        sortBy: "total",
        direction: "asc",
        keySearch: "laptops",
      });
      mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

      const { result } = renderHook(() => useReportManagement());

      expect(result.current.params).toEqual({
        pageSize: 25,
        direction: "asc",
        page: 2,
        sortBy: "total",
        keySearch: "laptops",
      });
    });
  });

  describe("updateParams Function", () => {
    it("should update params and call setSearchParams when updateParams is called", () => {
      const { result } = renderHook(() => useReportManagement());

      act(() => {
        result.current.updateParams({ page: 3, keySearch: "test" });
      });

      expect(result.current.params).toEqual({
        pageSize: 10,
        direction: "desc",
        page: 3,
        sortBy: "category",
        keySearch: "test",
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith({
        pageSize: "10",
        direction: "desc",
        page: "3",
        sortBy: "category",
        keySearch: "test",
      });
    });

    it("should filter out null and undefined values when calling setSearchParams", () => {
      const searchParams = new URLSearchParams({ keySearch: "initial" });
      mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

      const { result } = renderHook(() => useReportManagement());
      expect(result.current.params.keySearch).toBe("initial");

      act(() => {
        result.current.updateParams({ keySearch: null });
      });

      expect(result.current.params.keySearch).toBeNull();

      expect(mockSetSearchParams).toHaveBeenCalledWith({
        pageSize: "10",
        direction: "desc",
        page: "1",
        sortBy: "category",
      });
    });

    it("should add a new, previously unknown parameter via updateParams", () => {
      const { result } = renderHook(() => useReportManagement());

      act(() => {
        result.current.updateParams({ customFilter: "active" });
      });

      expect(result.current.params).toHaveProperty("customFilter", "active");
      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({
          customFilter: "active",
        })
      );
    });
  });

  it("should return a `defaultParams` object that reflects the current URL search params", () => {
    const { result, rerender } = renderHook(() => useReportManagement());

    expect(result.current.defaultParams).toEqual({
      pageSize: 10,
      direction: "desc",
      page: 1,
      sortBy: "category",
      keySearch: null,
    });

    const newSearchParams = new URLSearchParams({ page: "3", sortBy: "total" });
    mockedUseSearchParams.mockReturnValue([newSearchParams, mockSetSearchParams]);
    rerender();

    expect(result.current.defaultParams).toEqual({
      pageSize: 10,
      direction: "desc",
      page: 3,
      sortBy: "total",
      keySearch: null,
    });
  });
});
