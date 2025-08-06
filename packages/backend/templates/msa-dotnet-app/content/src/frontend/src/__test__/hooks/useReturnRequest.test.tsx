import { getTableConfig } from "@/config/TableConfig";
import { useReturnRequest } from "@hooks/useReturnRequest";
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
  SORT_OPTION_NAMES: { 0: "asc", 1: "desc" },
}));

const mockedUseSearchParams = useSearchParams as jest.Mock;
const mockedGetTableConfig = getTableConfig as jest.Mock;

describe("useReturnRequest Hook", () => {
  const tableName = "returnRequests";
  const defaultConfig = {
    pageSize: 15,
    direction: 1,
    page: 1,
    sortBy: "assetCode",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetTableConfig.mockReturnValue(defaultConfig);
    mockedUseSearchParams.mockReturnValue([new URLSearchParams(), mockSetSearchParams]);
  });

  describe("Initialization (Reading Params)", () => {
    it("should use default config values when URL has no params", () => {
      const { result } = renderHook(() => useReturnRequest(tableName));

      expect(result.current.params).toEqual({
        pageSize: 15,
        direction: "desc",
        page: 1,
        sortBy: "assetCode",
        keySearch: undefined,
        states: undefined,
        returnedDate: undefined,
      });
    });

    it("should parse parameters from URL correctly, including splitting 'states'", () => {
      const searchParams = new URLSearchParams({
        page: "2",
        sortBy: "requestedBy",
        search: "laptop",
        states: "1,2",
        returnedDate: "2024-05-20",
      });
      mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);

      const { result } = renderHook(() => useReturnRequest(tableName));

      expect(result.current.params).toEqual({
        pageSize: 15,
        direction: "desc",
        page: 2,
        sortBy: "requestedBy",
        keySearch: "laptop",
        states: [1, 2],
        returnedDate: "2024-05-20",
      });
    });

    it("should result in an array of NaN if states param is not numeric", () => {
      const searchParams = new URLSearchParams({ states: "a,b,c" });
      mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);
      const { result } = renderHook(() => useReturnRequest(tableName));
      expect(result.current.params.states).toEqual([NaN, NaN, NaN]);
    });
  });

  describe("updateParams Function", () => {
    it("should update params and call setSearchParams with stringified values", () => {
      const { result } = renderHook(() => useReturnRequest(tableName));

      act(() => {
        result.current.updateParams({ page: 3, keySearch: "new search" });
      });

      expect(result.current.params.page).toBe(3);
      expect(result.current.params.keySearch).toBe("new search");

      expect(mockSetSearchParams).toHaveBeenCalledWith({
        pageSize: "15",
        direction: "desc",
        page: "3",
        sortBy: "assetCode",
        keySearch: "new search",
      });
    });

    it("should convert array 'states' to a comma-separated string for the URL", () => {
      const { result } = renderHook(() => useReturnRequest(tableName));

      act(() => {
        result.current.updateParams({ states: [3, 4] });
      });
      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({
          states: "3,4",
        })
      );
    });

    it("should filter out null, undefined, and empty string values when updating URL", () => {
      const { result } = renderHook(() => useReturnRequest(tableName));

      act(() => {
        result.current.updateParams({
          keySearch: "",
          returnedDate: null,
          states: undefined,
          page: 5,
        });
      });

      const expectedParams = {
        pageSize: "15",
        direction: "desc",
        page: "5",
        sortBy: "assetCode",
      };

      expect(mockSetSearchParams).toHaveBeenCalledWith(expectedParams);

      const calledWith = mockSetSearchParams.mock.calls[0][0];
      expect(calledWith).not.toHaveProperty("keySearch");
      expect(calledWith).not.toHaveProperty("returnedDate");
      expect(calledWith).not.toHaveProperty("states");
    });

    it("should remove a parameter from URL if its new value is an empty string", () => {
      const searchParams = new URLSearchParams({ keySearch: "initial" });
      mockedUseSearchParams.mockReturnValue([searchParams, mockSetSearchParams]);
      const { result } = renderHook(() => useReturnRequest(tableName));

      act(() => {
        result.current.updateParams({ keySearch: "" });
      });

      expect(result.current.params.keySearch).toBe("");
      const calledWith = mockSetSearchParams.mock.calls[0][0];
      expect(calledWith).not.toHaveProperty("keySearch");
    });
  });
});
