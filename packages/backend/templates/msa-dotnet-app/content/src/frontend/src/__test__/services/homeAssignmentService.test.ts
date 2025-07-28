import { homeAssignmentService } from "@/services/homeAssignmentService";
import axiosInstance from "@/services/axiosInterceptorService";
import { getTableConfig } from "@/config/TableConfig";
import { describe, it, expect, jest, beforeEach } from "@jest/globals"; // hoặc dùng @jest/globals nếu bạn đang dùng Jest thuần
import { SORT_OPTION_NAMES, SORT_OPTION_VALUES } from "@constants/pagination";

jest.mock("@/services/axiosInterceptorService");
jest.mock("@/config/TableConfig", () => ({
  getTableConfig: jest.fn(),
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
const mockedGetTableConfig = getTableConfig as jest.MockedFunction<typeof getTableConfig>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getMyAssignments", () => {
  it("should fetch assignments with default config if no params", async () => {
    mockedGetTableConfig.mockReturnValue({
      page: 1,
      pageSize: 10,
      sortBy: "assignedDate",
      direction: 1,
      search: "",
    });

    const mockResponse = {
      data: {
        total: 1,
        data: [{ id: 1, note: "Test assignment" }],
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await homeAssignmentService.getMyAssignments();

    expect(mockedAxios.get).toHaveBeenCalledWith("/home/my-assignment", {
      params: {
        page: 1,
        pageSize: 10,
        sortBy: "assignedDate",
        direction: "asc",
      },
    });

    expect(result.data).toEqual(mockResponse.data.data);
    expect(result.total).toBe(1);
  });
});

it("should handle string direction 'ASC'", async () => {
  mockedGetTableConfig.mockReturnValue({
    page: 1,
    pageSize: 10,
    sortBy: "assignedDate",
    direction: 1, // fallback if params not provided
    search: "",
  });

  const mockResponse = {
    data: {
      total: 1,
      data: [{ id: 1, note: "Test assignment" }],
    },
  };

  mockedAxios.get.mockResolvedValueOnce(mockResponse);

  const result = await homeAssignmentService.getMyAssignments({
    direction: "ASC",
  });

  expect(mockedAxios.get).toHaveBeenCalledWith("/home/my-assignment", {
    params: expect.objectContaining({
      direction: SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc],
    }),
  });

  expect(result.data).toEqual(mockResponse.data.data);
});

it("should handle string direction 'DESC'", async () => {
  mockedGetTableConfig.mockReturnValue({
    page: 1,
    pageSize: 10,
    sortBy: "assignedDate",
    direction: 1,
    search: "",
  });

  const mockResponse = {
    data: {
      total: 2,
      data: [{ id: 2, note: "Test DESC" }],
    },
  };

  mockedAxios.get.mockResolvedValueOnce(mockResponse);

  const result = await homeAssignmentService.getMyAssignments({
    direction: "DESC",
  });

  expect(mockedAxios.get).toHaveBeenCalledWith("/home/my-assignment", {
    params: expect.objectContaining({
      direction: SORT_OPTION_NAMES[SORT_OPTION_VALUES.desc], // "descending"
    }),
  });

  expect(result.data).toEqual(mockResponse.data.data);
});

it("should fallback to lowercase when unknown string direction is passed", async () => {
  mockedGetTableConfig.mockReturnValue({
    page: 1,
    pageSize: 10,
    sortBy: "assignedDate",
    direction: 1,
    search: "",
  });

  const mockResponse = {
    data: {
      total: 1,
      data: [{ id: 3, note: "Test weird direction" }],
    },
  };

  mockedAxios.get.mockResolvedValueOnce(mockResponse);

  const result = await homeAssignmentService.getMyAssignments({
    direction: "foobar", // not ASC or DESC
  });

  expect(mockedAxios.get).toHaveBeenCalledWith("/home/my-assignment", {
    params: expect.objectContaining({
      direction: "foobar", // lowercase fallback
    }),
  });

  expect(result.data).toEqual(mockResponse.data.data);
});

it("should convert numeric direction 1 to 'ascending'", async () => {
  mockedGetTableConfig.mockReturnValue({
    page: 1,
    pageSize: 10,
    sortBy: "assignedDate",
    direction: 1,
    search: "",
  });

  const mockResponse = {
    data: {
      total: 1,
      data: [{ id: 4, note: "Direction 1" }],
    },
  };

  mockedAxios.get.mockResolvedValueOnce(mockResponse);

  const result = await homeAssignmentService.getMyAssignments({
    direction: 1,
  });

  expect(mockedAxios.get).toHaveBeenCalledWith("/home/my-assignment", {
    params: expect.objectContaining({
      direction: "asc",
    }),
  });

  expect(result.data).toEqual(mockResponse.data.data);
});

it("should convert numeric direction -1 to 'descending'", async () => {
  mockedGetTableConfig.mockReturnValue({
    page: 1,
    pageSize: 10,
    sortBy: "assignedDate",
    direction: 1,
    search: "",
  });

  const mockResponse = {
    data: {
      total: 1,
      data: [{ id: 5, note: "Direction -1" }],
    },
  };

  mockedAxios.get.mockResolvedValueOnce(mockResponse);

  const result = await homeAssignmentService.getMyAssignments({
    direction: -1,
  });

  expect(mockedAxios.get).toHaveBeenCalledWith("/home/my-assignment", {
    params: expect.objectContaining({
      direction: "desc",
    }),
  });

  expect(result.data).toEqual(mockResponse.data.data);
});

it("should fallback to 'descending' if direction is undefined or invalid type", async () => {
  mockedGetTableConfig.mockReturnValue({
    page: 1,
    pageSize: 10,
    sortBy: "assignedDate",
    direction: 1,
    search: "",
  });

  const mockResponse = {
    data: {
      total: 1,
      data: [{ id: 6, note: "Fallback case" }],
    },
  };

  mockedAxios.get.mockResolvedValueOnce(mockResponse);

  const result = await homeAssignmentService.getMyAssignments({
    direction: undefined as any,
  });

  expect(mockedAxios.get).toHaveBeenCalledWith("/home/my-assignment", {
    params: expect.objectContaining({
      direction: "asc",
    }),
  });

  expect(result.data).toEqual(mockResponse.data.data);
});

it("should fallback to 'descending' when direction is invalid type", async () => {
  mockedGetTableConfig.mockReturnValue({
    page: 1,
    pageSize: 10,
    sortBy: "assignedDate",
    direction: 1,
    search: "",
  });

  const mockResponse = {
    data: {
      total: 1,
      data: [{ id: 999, note: "Fallback on invalid direction" }],
    },
  };

  mockedAxios.get.mockResolvedValueOnce(mockResponse);

  const result = await homeAssignmentService.getMyAssignments({
    direction: {} as any, // truyền object để trigger fallback
  });

  expect(mockedAxios.get).toHaveBeenCalledWith("/home/my-assignment", {
    params: expect.objectContaining({
      direction: "desc",
    }),
  });

  expect(result.data).toEqual(mockResponse.data.data);
});

describe("getAssignmentDetail", () => {
  it("should return assignment detail", async () => {
    const mockData = { data: { data: { id: 1, note: "Detail" } } };
    mockedAxios.get.mockResolvedValueOnce(mockData);

    const result = await homeAssignmentService.getAssignmentDetail(1);

    expect(mockedAxios.get).toHaveBeenCalledWith("/home/my-assignment/1");
    expect(result).toEqual({ id: 1, note: "Detail" });
  });

  it("should throw error on failure", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("API failed"));

    await expect(homeAssignmentService.getAssignmentDetail(1)).rejects.toThrow("API failed");
  });
});

describe("acceptAssignment", () => {
  it("should call patch and return response", async () => {
    const mockData = { data: "Accepted" };
    mockedAxios.patch.mockResolvedValueOnce(mockData);

    const result = await homeAssignmentService.acceptAssignment(1);

    expect(mockedAxios.patch).toHaveBeenCalledWith("/home/my-assignment/1/accept");
    expect(result).toEqual("Accepted");
  });
});

describe("declineAssignment", () => {
  it("should call patch and return response", async () => {
    const mockData = { data: "Declined" };
    mockedAxios.patch.mockResolvedValueOnce(mockData);

    const result = await homeAssignmentService.declineAssignment(2);

    expect(mockedAxios.patch).toHaveBeenCalledWith("/home/my-assignment/2/decline");
    expect(result).toEqual("Declined");
  });
});

describe("returnAssignment", () => {
  it("should call post and return response", async () => {
    const mockData = { data: "Returned" };
    mockedAxios.post.mockResolvedValueOnce(mockData);

    const result = await homeAssignmentService.returnAssignment(3);

    expect(mockedAxios.post).toHaveBeenCalledWith("/home/my-assignment/3/returning-request");
    expect(result).toEqual("Returned");
  });
});
