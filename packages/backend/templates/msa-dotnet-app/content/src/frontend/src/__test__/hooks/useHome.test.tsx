import { homeAssignmentService } from "@/services/homeAssignmentService";
import { useHome } from "@hooks/useHome";
import { act, renderHook, waitFor } from "@testing-library/react";

jest.mock("@/services/homeAssignmentService", () => ({
  homeAssignmentService: {
    getMyAssignments: jest.fn(),
  },
}));

const mockedGetMyAssignments = homeAssignmentService.getMyAssignments as jest.Mock;

describe("useHome Hook", () => {
  const mockAssignments = [
    { id: 1, assetCode: "LP001", assetName: "Laptop" },
    { id: 2, assetCode: "MO002", assetName: "Monitor" },
  ];
  const mockResponse = {
    data: mockAssignments,
    total: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should fetch assignments and update state on successful API call", async () => {
    mockedGetMyAssignments.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useHome());

    expect(result.current.loading).toBe(true);
    expect(result.current.assignments).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.totalRecords).toBe(0);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.assignments).toEqual(mockAssignments);
    expect(result.current.totalRecords).toBe(2);
    expect(result.current.error).toBeNull();

    expect(mockedGetMyAssignments).toHaveBeenCalledWith({});
    expect(mockedGetMyAssignments).toHaveBeenCalledTimes(1);
  });

  it("should set error state on failed API call", async () => {
    const error = new Error("Network Error");
    mockedGetMyAssignments.mockRejectedValue(error);

    const { result } = renderHook(() => useHome());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load assignments");
    expect(result.current.assignments).toEqual([]);
    expect(result.current.totalRecords).toBe(0);
    expect(console.error).toHaveBeenCalledWith("Error fetching assignments:", error);
  });

  it("should refetch data when queryParams change", async () => {
    mockedGetMyAssignments.mockResolvedValue(mockResponse);

    const { rerender } = renderHook(({ queryParams }) => useHome(queryParams), {
      initialProps: { queryParams: { page: 1 } },
    });

    await waitFor(() => {
      expect(mockedGetMyAssignments).toHaveBeenCalledTimes(1);
    });
    expect(mockedGetMyAssignments).toHaveBeenCalledWith({ page: 1 });

    const newQueryParams = { page: 2, sortBy: "name" };
    rerender({ queryParams: newQueryParams });

    await waitFor(() => {
      expect(mockedGetMyAssignments).toHaveBeenCalledTimes(2);
    });
    expect(mockedGetMyAssignments).toHaveBeenCalledWith(newQueryParams);
  });

  it("should refetch data when refreshData is called", async () => {
    mockedGetMyAssignments.mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useHome());

    await waitFor(() => {
      expect(mockedGetMyAssignments).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.refreshData();
    });

    await waitFor(() => {
      expect(mockedGetMyAssignments).toHaveBeenCalledTimes(2);
    });
  });

  it("should set loading to true during fetch and false after", async () => {
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockedGetMyAssignments.mockReturnValue(promise);

    const { result } = renderHook(() => useHome());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise(mockResponse);
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });
});
