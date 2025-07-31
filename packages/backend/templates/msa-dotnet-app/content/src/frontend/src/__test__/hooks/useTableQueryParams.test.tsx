import { getTableConfig } from "@/config/TableConfig";
import { SORT_OPTION_VALUES } from "@/constants/pagination";
import { useTableQueryParams } from "@hooks/useTableQueryParams";
import { act, renderHook } from "@testing-library/react";
import { useSearchParams } from "react-router-dom";

const mockSetSearchParams = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: jest.fn(),
}));

jest.mock("@/config/TableConfig", () => ({
  getTableConfig: jest.fn(),
}));
jest.mock("@/constants/pagination", () => ({
  SORT_OPTION_VALUES: { asc: 0, desc: 1 },
  SORT_OPTION_NAMES: { 0: "asc", 1: "desc" },
}));
const mockedUseSearchParams = useSearchParams as jest.Mock;
const mockedGetTableConfig = getTableConfig as jest.Mock;

describe("useTableQueryParams Hook", () => {
  const tableType = "testTable";
  const defaultConfig = {
    page: 1,
    pageSize: 10,
    sortBy: "id",
    direction: SORT_OPTION_VALUES.desc,
    search: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetTableConfig.mockReturnValue(defaultConfig);
    mockedUseSearchParams.mockReturnValue([new URLSearchParams(), mockSetSearchParams]);
  });

  describe("Initialization (Reading Params)", () => {
    it("should use default config values when URL has no params", () => {
      const { result } = renderHook(() => useTableQueryParams(tableType));

      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(10);
      expect(result.current.sortBy).toBe("id");
      expect(result.current.direction).toBe(SORT_OPTION_VALUES.desc);
      expect(result.current.search).toBe("");
    });

    it("should use values from URL params, overriding defaults", () => {
      const searchParams = new URLSearchParams({
        page: "3",
        pageSize: "50",
        sortBy: "name",
        direction: "asc",
        search: "test query",
      });
      mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

      const { result } = renderHook(() => useTableQueryParams(tableType));

      expect(result.current.page).toBe(3);
      expect(result.current.pageSize).toBe(50);
      expect(result.current.sortBy).toBe("name");
      expect(result.current.direction).toBe(SORT_OPTION_VALUES.asc);
      expect(result.current.search).toBe("test query");
    });

    it("should correctly parse direction 'desc' from URL", () => {
      const searchParams = new URLSearchParams({ direction: "DESC" });
      mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);
      const { result } = renderHook(() => useTableQueryParams(tableType));
      expect(result.current.direction).toBe(SORT_OPTION_VALUES.desc);
    });
  });

  describe("setTableQueryParams Function", () => {
    it("should update a single parameter and preserve others", () => {
      const { result } = renderHook(() => useTableQueryParams(tableType));

      act(() => {
        result.current.setTableQueryParams({ page: 5 });
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith({
        page: "5",
        pageSize: "10",
        sortBy: "id",
        direction: "desc",
      });
    });

    it("should correctly convert numeric direction back to string for URL", () => {
      const { result } = renderHook(() => useTableQueryParams(tableType));

      act(() => {
        result.current.setTableQueryParams({ direction: SORT_OPTION_VALUES.asc });
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: "asc",
        })
      );
    });

    it("should add search parameter if provided", () => {
      const { result } = renderHook(() => useTableQueryParams(tableType));

      act(() => {
        result.current.setTableQueryParams({ search: "new search" });
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "new search",
        })
      );
    });

    it("should remove search parameter if set to empty string", () => {
      const searchParams = new URLSearchParams({ search: "old search" });
      mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);
      const { result } = renderHook(() => useTableQueryParams(tableType));

      act(() => {
        result.current.setTableQueryParams({ search: "" });
      });
      expect(mockSetSearchParams).toHaveBeenCalledWith(expect.not.objectContaining({ search: expect.anything() }));
    });

    it("should add and preserve custom parameters", () => {
      const searchParams = new URLSearchParams({ filterStatus: "active" });
      mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);
      const { result } = renderHook(() => useTableQueryParams(tableType));

      act(() => {
        result.current.setTableQueryParams({ page: 2, newFilter: "pending" });
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith({
        page: "2",
        pageSize: "10",
        sortBy: "id",
        direction: "desc",
        filterStatus: "active",
        newFilter: "pending",
      });
    });

    it("should ignore custom params with undefined, null, or empty string values", () => {
      const { result } = renderHook(() => useTableQueryParams(tableType));

      act(() => {
        result.current.setTableQueryParams({
          filter1: "value",
          filter2: undefined,
          filter3: null,
          filter4: "",
        });
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({
          filter1: "value",
        })
      );
      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.not.objectContaining({
          filter2: expect.anything(),
          filter3: expect.anything(),
          filter4: expect.anything(),
        })
      );
    });
  });

  describe("DataTable Event Handlers", () => {
    it("onPageChange should update page and pageSize correctly", () => {
      const { result } = renderHook(() => useTableQueryParams(tableType));
      const mockEvent = { page: 2, rows: 25 };

      act(() => {
        result.current.onPageChange(mockEvent);
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({
          page: "3",
          pageSize: "25",
        })
      );
    });

    it("onSort should update sortBy and direction correctly", () => {
      const { result } = renderHook(() => useTableQueryParams(tableType));
      const mockEvent = { sortField: "date", sortOrder: SORT_OPTION_VALUES.asc };

      act(() => {
        result.current.onSort(mockEvent);
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: "date",
          direction: "asc",
        })
      );
    });
  });
});
