import { returningRequestService } from "@/services/returningRequestService";
import axiosInstance from "@/services/axiosInterceptorService";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

jest.mock("@/services/axiosInterceptorService");
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("returningRequestService.getReturningRequests", () => {
  it("should fetch returning requests with correct params", async () => {
    const mockParams = {
      page: 1,
      pageSize: 10,
      sortBy: "returnedDate",
      direction: "asc",
      keySearch: "keyboard",
      returnedDate: "2024-01-01",
      states: [1, 2],
    };

    const mockResponse = {
      data: {
        total: 1,
        data: [{ id: 1, state: 1 }],
      },
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await returningRequestService.getReturningRequests(mockParams);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/returning-request-management",
      expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
          pageSize: 10,
          sortBy: "returnedDate",
          direction: "asc",
          keySearch: "keyboard",
          returnedDate: "2024-01-01",
          State: [1, 2],
        }),
        paramsSerializer: expect.any(Function),
      })
    );

    expect(result).toEqual(mockResponse.data);
  });

  it("should serialize array and single query params correctly", async () => {
    const mockResponse = {
      data: {
        data: [],
        total: 0,
      },
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const params = {
      page: 1,
      pageSize: 10,
      sortBy: "returnedDate",
      direction: "asc",
      keySearch: "john",
      returnedDate: "2024-01-01",
      states: [1, 2],
    };

    await returningRequestService.getReturningRequests(params);

    const callArgs = mockedAxios.get.mock.calls[0]?.[1];

    expect(callArgs).toBeDefined();

    if (callArgs && typeof callArgs.paramsSerializer === "function") {
      const serialized = callArgs.paramsSerializer(callArgs.params);

      expect(serialized).toContain("State=1");
      expect(serialized).toContain("State=2");
      expect(serialized).toContain("keySearch=john");
      expect(serialized).toContain("returnedDate=2024-01-01");
      expect(serialized).toContain("sortBy=returnedDate");
    } else {
      throw new Error("paramsSerializer is not a function");
    }
  });
});

describe("returningRequestService.cancelReturningRequest", () => {
  it("should patch to cancel endpoint", async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.patch.mockResolvedValueOnce(mockResponse);

    const result = await returningRequestService.cancelReturningRequest(456);

    expect(mockedAxios.patch).toHaveBeenCalledWith("/returning-request-management/456/cancel");
    expect(result).toEqual(mockResponse.data);
  });

  it("should handle completeReturningRequest correctly", async () => {
    const mockResponse = { data: "Completed" };
    mockedAxios.patch.mockResolvedValueOnce(mockResponse);

    const result = await returningRequestService.completeReturningRequest(5);

    expect(mockedAxios.patch).toHaveBeenCalledWith("/returning-request-management/5/complete");
    expect(result).toEqual("Completed");
  });
});
